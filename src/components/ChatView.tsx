import React, { useState, useRef, useEffect } from 'react';
import { AIMode, ChatMessage, EquationData, MovieData } from '../types';
import { MathRenderer } from './MathRenderer';
import { EquationGrapher } from './EquationGrapher';
import { AnimatedMoviePlayer } from './AnimatedMoviePlayer';
import {
  Send,
  Square,
  Sparkles,
  Calculator,
  Film,
  Menu,
  Copy,
  Check,
  Volume2,
  VolumeX,
  RotateCcw,
  Download,
  Share2,
  ChevronDown,
  Layers,
  Mic,
  MicOff,
} from 'lucide-react';

interface ChatViewProps {
  messages: ChatMessage[];
  onSendMessage: (text: string, mode: AIMode) => void;
  onStopGeneration?: () => void;
  isGenerating: boolean;
  currentMode: AIMode;
  onChangeMode: (mode: AIMode) => void;
  onToggleSidebar: () => void;
  activeSessionTitle: string;
  onOpenPlayStore: () => void;
}

export const ChatView: React.FC<ChatViewProps> = ({
  messages,
  onSendMessage,
  onStopGeneration,
  isGenerating,
  currentMode,
  onChangeMode,
  onToggleSidebar,
  activeSessionTitle,
  onOpenPlayStore,
}) => {
  const [inputText, setInputText] = useState('');
  const [showFormulaDrawer, setShowFormulaDrawer] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Auto-scroll when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isGenerating]);

  // Handle textarea resize
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  }, [inputText]);

  // Submit message
  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || isGenerating) return;

    onSendMessage(inputText.trim(), currentMode);
    setInputText('');
    setShowFormulaDrawer(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Copy assistant response
  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Text to Speech
  const handleReadAloud = (id: string, text: string) => {
    if ('speechSynthesis' in window) {
      if (speakingId === id) {
        window.speechSynthesis.cancel();
        setSpeakingId(null);
        return;
      }
      window.speechSynthesis.cancel();
      // Remove math markers for speech
      const cleaned = text.replace(/(\$\$[\s\S]+?\$\$|\$[^\$]+?\$)/g, ' mathematical equation ').replace(/[#*_`]/g, '');
      const utterance = new SpeechSynthesisUtterance(cleaned);
      utterance.rate = 1.0;
      utterance.onend = () => setSpeakingId(null);
      utterance.onerror = () => setSpeakingId(null);
      setSpeakingId(id);
      window.speechSynthesis.speak(utterance);
    }
  };

  // Speech Recognition (Voice input)
  const toggleSpeechRecognition = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputText((prev) => (prev ? `${prev} ${transcript}` : transcript));
      };

      recognition.start();
    } catch (e) {
      setIsListening(false);
    }
  };

  // Formula insertion helper
  const insertFormulaSymbol = (sym: string) => {
    setInputText((prev) => `${prev}${sym}`);
    textareaRef.current?.focus();
  };

  // Export transcript
  const handleExportTranscript = () => {
    const transcript = messages
      .map((m) => `[${m.role.toUpperCase()}]\n${m.content}\n`)
      .join('\n---\n\n');
    const blob = new Blob([transcript], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aetheris_chat_${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const mathSymbols = [
    { label: 'Integral', sym: '\\int_{a}^{b} f(x) dx' },
    { label: 'Sum', sym: '\\sum_{i=1}^{n} ' },
    { label: 'Derivative', sym: '\\frac{d^2 y}{dx^2}' },
    { label: 'Partial', sym: '\\frac{\\partial \\psi}{\\partial t}' },
    { label: 'Fraction', sym: '\\frac{a}{b}' },
    { label: 'Square Root', sym: '\\sqrt{x}' },
    { label: 'Infinity', sym: '\\infty' },
    { label: 'Pi', sym: '\\pi' },
    { label: 'Theta', sym: '\\theta' },
    { label: 'Nabla', sym: '\\nabla' },
    { label: 'Matrix', sym: '\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}' },
  ];

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50/50 dark:bg-slate-950 overflow-hidden relative">
      {/* Top Bar Contract (3 zones separated by gap-8: 1-line brand/breadcrumb, nav tabs, 1 action) */}
      <header className="flex items-center justify-between gap-8 px-4 md:px-6 py-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-blue-100 dark:border-blue-950/80 z-10 shrink-0">
        {/* Zone 1: Brand / Title */}
        <div className="flex items-center gap-3 whitespace-nowrap shrink-0">
          <button
            onClick={onToggleSidebar}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Toggle Sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2">
            <span className="text-sm font-bold tracking-tight text-blue-950 dark:text-blue-100 whitespace-nowrap">
              Smart x
            </span>
            <span className="text-slate-300 dark:text-slate-700">/</span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate max-w-[140px] sm:max-w-xs">
              {activeSessionTitle || 'New Session'}
            </span>
          </div>
        </div>

        {/* Zone 2: Mode Selector Nav Tabs */}
        <nav className="hidden sm:flex items-center gap-1 p-1 bg-blue-50/70 dark:bg-blue-950/40 rounded-xl border border-blue-100 dark:border-blue-900/50">
          <button
            onClick={() => onChangeMode('all')}
            className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              currentMode === 'all'
                ? 'bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-300'
            }`}
          >
            Universal Q&amp;A
          </button>
          <button
            onClick={() => onChangeMode('equation')}
            className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              currentMode === 'equation'
                ? 'bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-300'
            }`}
          >
            Equation Solver
          </button>
          <button
            onClick={() => onChangeMode('movie')}
            className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              currentMode === 'movie'
                ? 'bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-300'
            }`}
          >
            Animated Movie
          </button>
        </nav>

        {/* Zone 3: Actions */}
        <div className="flex items-center gap-2 whitespace-nowrap shrink-0">
          <button
            onClick={onOpenPlayStore}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-700 hover:to-sky-700 rounded-lg shadow-xs hover:shadow-sm transition-all cursor-pointer"
            title="Open on Google Play Store & Android"
          >
            {/* Play store icon */}
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
              <path d="M3.6 1.9c-.3.3-.4.8-.4 1.4v17.4c0 .6.1 1.1.4 1.4l9.1-9.7L3.6 1.9z" fill="#00C4FF" />
              <path d="M16.5 8.6L12.7 12.4l3.8 3.8 4.3-2.5c1.2-.7 1.2-1.9 0-2.6l-4.3-2.5z" fill="#FFC900" />
              <path d="M3.6 22.1c.4.4 1.1.5 1.8.1l11.1-6.4-3.8-3.8-9.1 10.1z" fill="#FF3A44" />
              <path d="M3.6 1.9l9.1 10.5 3.8-3.8L5.4 2.2C4.7 1.8 4 1.9 3.6 1.9z" fill="#00E676" />
            </svg>
            <span>Play Store</span>
          </button>

          <button
            onClick={handleExportTranscript}
            disabled={messages.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-40 cursor-pointer border border-slate-200 dark:border-slate-700"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Export</span>
          </button>
        </div>
      </header>

      {/* Main Conversation Stream */}
      <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 space-y-6">
        {messages.length === 0 ? (
          /* Welcome Hero Canvas */
          <div className="max-w-3xl mx-auto py-10 text-center space-y-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-700 via-blue-600 to-sky-400 text-white shadow-xl shadow-blue-500/25 text-2xl font-bold tracking-tight">
              S<span className="text-sky-200">x</span>
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl md:text-3xl font-bold text-blue-950 dark:text-blue-50 tracking-tight">
                Welcome to Smart x
              </h2>
              <p className="text-sm md:text-base text-slate-600 dark:text-slate-300 max-w-xl mx-auto leading-relaxed">
                The intelligence companion designed to solve complex equations with step-by-step proofs &amp; graphs, direct and play animated movies, and answer every question.
              </p>
            </div>

            {/* 3 Core Interactive Capabilities */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left pt-4">
              {/* Card 1: Math & Equations */}
              <button
                onClick={() => {
                  onChangeMode('equation');
                  onSendMessage('Solve the Schrödinger equation for a quantum harmonic oscillator with step-by-step derivation and plot', 'equation');
                }}
                className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-blue-100 dark:border-blue-900/40 hover:border-blue-300 dark:hover:border-blue-700 shadow-xs hover:shadow-md transition-all group cursor-pointer"
              >
                <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 w-fit mb-3 group-hover:scale-105 transition-transform">
                  <Calculator className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                  Complex Equations
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-3">
                  Step-by-step calculus, quantum physics, differential equations, and interactive parameter plots.
                </p>
                <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1">
                  Explore Schrödinger &rarr;
                </span>
              </button>

              {/* Card 2: Animated Movie Studio */}
              <button
                onClick={() => {
                  onChangeMode('movie');
                  onSendMessage('Build an animated movie: Nebula Odyssey - Scout robot discovers an ancient luminous crystal on an icy moon', 'movie');
                }}
                className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-blue-100 dark:border-blue-900/40 hover:border-blue-300 dark:hover:border-blue-700 shadow-xs hover:shadow-md transition-all group cursor-pointer"
              >
                <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 w-fit mb-3 group-hover:scale-105 transition-transform">
                  <Film className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                  Animated Movie Studio
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-3">
                  Generates full multi-scene animated movies with live 60fps canvas actors, audio synth, and dialogue.
                </p>
                <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1">
                  Play Nebula Odyssey &rarr;
                </span>
              </button>

              {/* Card 3: Universal Q&A */}
              <button
                onClick={() => {
                  onChangeMode('all');
                  onSendMessage('Explain how general relativity connects spacetime curvature to gravitational lensing with observational proofs', 'all');
                }}
                className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-blue-100 dark:border-blue-900/40 hover:border-blue-300 dark:hover:border-blue-700 shadow-xs hover:shadow-md transition-all group cursor-pointer"
              >
                <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 w-fit mb-3 group-hover:scale-105 transition-transform">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                  Answers to Everything
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-3">
                  In-depth reasoning across science, technology, code, philosophy, history, and creative domains.
                </p>
                <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1">
                  Ask Spacetime &rarr;
                </span>
              </button>
            </div>
          </div>
        ) : (
          /* Message List */
          <div className="max-w-3xl mx-auto space-y-6">
            {messages.map((message) => {
              const isUser = message.role === 'user';

              return (
                <div
                  key={message.id}
                  className={`flex gap-3 md:gap-4 ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  {/* Assistant Avatar */}
                  {!isUser && (
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-700 to-sky-500 text-white flex items-center justify-center shrink-0 font-bold text-xs shadow-md shadow-blue-500/20 mt-1 tracking-tight">
                      S<span className="text-sky-200">x</span>
                    </div>
                  )}

                  {/* Message Body */}
                  <div
                    className={`max-w-[88%] md:max-w-[82%] rounded-2xl p-4 md:p-5 shadow-xs ${
                      isUser
                        ? 'bg-blue-600 text-white rounded-tr-xs'
                        : 'bg-white dark:bg-slate-900 border border-blue-100 dark:border-blue-950 text-slate-900 dark:text-slate-100 rounded-tl-xs'
                    }`}
                  >
                    {isUser ? (
                      <p className="text-sm md:text-[15px] whitespace-pre-wrap leading-relaxed">
                        {message.content}
                      </p>
                    ) : (
                      <div className="space-y-4">
                        {/* Text / Markdown with KaTeX math */}
                        <MathRenderer content={message.content} />

                        {/* Interactive Equation Solver View (if attached) */}
                        {message.equationData && (
                          <div className="space-y-4 pt-2">
                            {/* Step Breakdown Cards */}
                            {message.equationData.steps && message.equationData.steps.length > 0 && (
                              <div className="space-y-2.5">
                                <h4 className="text-xs font-bold text-blue-950 dark:text-blue-200 uppercase tracking-wider">
                                  Step-by-Step Derivation:
                                </h4>
                                {message.equationData.steps.map((st) => (
                                  <div
                                    key={st.stepNumber}
                                    className="p-3.5 rounded-xl bg-blue-50/50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 text-xs md:text-sm space-y-1.5"
                                  >
                                    <div className="font-semibold text-blue-900 dark:text-blue-300">
                                      Step {st.stepNumber}: {st.title}
                                    </div>
                                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                                      {st.explanation}
                                    </p>
                                    {st.formula && (
                                      <div className="pt-1 overflow-x-auto text-center">
                                        <MathRenderer content={`$$${st.formula}$$`} />
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Live Interactive Grapher */}
                            {message.equationData.plot && message.equationData.plot.canPlot && (
                              <EquationGrapher
                                plotConfig={message.equationData.plot}
                                title={message.equationData.title}
                                formulaLatex={message.equationData.latexSolution}
                              />
                            )}
                          </div>
                        )}

                        {/* Interactive Animated Movie Player (if attached) */}
                        {message.movieData && (
                          <div className="pt-2">
                            <AnimatedMoviePlayer movieData={message.movieData} />
                          </div>
                        )}

                        {/* Assistant Action Bar */}
                        <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-blue-950 text-xs text-slate-400">
                          <button
                            onClick={() => handleCopy(message.id, message.content)}
                            className="flex items-center gap-1 px-2 py-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                            title="Copy response"
                          >
                            {copiedId === message.id ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-500" />
                                <span className="text-emerald-500">Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                <span>Copy</span>
                              </>
                            )}
                          </button>

                          <button
                            onClick={() => handleReadAloud(message.id, message.content)}
                            className={`flex items-center gap-1 px-2 py-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer ${
                              speakingId === message.id ? 'text-blue-600 dark:text-blue-400 font-semibold' : ''
                            }`}
                            title="Read Aloud"
                          >
                            {speakingId === message.id ? (
                              <>
                                <VolumeX className="w-3.5 h-3.5 text-rose-500" />
                                <span>Stop Reading</span>
                              </>
                            ) : (
                              <>
                                <Volume2 className="w-3.5 h-3.5" />
                                <span>Read Aloud</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* User Avatar */}
                  {isUser && (
                    <div className="w-8 h-8 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center shrink-0 font-medium text-xs mt-1">
                      You
                    </div>
                  )}
                </div>
              );
            })}

            {/* Generating Typing Indicator */}
            {isGenerating && (
              <div className="flex gap-3 items-center text-slate-500 dark:text-slate-400 text-xs py-2">
                <div className="w-7 h-7 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xs tracking-tight animate-pulse">
                  Sx
                </div>
                <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 px-3.5 py-2 rounded-xl border border-blue-100 dark:border-blue-900">
                  <span className="w-2 h-2 rounded-full bg-blue-600 animate-bounce" />
                  <span className="w-2 h-2 rounded-full bg-blue-600 animate-bounce [animation-delay:0.2s]" />
                  <span className="w-2 h-2 rounded-full bg-blue-600 animate-bounce [animation-delay:0.4s]" />
                  <span className="ml-2 font-medium">Smart x is thinking &amp; formulating...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Formula Drawer Pill Menu (for equation mode) */}
      {showFormulaDrawer && (
        <div className="max-w-3xl mx-auto w-full px-4 mb-2">
          <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-900 shadow-lg flex flex-wrap gap-1.5 animate-fadeIn">
            <span className="text-[11px] font-semibold text-slate-400 self-center px-1">
              Insert Formula:
            </span>
            {mathSymbols.map((item) => (
              <button
                key={item.label}
                onClick={() => insertFormulaSymbol(` $${item.sym}$ `)}
                className="px-2 py-1 text-xs font-mono rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors"
                title={item.label}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Bottom Input Area */}
      <div className="p-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-t border-blue-100 dark:border-blue-950 shrink-0">
        <div className="max-w-3xl mx-auto space-y-2">
          <form
            onSubmit={handleSubmit}
            className="relative flex items-end gap-2 p-2 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-blue-200 dark:border-blue-900 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 shadow-xs transition-all"
          >
            {/* Quick helper controls inside input */}
            <div className="flex items-center gap-1 pl-1 pb-1">
              <button
                type="button"
                onClick={() => setShowFormulaDrawer(!showFormulaDrawer)}
                title="Math & Equation Symbols"
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  showFormulaDrawer
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                    : 'text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-white dark:hover:bg-slate-900'
                }`}
              >
                <Calculator className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={toggleSpeechRecognition}
                title={isListening ? 'Stop listening' : 'Voice Input'}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  isListening
                    ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-600 animate-pulse'
                    : 'text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-white dark:hover:bg-slate-900'
                }`}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
            </div>

            {/* Autosizing Textarea */}
            <textarea
              ref={textareaRef}
              rows={1}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                currentMode === 'equation'
                  ? 'Ask any complex equation, differential equation, calculus, or physics problem...'
                  : currentMode === 'movie'
                  ? 'Describe an animated movie to build (characters, plot, art style)...'
                  : 'Ask anything: equations, animated movies, deep scientific answers, or code...'
              }
              className="flex-1 max-h-44 py-1.5 px-2 bg-transparent text-sm md:text-[15px] text-slate-900 dark:text-slate-100 placeholder:text-slate-400 resize-none focus:outline-hidden leading-relaxed"
            />

            {/* Action Send / Stop Button */}
            <div className="pb-1 pr-1">
              {isGenerating ? (
                <button
                  type="button"
                  onClick={onStopGeneration}
                  className="flex items-center justify-center w-8 h-8 rounded-xl bg-slate-800 text-white hover:bg-slate-700 transition-colors cursor-pointer"
                  title="Stop generating"
                >
                  <Square className="w-3.5 h-3.5 fill-current" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  className="flex items-center justify-center w-8 h-8 rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40 disabled:hover:bg-blue-600 transition-colors shadow-sm cursor-pointer"
                  title="Send message"
                >
                  <Send className="w-4 h-4" />
                </button>
              )}
            </div>
          </form>

          {/* Micro Footer Notice */}
          <div className="flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 px-2">
            <span>
              Mode: <strong className="text-blue-600 dark:text-blue-400 capitalize">{currentMode}</strong>
            </span>
            <span>Smart x · Blue &amp; White Intelligence</span>
          </div>
        </div>
      </div>
    </div>
  );
};
