import React from 'react';
import { AIMode, ChatSession } from '../types';
import {
  Plus,
  MessageSquare,
  Calculator,
  Film,
  Sparkles,
  Trash2,
  Moon,
  Sun,
  X,
  Compass,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: ChatSession[];
  activeSessionId: string;
  onSelectSession: (id: string) => void;
  onNewChat: (mode?: AIMode) => void;
  onDeleteSession: (id: string) => void;
  onClearAll: () => void;
  currentMode: AIMode;
  onChangeMode: (mode: AIMode) => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  onSelectQuickPrompt: (prompt: string, mode: AIMode) => void;
  onOpenPlayStore: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  sessions,
  activeSessionId,
  onSelectSession,
  onNewChat,
  onDeleteSession,
  onClearAll,
  currentMode,
  onChangeMode,
  isDarkMode,
  onToggleTheme,
  onSelectQuickPrompt,
  onOpenPlayStore,
}) => {
  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-50 w-72 flex flex-col bg-white dark:bg-slate-950 border-r border-blue-100 dark:border-blue-950 transition-transform duration-300 ease-in-out shrink-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between p-4 border-b border-blue-100 dark:border-blue-950/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-700 via-blue-600 to-sky-400 text-white flex items-center justify-center shadow-md shadow-blue-500/20 font-bold text-sm tracking-tight">
              S<span className="text-sky-200">x</span>
            </div>
            <div>
              <h1 className="text-sm font-bold text-blue-950 dark:text-blue-100 tracking-tight leading-none">
                Smart x
              </h1>
              <p className="text-[11px] text-blue-600/80 dark:text-blue-400 font-medium mt-0.5">
                Math · Movies · Intelligence
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Primary New Chat CTA */}
        <div className="p-3">
          <button
            onClick={() => {
              onNewChat(currentMode);
              if (window.innerWidth < 1024) onClose();
            }}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm hover:shadow-md transition-all duration-150 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Conversation</span>
          </button>
        </div>

        {/* Mode Selector Segmented Control */}
        <div className="px-3 pb-2">
          <div className="p-1 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/50 flex flex-col gap-1">
            <button
              onClick={() => onChangeMode('all')}
              className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors text-left cursor-pointer ${
                currentMode === 'all'
                  ? 'bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-300 shadow-xs border border-blue-200/50 dark:border-blue-800'
                  : 'text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-300'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
              <div className="truncate">
                <span className="block font-semibold">Universal Q&amp;A</span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-normal">
                  Answers to every question
                </span>
              </div>
            </button>

            <button
              onClick={() => onChangeMode('equation')}
              className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors text-left cursor-pointer ${
                currentMode === 'equation'
                  ? 'bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-300 shadow-xs border border-blue-200/50 dark:border-blue-800'
                  : 'text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-300'
              }`}
            >
              <Calculator className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
              <div className="truncate">
                <span className="block font-semibold">Equation Solver</span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-normal">
                  LaTeX &amp; interactive plots
                </span>
              </div>
            </button>

            <button
              onClick={() => onChangeMode('movie')}
              className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors text-left cursor-pointer ${
                currentMode === 'movie'
                  ? 'bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-300 shadow-xs border border-blue-200/50 dark:border-blue-800'
                  : 'text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-300'
              }`}
            >
              <Film className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
              <div className="truncate">
                <span className="block font-semibold">Animated Movie</span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-normal">
                  60fps canvas scene studio
                </span>
              </div>
            </button>
          </div>
        </div>

        {/* Featured Starter Prompts */}
        <div className="px-3 py-2 border-t border-blue-50 dark:border-blue-950/50">
          <div className="flex items-center gap-1.5 px-1 mb-1.5 text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            <Compass className="w-3 h-3" />
            <span>Curated Prompts</span>
          </div>

          <div className="space-y-1">
            <button
              onClick={() => onSelectQuickPrompt('Solve the Schrödinger equation for a quantum harmonic oscillator with step-by-step derivation and plot', 'equation')}
              className="w-full text-left px-2.5 py-1.5 rounded-lg text-[11px] text-slate-600 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:text-blue-700 dark:hover:text-blue-300 transition-colors truncate"
            >
              📐 Schrödinger Wave Equation
            </button>
            <button
              onClick={() => onSelectQuickPrompt('Build an animated movie: Nebula Odyssey - Scout robot discovers an ancient luminous crystal on an icy moon', 'movie')}
              className="w-full text-left px-2.5 py-1.5 rounded-lg text-[11px] text-slate-600 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:text-blue-700 dark:hover:text-blue-300 transition-colors truncate"
            >
              🎬 Sci-Fi Space Animated Movie
            </button>
            <button
              onClick={() => onSelectQuickPrompt('Derive the damped harmonic oscillator ODE under viscous friction with live graphing parameter slider', 'equation')}
              className="w-full text-left px-2.5 py-1.5 rounded-lg text-[11px] text-slate-600 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:text-blue-700 dark:hover:text-blue-300 transition-colors truncate"
            >
              📐 Damped Oscillator ODE
            </button>
            <button
              onClick={() => onSelectQuickPrompt('Build an animated movie: Neon Drift 2099 - A delivery android dodging drone sentries in a rainy cyberpunk city', 'movie')}
              className="w-full text-left px-2.5 py-1.5 rounded-lg text-[11px] text-slate-600 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:text-blue-700 dark:hover:text-blue-300 transition-colors truncate"
            >
              🎬 Cyberpunk City Short Film
            </button>
            <button
              onClick={() => onSelectQuickPrompt('Explain how general relativity connects spacetime curvature to gravitational lensing with observational proofs', 'all')}
              className="w-full text-left px-2.5 py-1.5 rounded-lg text-[11px] text-slate-600 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:text-blue-700 dark:hover:text-blue-300 transition-colors truncate"
            >
              💡 Gravitational Lensing &amp; Relativity
            </button>
          </div>
        </div>

        {/* Recent Conversations List */}
        <div className="flex-1 overflow-y-auto px-3 py-2 border-t border-blue-50 dark:border-blue-950/50">
          <div className="flex items-center justify-between px-1 mb-2">
            <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Recent Chats
            </span>
            {sessions.length > 0 && (
              <button
                onClick={onClearAll}
                className="text-[11px] text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 transition-colors"
                title="Clear all chats"
              >
                Clear
              </button>
            )}
          </div>

          {sessions.length === 0 ? (
            <div className="px-2 py-4 text-center text-xs text-slate-400 dark:text-slate-500">
              No recent chats yet
            </div>
          ) : (
            <div className="space-y-1">
              {sessions.map((s) => {
                const isActive = s.id === activeSessionId;
                return (
                  <div
                    key={s.id}
                    className={`group flex items-center justify-between px-2.5 py-2 rounded-xl text-xs transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-200 font-medium'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900'
                    }`}
                    onClick={() => {
                      onSelectSession(s.id);
                      if (window.innerWidth < 1024) onClose();
                    }}
                  >
                    <div className="flex items-center gap-2 truncate">
                      {s.mode === 'equation' ? (
                        <Calculator className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                      ) : s.mode === 'movie' ? (
                        <Film className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                      ) : (
                        <MessageSquare className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                      )}
                      <span className="truncate">{s.title || 'Untitled Session'}</span>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteSession(s.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:text-rose-500 dark:hover:text-rose-400 transition-opacity"
                      title="Delete chat"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Google Play Store Banner */}
        <div className="p-3 border-t border-blue-50 dark:border-blue-950/60">
          <button
            onClick={onOpenPlayStore}
            className="w-full flex items-center justify-between p-2.5 rounded-xl bg-gradient-to-r from-blue-50 to-sky-50 dark:from-blue-950/40 dark:to-slate-900 border border-blue-200/60 dark:border-blue-900/40 hover:border-blue-400 dark:hover:border-blue-700 transition-all cursor-pointer text-left group"
          >
            <div className="flex items-center gap-2.5 truncate">
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                <path d="M3.6 1.9c-.3.3-.4.8-.4 1.4v17.4c0 .6.1 1.1.4 1.4l9.1-9.7L3.6 1.9z" fill="#00C4FF" />
                <path d="M16.5 8.6L12.7 12.4l3.8 3.8 4.3-2.5c1.2-.7 1.2-1.9 0-2.6l-4.3-2.5z" fill="#FFC900" />
                <path d="M3.6 22.1c.4.4 1.1.5 1.8.1l11.1-6.4-3.8-3.8-9.1 10.1z" fill="#FF3A44" />
                <path d="M3.6 1.9l9.1 10.5 3.8-3.8L5.4 2.2C4.7 1.8 4 1.9 3.6 1.9z" fill="#00E676" />
              </svg>
              <div className="truncate">
                <span className="block text-xs font-bold text-slate-800 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                  Google Play Store
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                  4.9 ★ · Android App
                </span>
              </div>
            </div>
            <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 shrink-0">
              Open &rarr;
            </span>
          </button>
        </div>

        {/* Footer info & Theme Switcher */}
        <div className="p-3 border-t border-blue-100 dark:border-blue-950/80 bg-slate-50/50 dark:bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={onToggleTheme}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-900 border border-slate-200 dark:border-slate-800 transition-colors"
            >
              {isDarkMode ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-blue-600" />}
              <span>{isDarkMode ? 'Light Blue' : 'Midnight'}</span>
            </button>
          </div>

          <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500">
            Gemini 3.8 Flash
          </span>
        </div>
      </aside>
    </>
  );
};
