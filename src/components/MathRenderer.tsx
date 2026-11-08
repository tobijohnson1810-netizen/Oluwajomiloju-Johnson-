import React, { useMemo } from 'react';
import katex from 'katex';
import { Copy, Check } from 'lucide-react';

interface MathRendererProps {
  content: string;
  className?: string;
}

export const MathRenderer: React.FC<MathRendererProps> = ({ content, className = '' }) => {
  const [copiedCodeIndex, setCopiedCodeIndex] = React.useState<number | null>(null);

  const handleCopyCode = (code: string, index: number) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeIndex(index);
    setTimeout(() => setCopiedCodeIndex(null), 2000);
  };

  // Helper to render LaTeX string safely
  const renderLatex = (latex: string, displayMode: boolean): string => {
    try {
      return katex.renderToString(latex, {
        displayMode,
        throwOnError: false,
      });
    } catch (e) {
      return `<span class="text-rose-500 font-mono text-xs">${latex}</span>`;
    }
  };

  // Parse markdown into structured segments (paragraphs, code blocks, math, headers, lists)
  const renderedElements = useMemo(() => {
    if (!content) return null;

    // First split by code blocks ```
    const codeBlockRegex = /```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g;
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;
    let blockIndex = 0;

    while ((match = codeBlockRegex.exec(content)) !== null) {
      const textBefore = content.substring(lastIndex, match.index);
      if (textBefore) {
        parts.push(renderFormattedText(textBefore, `text-${blockIndex}`));
      }

      const lang = match[1] || 'code';
      const code = match[2];
      const curIndex = blockIndex;

      parts.push(
        <div key={`code-${curIndex}`} className="my-4 rounded-xl overflow-hidden border border-slate-200 dark:border-blue-900/60 bg-slate-900 text-slate-100 shadow-sm">
          <div className="flex items-center justify-between px-4 py-2 bg-slate-950/70 text-xs text-slate-400 border-b border-slate-800">
            <span className="font-mono lowercase">{lang}</span>
            <button
              onClick={() => handleCopyCode(code, curIndex)}
              className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer"
            >
              {copiedCodeIndex === curIndex ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
          <pre className="p-4 overflow-x-auto text-xs font-mono leading-relaxed text-blue-100/90">
            <code>{code}</code>
          </pre>
        </div>
      );

      lastIndex = match.index + match[0].length;
      blockIndex++;
    }

    const remainingText = content.substring(lastIndex);
    if (remainingText) {
      parts.push(renderFormattedText(remainingText, `text-end`));
    }

    return parts;
  }, [content, copiedCodeIndex]);

  // Process text containing LaTeX ($$...$$ and $...$), markdown headings, bold, bullet points
  function renderFormattedText(text: string, keyPrefix: string): React.ReactNode {
    const lines = text.split('\n');
    const lineElements: React.ReactNode[] = [];

    let inList = false;
    let listItems: React.ReactNode[] = [];

    const flushList = () => {
      if (inList && listItems.length > 0) {
        lineElements.push(
          <ul key={`list-${lineElements.length}`} className="my-2.5 space-y-1.5 pl-5 list-disc text-slate-700 dark:text-slate-200">
            {listItems}
          </ul>
        );
        listItems = [];
        inList = false;
      }
    };

    lines.forEach((rawLine, idx) => {
      const line = rawLine.trimEnd();

      // Check for bullet list item
      if (line.match(/^[-*]\s+/)) {
        inList = true;
        const itemContent = line.replace(/^[-*]\s+/, '');
        listItems.push(
          <li key={`li-${idx}`} className="leading-relaxed">
            {renderInlineMarkdownAndMath(itemContent)}
          </li>
        );
        return;
      }

      // Check for numbered list item
      if (line.match(/^\d+\.\s+/)) {
        inList = true;
        const itemContent = line.replace(/^\d+\.\s+/, '');
        listItems.push(
          <li key={`li-${idx}`} className="leading-relaxed">
            {renderInlineMarkdownAndMath(itemContent)}
          </li>
        );
        return;
      }

      flushList();

      if (!line.trim()) {
        lineElements.push(<div key={`empty-${idx}`} className="h-3" />);
        return;
      }

      // Headings
      if (line.startsWith('### ')) {
        lineElements.push(
          <h3 key={`h3-${idx}`} className="mt-4 mb-2 text-base font-semibold text-slate-900 dark:text-white tracking-tight">
            {renderInlineMarkdownAndMath(line.substring(4))}
          </h3>
        );
        return;
      }
      if (line.startsWith('## ')) {
        lineElements.push(
          <h2 key={`h2-${idx}`} className="mt-5 mb-2.5 text-lg font-bold text-slate-900 dark:text-white tracking-tight border-b border-slate-100 dark:border-blue-900/40 pb-1">
            {renderInlineMarkdownAndMath(line.substring(3))}
          </h2>
        );
        return;
      }
      if (line.startsWith('# ')) {
        lineElements.push(
          <h1 key={`h1-${idx}`} className="mt-5 mb-3 text-xl font-bold text-blue-950 dark:text-blue-100 tracking-tight">
            {renderInlineMarkdownAndMath(line.substring(2))}
          </h1>
        );
        return;
      }

      // Block LaTeX formula ($$...$$)
      if (line.trim().startsWith('$$') && line.trim().endsWith('$$') && line.trim().length > 4) {
        const latex = line.trim().slice(2, -2).trim();
        lineElements.push(
          <div
            key={`math-block-${idx}`}
            className="my-3 py-2 px-3 overflow-x-auto rounded-lg bg-blue-50/60 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/50 text-center"
            dangerouslySetInnerHTML={{ __html: renderLatex(latex, true) }}
          />
        );
        return;
      }

      // Standard paragraph
      lineElements.push(
        <p key={`p-${idx}`} className="my-1.5 leading-relaxed text-slate-800 dark:text-slate-200">
          {renderInlineMarkdownAndMath(line)}
        </p>
      );
    });

    flushList();

    return <div key={keyPrefix}>{lineElements}</div>;
  }

  // Parses inline math $...$, bold **...**, inline code `...`
  function renderInlineMarkdownAndMath(lineText: string): React.ReactNode {
    // Split by block math $$...$$ first if any on inline line
    const segments: React.ReactNode[] = [];
    // Match $$...$$ or $...$ or `...` or **...**
    const tokenRegex = /(\$\$[\s\S]+?\$\$|\$[^\$]+?\$|`[^`]+`|\*\*[^*]+?\*\*)/g;

    let lastIdx = 0;
    let match: RegExpExecArray | null;
    let sIdx = 0;

    while ((match = tokenRegex.exec(lineText)) !== null) {
      if (match.index > lastIdx) {
        segments.push(lineText.substring(lastIdx, match.index));
      }

      const token = match[0];
      if (token.startsWith('$$') && token.endsWith('$$')) {
        const latex = token.slice(2, -2).trim();
        segments.push(
          <span
            key={`math-blk-${sIdx++}`}
            className="inline-block my-1 px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/40"
            dangerouslySetInnerHTML={{ __html: renderLatex(latex, true) }}
          />
        );
      } else if (token.startsWith('$') && token.endsWith('$')) {
        const latex = token.slice(1, -1).trim();
        segments.push(
          <span
            key={`math-inl-${sIdx++}`}
            className="inline-block px-1 py-0.5 rounded bg-blue-50/70 dark:bg-blue-950/30 text-blue-950 dark:text-blue-200"
            dangerouslySetInnerHTML={{ __html: renderLatex(latex, false) }}
          />
        );
      } else if (token.startsWith('`') && token.endsWith('`')) {
        segments.push(
          <code
            key={`code-inl-${sIdx++}`}
            className="px-1.5 py-0.5 text-xs font-mono font-medium rounded bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400 border border-slate-200 dark:border-slate-700"
          >
            {token.slice(1, -1)}
          </code>
        );
      } else if (token.startsWith('**') && token.endsWith('**')) {
        segments.push(
          <strong key={`bold-${sIdx++}`} className="font-semibold text-slate-900 dark:text-white">
            {token.slice(2, -2)}
          </strong>
        );
      }

      lastIdx = match.index + token.length;
    }

    if (lastIdx < lineText.length) {
      segments.push(lineText.substring(lastIdx));
    }

    return segments.length > 0 ? segments : lineText;
  }

  return <div className={`text-sm md:text-[15px] ${className}`}>{renderedElements}</div>;
};
