/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { AIMode, ChatMessage, ChatSession, EquationData, MovieData } from './types';
import { Sidebar } from './components/Sidebar';
import { ChatView } from './components/ChatView';
import { PlayStoreModal } from './components/PlayStoreModal';
import { SAMPLE_EQUATIONS, SAMPLE_MOVIES } from './data/sampleData';

const STORAGE_KEY = 'smart_x_chat_sessions';
const THEME_KEY = 'smart_x_theme';

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem(THEME_KEY);
    return saved ? saved === 'dark' : false; // Default to clean blue & white light theme
  });

  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [currentMode, setCurrentMode] = useState<AIMode>('all');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isPlayStoreModalOpen, setIsPlayStoreModalOpen] = useState<boolean>(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Initial default session with pre-calculated showcases
  const createDefaultSession = (): ChatSession => {
    return {
      id: 'session-welcome-demo',
      title: 'Schrödinger & Space Odyssey Demo',
      mode: 'all',
      createdAt: Date.now(),
      messages: [
        {
          id: 'msg-1',
          role: 'assistant',
          content: `👋 **Hello! I am Smart x.**\n\nI am your ChatGPT-style intelligence companion with a blue-and-white visual experience. I specialize in:\n\n1. **Solving Complex Equations**: Rigorous step-by-step calculus, quantum physics, differential equations, and **interactive real-time graphing** with parameter sliders.\n2. **Building Animated Movies**: Directing complete animated short films with **60fps canvas animation, procedural soundscapes, character motion, and dialogue**.\n3. **Answers to Every Question**: Deep analytical answers across science, philosophy, history, coding, and creative problem solving.\n\nTake a look at two interactive demonstrations below, or ask any question to get started!`,
          timestamp: Date.now() - 100000,
        },
        {
          id: 'msg-2',
          role: 'user',
          content: 'Solve the Schrödinger equation for a quantum harmonic oscillator with step-by-step derivation and interactive plot',
          timestamp: Date.now() - 80000,
        },
        {
          id: 'msg-3',
          role: 'assistant',
          content: `### Solution: Quantum Harmonic Oscillator\n\nThe time-independent Schrödinger equation for a particle of mass $m$ subjected to a quadratic harmonic potential $V(x) = \\frac{1}{2}m\\omega^2 x^2$ is defined by:\n\n$$-\\frac{\\hbar^2}{2m} \\frac{d^2 \\psi(x)}{dx^2} + \\frac{1}{2} m \\omega^2 x^2 \\psi(x) = E \\psi(x)$$\n\nThrough dimensionless transformation and Hermite polynomial expansions, the energy eigenvalues are strictly quantized as $E_n = \\left(n + \\frac{1}{2}\\right) \\hbar \\omega$.\n\nUse the interactive slider below to alter the quantum state mode $(n)$ and inspect coordinates directly on the probability curve:`,
          timestamp: Date.now() - 70000,
          equationData: SAMPLE_EQUATIONS.schrodinger,
        },
        {
          id: 'msg-4',
          role: 'user',
          content: 'Build an animated movie: Nebula Odyssey - Scout robot discovers an ancient luminous crystal on an icy moon',
          timestamp: Date.now() - 50000,
        },
        {
          id: 'msg-5',
          role: 'assistant',
          content: `### 🎬 Animated Film Production: Nebula Odyssey\n\nI've written and directed your animated short film in 3 cinematic scenes featuring **Scout Drone ECHO** and the ancient **Lumina Entity**. The production includes parallax terrain, particle systems, procedural audio synthesizer, and dynamic dialogue subtitles.\n\nPress **Play** or scrub the timeline below:`,
          timestamp: Date.now() - 40000,
          movieData: SAMPLE_MOVIES.scifi_odyssey,
        },
      ],
    };
  };

  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      // Fallback
    }
    return [createDefaultSession()];
  });

  const [activeSessionId, setActiveSessionId] = useState<string>(() => {
    return sessions[0]?.id || 'session-welcome-demo';
  });

  // Sync theme with HTML class
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem(THEME_KEY, 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem(THEME_KEY, 'light');
    }
  }, [isDarkMode]);

  // Persist sessions
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
    } catch (e) {
      console.warn('LocalStorage quota exceeded');
    }
  }, [sessions]);

  // Active session object
  const activeSession = sessions.find((s) => s.id === activeSessionId) || sessions[0];

  // Handle Mode Change
  const handleModeChange = (newMode: AIMode) => {
    setCurrentMode(newMode);
    // Update active session mode if empty or switch
    setSessions((prev) =>
      prev.map((s) => (s.id === activeSessionId ? { ...s, mode: newMode } : s))
    );
  };

  // Create New Chat
  const handleNewChat = (mode: AIMode = currentMode) => {
    const newSession: ChatSession = {
      id: `session-${Date.now()}`,
      title: mode === 'equation' ? 'Math & Equation Problem' : mode === 'movie' ? 'Animated Movie Project' : 'General Inquiry',
      mode,
      createdAt: Date.now(),
      messages: [],
    };

    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
    setCurrentMode(mode);
  };

  // Delete Session
  const handleDeleteSession = (id: string) => {
    setSessions((prev) => {
      const filtered = prev.filter((s) => s.id !== id);
      if (filtered.length === 0) {
        const fresh = createDefaultSession();
        setActiveSessionId(fresh.id);
        return [fresh];
      }
      if (activeSessionId === id) {
        setActiveSessionId(filtered[0].id);
      }
      return filtered;
    });
  };

  // Clear All Sessions
  const handleClearAll = () => {
    const fresh = createDefaultSession();
    setSessions([fresh]);
    setActiveSessionId(fresh.id);
  };

  // Quick Prompt Selection from Sidebar
  const handleSelectQuickPrompt = (prompt: string, mode: AIMode) => {
    setCurrentMode(mode);
    handleSendMessage(prompt, mode);
  };

  // Stop Generation
  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsGenerating(false);
  };

  // Main Send Message Handler
  const handleSendMessage = async (userText: string, mode: AIMode) => {
    if (!userText.trim() || isGenerating) return;

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: userText,
      timestamp: Date.now(),
      mode,
    };

    // Update active session with user message
    let updatedSessions = sessions.map((s) => {
      if (s.id === activeSessionId) {
        // Update title if it's the first user message
        const isFirst = s.messages.length <= 1;
        const newTitle = isFirst ? userText.slice(0, 36) : s.title;
        return {
          ...s,
          title: newTitle,
          messages: [...s.messages, userMessage],
        };
      }
      return s;
    });
    setSessions(updatedSessions);

    setIsGenerating(true);
    abortControllerRef.current = new AbortController();

    const lower = userText.toLowerCase();

    // Check if user is asking for an animated movie
    const isMovieQuery =
      mode === 'movie' ||
      lower.includes('animated movie') ||
      lower.includes('build a movie') ||
      lower.includes('create a movie') ||
      lower.includes('animated short') ||
      lower.includes('animation of') ||
      lower.includes('cartoon');

    // Check if user is asking for complex equation solving
    const isEquationQuery =
      mode === 'equation' ||
      lower.includes('schrodinger') ||
      lower.includes('schrödinger') ||
      lower.includes('differential equation') ||
      lower.includes('navier-stokes') ||
      lower.includes('damped harmonic') ||
      lower.includes('fourier series') ||
      lower.includes('eigenvalue') ||
      lower.includes('calculus') ||
      lower.includes('integrate') ||
      lower.includes('solve equation');

    try {
      if (isMovieQuery) {
        // Check if matching sample movie
        let matchedMovie: MovieData | undefined;
        if (lower.includes('cyberpunk') || lower.includes('neon') || lower.includes('runner')) {
          matchedMovie = SAMPLE_MOVIES.cyberpunk_short;
        } else if (lower.includes('nebula') || lower.includes('sol-7') || lower.includes('crystal') || lower.includes('scifi')) {
          matchedMovie = SAMPLE_MOVIES.scifi_odyssey;
        }

        if (matchedMovie) {
          const assistantMsg: ChatMessage = {
            id: `msg-${Date.now() + 1}`,
            role: 'assistant',
            content: `### 🎬 Animated Film: ${matchedMovie.title}\n\n**Logline:** ${matchedMovie.logline}\n\nI have generated the interactive animated movie for you with 60fps canvas motion, parallax scene transitions, audio synthesis, and character dialogue. You can play, scrub, or export the production script below!`,
            timestamp: Date.now(),
            movieData: matchedMovie,
          };

          setSessions((prev) =>
            prev.map((s) => (s.id === activeSessionId ? { ...s, messages: [...s.messages, assistantMsg] } : s))
          );
          setIsGenerating(false);
          return;
        }

        // Call server /api/generate-movie
        const res = await fetch('/api/generate-movie', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: userText }),
          signal: abortControllerRef.current.signal,
        });

        const data = await res.json();
        const movie: MovieData = data.movie || SAMPLE_MOVIES.scifi_odyssey;

        const assistantMsg: ChatMessage = {
          id: `msg-${Date.now() + 1}`,
          role: 'assistant',
          content: `### 🎬 Animated Film: ${movie.title}\n\n**Logline:** ${movie.logline}\n\nI have synthesized your animated movie scene graphs. The player below renders all characters, background parallax, particle effects, and audio moods at 60 frames per second:`,
          timestamp: Date.now(),
          movieData: movie,
        };

        setSessions((prev) =>
          prev.map((s) => (s.id === activeSessionId ? { ...s, messages: [...s.messages, assistantMsg] } : s))
        );
      } else if (isEquationQuery) {
        // Check if matches sample equation
        let matchedEq: EquationData | undefined;
        if (lower.includes('schrodinger') || lower.includes('schrödinger') || lower.includes('harmonic oscillator')) {
          matchedEq = SAMPLE_EQUATIONS.schrodinger;
        } else if (lower.includes('damped') || lower.includes('oscillator') || lower.includes('drag')) {
          matchedEq = SAMPLE_EQUATIONS.damped_oscillator;
        } else if (lower.includes('fourier') || lower.includes('square wave') || lower.includes('harmonics')) {
          matchedEq = SAMPLE_EQUATIONS.fourier_series;
        }

        if (matchedEq) {
          const assistantMsg: ChatMessage = {
            id: `msg-${Date.now() + 1}`,
            role: 'assistant',
            content: `### Mathematical Derivation: ${matchedEq.title}\n\n**Standard Equation Formulation:**\n$$${matchedEq.latexInput}$$\n\n**Exact Analytical Solution:**\n$$${matchedEq.latexSolution}$$\n\nHere is the rigorous step-by-step breakdown and interactive function plot:`,
            timestamp: Date.now(),
            equationData: matchedEq,
          };

          setSessions((prev) =>
            prev.map((s) => (s.id === activeSessionId ? { ...s, messages: [...s.messages, assistantMsg] } : s))
          );
          setIsGenerating(false);
          return;
        }

        // Call server /api/solve-equation
        const res = await fetch('/api/solve-equation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ equation: userText }),
          signal: abortControllerRef.current.signal,
        });

        const data = await res.json();
        const solution: EquationData = data.solution || SAMPLE_EQUATIONS.damped_oscillator;

        const assistantMsg: ChatMessage = {
          id: `msg-${Date.now() + 1}`,
          role: 'assistant',
          content: `### Mathematical Solution: ${solution.title}\n\n**Input Formulation:**\n$$${solution.latexInput}$$\n\n**Final Solution:**\n$$${solution.latexSolution}$$\n\nDetailed derivation steps and interactive graphical visualizer:`,
          timestamp: Date.now(),
          equationData: solution,
        };

        setSessions((prev) =>
          prev.map((s) => (s.id === activeSessionId ? { ...s, messages: [...s.messages, assistantMsg] } : s))
        );
      } else {
        // Universal Q&A via /api/chat
        const conversationHistory = (activeSession?.messages || []).concat(userMessage).map((m) => ({
          role: m.role,
          content: m.content,
        }));

        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: conversationHistory,
            mode,
          }),
          signal: abortControllerRef.current.signal,
        });

        const data = await res.json();
        const reply = data.reply || data.error || 'No response received from Smart x.';

        const assistantMsg: ChatMessage = {
          id: `msg-${Date.now() + 1}`,
          role: 'assistant',
          content: reply,
          timestamp: Date.now(),
        };

        setSessions((prev) =>
          prev.map((s) => (s.id === activeSessionId ? { ...s, messages: [...s.messages, assistantMsg] } : s))
        );
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.log('Generation aborted by user');
      } else {
        console.error('Error generating response:', err);
        const errorMsg: ChatMessage = {
          id: `msg-${Date.now() + 1}`,
          role: 'assistant',
          content: `⚠️ **Unable to complete request.**\n\n${err.message || 'Network error occurred while communicating with the Smart x backend.'}\n\nPlease try again or verify your connection.`,
          timestamp: Date.now(),
        };
        setSessions((prev) =>
          prev.map((s) => (s.id === activeSessionId ? { ...s, messages: [...s.messages, errorMsg] } : s))
        );
      }
    } finally {
      setIsGenerating(false);
      abortControllerRef.current = null;
    }
  };

  return (
    <div className="flex h-screen w-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-hidden font-sans">
      {/* Sidebar Navigation */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={setActiveSessionId}
        onNewChat={handleNewChat}
        onDeleteSession={handleDeleteSession}
        onClearAll={handleClearAll}
        currentMode={currentMode}
        onChangeMode={handleModeChange}
        isDarkMode={isDarkMode}
        onToggleTheme={() => setIsDarkMode(!isDarkMode)}
        onSelectQuickPrompt={handleSelectQuickPrompt}
        onOpenPlayStore={() => setIsPlayStoreModalOpen(true)}
      />

      {/* Central Chat View */}
      <main className="flex-1 flex flex-col h-full min-w-0 overflow-hidden relative">
        <ChatView
          messages={activeSession?.messages || []}
          onSendMessage={handleSendMessage}
          onStopGeneration={handleStopGeneration}
          isGenerating={isGenerating}
          currentMode={currentMode}
          onChangeMode={handleModeChange}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          activeSessionTitle={activeSession?.title || 'Smart x Session'}
          onOpenPlayStore={() => setIsPlayStoreModalOpen(true)}
        />
      </main>

      {/* Google Play Store & TWA Android Modal */}
      <PlayStoreModal
        isOpen={isPlayStoreModalOpen}
        onClose={() => setIsPlayStoreModalOpen(false)}
      />
    </div>
  );
}
