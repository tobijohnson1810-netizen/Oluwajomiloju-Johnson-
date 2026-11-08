import React from 'react';
import { X, Download, ShieldCheck, Star, Smartphone, ExternalLink, CheckCircle2, Copy, Check } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PlayStoreModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PlayStoreModal: React.FC<PlayStoreModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [copied, setCopied] = React.useState(false);

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    if (isInstallable) {
      const success = await install();
      if (success) {
        onClose();
      }
    } else {
      // Direct intent for Google Play or Chrome add to home
      window.open('https://play.google.com/store/apps/details?id=com.smartx.ai', '_blank');
    }
  };

  const handleCopyPackage = () => {
    navigator.clipboard.writeText('com.smartx.ai');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
      {/* Backdrop click to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal Container */}
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-blue-100 dark:border-blue-900/60 overflow-hidden z-10 flex flex-col max-h-[90vh]">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 dark:bg-slate-950 border-b border-slate-100 dark:border-blue-950/80">
          <div className="flex items-center gap-2">
            {/* Google Play Tri-Color Icon */}
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M3.6 1.9c-.3.3-.4.8-.4 1.4v17.4c0 .6.1 1.1.4 1.4l9.1-9.7L3.6 1.9z" fill="#00C4FF" />
              <path d="M16.5 8.6L12.7 12.4l3.8 3.8 4.3-2.5c1.2-.7 1.2-1.9 0-2.6l-4.3-2.5z" fill="#FFC900" />
              <path d="M3.6 22.1c.4.4 1.1.5 1.8.1l11.1-6.4-3.8-3.8-9.1 10.1z" fill="#FF3A44" />
              <path d="M3.6 1.9l9.1 10.5 3.8-3.8L5.4 2.2C4.7 1.8 4 1.9 3.6 1.9z" fill="#00E676" />
            </svg>
            <span className="text-xs font-bold text-slate-700 dark:text-slate-200 tracking-wide uppercase">
              Google Play Store Listing
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* App Header Card */}
          <div className="flex items-start gap-4">
            <div className="w-18 h-18 rounded-2xl bg-gradient-to-tr from-blue-700 via-blue-600 to-sky-400 p-0.5 shadow-lg shadow-blue-500/20 shrink-0 flex items-center justify-center text-white text-3xl font-extrabold tracking-tight">
              S<span className="text-sky-200">x</span>
            </div>

            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
                Smart x
              </h2>
              <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 mt-0.5">
                Math Solver · Movie Studio · AI Q&amp;A
              </p>
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-1">
                <span>Smart x Technologies</span>
                <span>·</span>
                <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Verified
                </span>
              </div>
            </div>
          </div>

          {/* Play Store Stats Strip */}
          <div className="grid grid-cols-3 divide-x divide-slate-100 dark:divide-slate-800 py-3 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-blue-950/60 text-center">
            <div>
              <div className="flex items-center justify-center gap-1 font-bold text-slate-900 dark:text-white text-sm">
                4.9 <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              </div>
              <span className="text-[11px] text-slate-400">18.4K reviews</span>
            </div>
            <div>
              <div className="font-bold text-slate-900 dark:text-white text-sm">500K+</div>
              <span className="text-[11px] text-slate-400">Downloads</span>
            </div>
            <div>
              <div className="font-bold text-slate-900 dark:text-white text-sm">Rated 3+</div>
              <span className="text-[11px] text-slate-400">PEGI 3 · Everyone</span>
            </div>
          </div>

          {/* Primary Action Button */}
          <div>
            {isInstalled ? (
              <div className="w-full py-3 px-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center gap-2 text-sm font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Installed on this Device (Standalone Mode)</span>
              </div>
            ) : (
              <button
                onClick={handleInstallClick}
                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold text-sm shadow-lg shadow-blue-600/25 hover:shadow-xl transition-all duration-150 flex items-center justify-center gap-2.5 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>
                  {isInstallable
                    ? 'Install Smart x (One-Click Android/Play Store)'
                    : 'Open on Google Play Store'}
                </span>
              </button>
            )}
          </div>

          {/* Package Details & TWA Specs */}
          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Android Package &amp; TWA Specification
            </h3>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400">Package Name:</span>
                <div className="flex items-center gap-1.5 font-mono text-blue-600 dark:text-blue-400 font-medium">
                  <span>com.smartx.ai</span>
                  <button
                    onClick={handleCopyPackage}
                    title="Copy Package Name"
                    className="p-1 hover:text-blue-700 dark:hover:text-blue-300"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400">Target Platform:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  Android 15 (API Level 35) &amp; PWA
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400">Digital Asset Links:</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  /.well-known/assetlinks.json
                </span>
              </div>
            </div>
          </div>

          {/* Quick Home Screen Guide */}
          <div className="p-3.5 rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50 text-xs space-y-1.5">
            <div className="font-bold text-blue-950 dark:text-blue-200 flex items-center gap-1.5">
              <Smartphone className="w-4 h-4 text-blue-600" />
              <span>How to add directly to Home Screen:</span>
            </div>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              On Android Chrome or Samsung Internet, tap the <strong>three dots (⋮)</strong> in the top-right corner and select <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>. Smart x will launch standalone without browser borders!
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-blue-950 flex items-center justify-between text-xs text-slate-400">
          <span>Google Play Protect Verified</span>
          <a
            href="https://play.google.com/store/apps/details?id=com.smartx.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline font-medium"
          >
            <span>Play Store Link</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
};
