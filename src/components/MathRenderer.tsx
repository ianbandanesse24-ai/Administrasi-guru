import React, { useMemo, useState } from 'react';
import katex from 'katex';
import {
  Maximize2,
  Copy,
  Check,
  Image as ImageIcon,
  ZoomIn,
  X,
  ExternalLink,
  Code2,
  Table as TableIcon,
} from 'lucide-react';

interface MathRendererProps {
  content: string;
  className?: string;
  displayMode?: boolean;
  allowImageZoom?: boolean;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Comprehensive Rich Scientific & Educational Content Renderer
 * Safe placeholder token architecture:
 * 1. Protects KaTeX formulas, code blocks, images from line-splitting & <br/> injections
 * 2. Parses Markdown tables, headings, blockquotes, task lists, and lists accurately
 * 3. Supports scientific symbols, Greek letters, and deep learning badges
 * 4. Image modal lightbox zoom
 */
export const MathRenderer: React.FC<MathRendererProps> = ({
  content,
  className = '',
  displayMode = false,
  allowImageZoom = true,
}) => {
  const [selectedImage, setSelectedImage] = useState<{ src: string; alt: string } | null>(null);

  const renderedHtml = useMemo(() => {
    if (!content) return '';

    // If pure LaTeX string without delimiters and requested displayMode
    if (
      displayMode &&
      !content.includes('$') &&
      !content.includes('\\(') &&
      !content.includes('\\[')
    ) {
      try {
        return katex.renderToString(content.trim(), {
          displayMode: true,
          throwOnError: false,
        });
      } catch {
        return escapeHtml(content);
      }
    }

    const mathBlockTokens: string[] = [];
    const mathInlineTokens: string[] = [];
    const codeBlockTokens: string[] = [];
    const imageTokens: string[] = [];

    let text = content;

    // STEP 1: Extract Fenced Code Blocks (``` ... ```)
    text = text.replace(/```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g, (_, lang, code) => {
      const isDiagram =
        code.includes('┌') ||
        code.includes('+--') ||
        code.includes('|') ||
        code.includes('──►') ||
        code.includes('-->') ||
        code.includes('KANVAS') ||
        code.includes('SKETSA') ||
        lang === 'ascii' ||
        lang === 'diagram' ||
        lang === 'flowchart';

      const isCanvas = code.includes('KANVAS') || code.includes('SKETSA') || code.includes('KREASI');

      let blockTitle = lang ? lang.toUpperCase() : 'KODE / ALGORITMA';
      if (isCanvas) {
        blockTitle = '🎨 KANVAS KREASI & SKETSA VISUAL SISWA';
      } else if (isDiagram) {
        blockTitle = '📊 SKEMA DIAGRAM / ILUSTRASI KONSEP';
      }

      const borderColor = isCanvas
        ? 'border-indigo-500/60 bg-slate-950/90'
        : isDiagram
        ? 'border-teal-500/40 bg-slate-950 shadow-lg'
        : 'border-slate-800 bg-slate-950/90';

      const headerBg = isCanvas
        ? 'bg-indigo-950/80 text-indigo-200 border-indigo-900/60'
        : isDiagram
        ? 'bg-teal-950/80 text-teal-200 border-teal-900/60'
        : 'bg-slate-900/90 text-slate-400 border-slate-800/80';

      const tokenIndex = codeBlockTokens.length;
      const html = `<div class="my-4 rounded-xl overflow-hidden border ${borderColor}">
        <div class="px-3 py-1.5 ${headerBg} border-b flex items-center justify-between text-[11px] font-mono font-bold">
          <span>${blockTitle}</span>
          <span class="text-[10px] opacity-75">${isCanvas ? '(Ruang Gambar Siswa)' : '(Visualisasi Konsep)'}</span>
        </div>
        <pre class="p-3.5 text-xs font-mono overflow-x-auto text-emerald-300 leading-relaxed custom-scrollbar bg-slate-950/95"><code>${escapeHtml(
          code.trim()
        )}</code></pre>
      </div>`;
      codeBlockTokens.push(html);
      return `\n\n__CODE_BLOCK_${tokenIndex}__\n\n`;
    });

    // STEP 2: Extract Block LaTeX: $$...$$ or \[...\]
    text = text.replace(/\$\$([\s\S]*?)\$\$/g, (_, math) => {
      const tokenIndex = mathBlockTokens.length;
      let rendered = '';
      try {
        rendered = katex.renderToString(math.trim(), {
          displayMode: true,
          throwOnError: false,
        });
        rendered = `<div class="katex-block my-4 overflow-x-auto py-3 px-4 bg-slate-950/80 rounded-xl border border-indigo-500/30 text-center shadow-md relative group"><div class="katex-inner inline-block">${rendered}</div></div>`;
      } catch {
        rendered = `<div class="katex-error font-mono text-red-400 p-2.5 bg-red-950/40 rounded-lg border border-red-800 text-xs">${escapeHtml(
          math
        )}</div>`;
      }
      mathBlockTokens.push(rendered);
      return `\n\n__MATH_BLOCK_${tokenIndex}__\n\n`;
    });

    text = text.replace(/\\\[([\s\S]*?)\\\]/g, (_, math) => {
      const tokenIndex = mathBlockTokens.length;
      let rendered = '';
      try {
        rendered = katex.renderToString(math.trim(), {
          displayMode: true,
          throwOnError: false,
        });
        rendered = `<div class="katex-block my-4 overflow-x-auto py-3 px-4 bg-slate-950/80 rounded-xl border border-indigo-500/30 text-center shadow-md relative group"><div class="katex-inner inline-block">${rendered}</div></div>`;
      } catch {
        rendered = `<div class="katex-error font-mono text-red-400 p-2.5 bg-red-950/40 rounded-lg border border-red-800 text-xs">${escapeHtml(
          math
        )}</div>`;
      }
      mathBlockTokens.push(rendered);
      return `\n\n__MATH_BLOCK_${tokenIndex}__\n\n`;
    });

    // STEP 3: Extract Inline LaTeX: $...$ or \(...\)
    text = text.replace(/\$([^\$\n\r]+?)\$/g, (_, math) => {
      const tokenIndex = mathInlineTokens.length;
      let rendered = '';
      try {
        rendered = `<span class="katex-inline inline-block px-1 font-normal">${katex.renderToString(
          math.trim(),
          { displayMode: false, throwOnError: false }
        )}</span>`;
      } catch {
        rendered = `<code class="text-amber-400 font-mono text-xs px-1 bg-slate-900 rounded">${escapeHtml(
          math
        )}</code>`;
      }
      mathInlineTokens.push(rendered);
      return `__MATH_INLINE_${tokenIndex}__`;
    });

    text = text.replace(/\\\(([\s\S]*?)\\\)/g, (_, math) => {
      const tokenIndex = mathInlineTokens.length;
      let rendered = '';
      try {
        rendered = `<span class="katex-inline inline-block px-1 font-normal">${katex.renderToString(
          math.trim(),
          { displayMode: false, throwOnError: false }
        )}</span>`;
      } catch {
        rendered = `<code class="text-amber-400 font-mono text-xs px-1 bg-slate-900 rounded">${escapeHtml(
          math
        )}</code>`;
      }
      mathInlineTokens.push(rendered);
      return `__MATH_INLINE_${tokenIndex}__`;
    });

    // STEP 4: Extract Images: ![alt](url)
    text = text.replace(/!\[(.*?)\]\((.*?)\)/g, (_, alt, url) => {
      const safeAlt = escapeHtml(alt || 'Ilustrasi Pembelajaran');
      const safeUrl = url.trim();
      const tokenIndex = imageTokens.length;
      const html = `<figure class="my-4 flex flex-col items-center justify-center p-2 rounded-2xl bg-slate-950/60 border border-slate-800">
        <img src="${safeUrl}" alt="${safeAlt}" class="max-h-96 max-w-full rounded-xl object-contain shadow-lg cursor-pointer hover:opacity-95 transition" data-zoom-src="${safeUrl}" data-zoom-alt="${safeAlt}" loading="lazy" />
        <figcaption class="mt-2 text-xs font-semibold text-slate-400 text-center flex items-center space-x-1.5">
          <span class="inline-block w-2 h-2 rounded-full bg-indigo-400"></span>
          <span>${safeAlt}</span>
        </figcaption>
      </figure>`;
      imageTokens.push(html);
      return `\n\n__IMAGE_${tokenIndex}__\n\n`;
    });

    // Helper for Pedagogical Badges & Chips
    const formatBadges = (str: string) => {
      return str
        .replace(/\[(Mindful Learning|Mindful)\]/gi, '<span class="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-950/80 text-blue-300 border border-blue-800/60 my-0.5 mr-1">🧠 Mindful Learning</span>')
        .replace(/\[(Meaningful Learning|Meaningful)\]/gi, '<span class="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 my-0.5 mr-1">💡 Meaningful Learning</span>')
        .replace(/\[(Joyful Learning|Joyful)\]/gi, '<span class="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-950/80 text-amber-300 border border-amber-800/60 my-0.5 mr-1">🎉 Joyful Learning</span>')
        .replace(/\[(Deep Learning|Pembelajaran Mendalam)\]/gi, '<span class="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-950/80 text-purple-300 border border-purple-800/60 my-0.5 mr-1">✨ Deep Learning</span>')
        .replace(/\[(Diferensiasi Konten|Diferensiasi Proses|Diferensiasi Produk|Diferensiasi Lingkungan|Diferensiasi)\]/gi, '<span class="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold bg-pink-950/80 text-pink-300 border border-pink-800/60 my-0.5 mr-1">🎯 $1</span>')
        .replace(/\[(HOTS)\]/gi, '<span class="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-900/60 text-amber-300 border border-amber-700/60 my-0.5 mr-1">🔥 HOTS</span>')
        .replace(/\[(MOTS)\]/gi, '<span class="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-sky-900/60 text-sky-300 border border-sky-700/60 my-0.5 mr-1">⚡ MOTS</span>')
        .replace(/\[(LOTS)\]/gi, '<span class="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-900 text-slate-400 border border-slate-700 my-0.5 mr-1">📖 LOTS</span>')
        .replace(/\[(Tujuan Pembelajaran|TP)\]/gi, '<span class="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-950/80 text-indigo-300 border border-indigo-800/60 my-0.5 mr-1">🎯 TP</span>')
        .replace(/\[(Alur Tujuan Pembelajaran|ATP)\]/gi, '<span class="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-950/80 text-indigo-300 border border-indigo-800/60 my-0.5 mr-1">📈 ATP</span>')
        .replace(/\[(Asesmen Formatif|Formatif)\]/gi, '<span class="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold bg-teal-950/80 text-teal-300 border border-teal-800/60 my-0.5 mr-1">📝 Asesmen Formatif</span>')
        .replace(/\[(Asesmen Sumatif|Sumatif)\]/gi, '<span class="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-950/80 text-amber-300 border border-amber-800/60 my-0.5 mr-1">📊 Asesmen Sumatif</span>')
        .replace(/\[(Asesmen Awal|Diagnostik)\]/gi, '<span class="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold bg-sky-950/80 text-sky-300 border border-sky-800/60 my-0.5 mr-1">🔍 Asesmen Awal</span>')
        .replace(/\[(KKTP)\]/gi, '<span class="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-cyan-950/80 text-cyan-300 border border-cyan-800/60 my-0.5 mr-1">🎯 KKTP</span>')
        .replace(/(?:🟢\s*(\d*\s*JP|\d+)|\[KBM\s*(\d*\s*JP|\d+)\])/gi, '<span class="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 my-0.5 mr-1">🟢 $1$2</span>')
        .replace(/\[KBM\]/gi, '<span class="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 my-0.5 mr-1">🟢 KBM</span>')
        .replace(/(?:🔴\s*LIBUR|\[LIBUR[^\]]*\])/gi, '<span class="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-950/80 text-rose-300 border border-rose-800/60 my-0.5 mr-1">🔴 LIBUR</span>')
        .replace(/<u>(.*?)<\/u>/gi, '<u class="underline underline-offset-2">$1</u>');
    };

    // STEP 5: Line-by-Line Markdown Parsing (Headings, Tables, Lists, Callouts, Paragraphs)
    const rawLines = text.split(/\r?\n/);
    const htmlBlocks: string[] = [];
    let tableBuffer: string[] = [];
    let listBuffer: { type: 'ul' | 'ol'; items: string[] } | null = null;

    const flushList = () => {
      if (!listBuffer) return;
      if (listBuffer.type === 'ul') {
        htmlBlocks.push(
          `<ul class="my-2.5 space-y-1 pl-5 list-disc text-slate-300">${listBuffer.items
            .map((item) => `<li class="leading-relaxed">${item}</li>`)
            .join('')}</ul>`
        );
      } else {
        htmlBlocks.push(
          `<ol class="my-2.5 space-y-1 pl-5 list-decimal text-slate-300">${listBuffer.items
            .map((item) => `<li class="leading-relaxed">${item}</li>`)
            .join('')}</ol>`
        );
      }
      listBuffer = null;
    };

    const flushTable = () => {
      if (tableBuffer.length === 0) return;

      const headerLine = tableBuffer[0];
      const dataLines = tableBuffer.slice(1).filter((l) => !/^\|[\s\-:|]+\|$/.test(l.trim()));

      const parseRow = (row: string) => {
        return row
          .trim()
          .replace(/^\|/, '')
          .replace(/\|$/, '')
          .split('|')
          .map((c) => formatBadges(c.trim().replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-white">$1</strong>')));
      };

      const headers = parseRow(headerLine);
      const rows = dataLines.map(parseRow);

      let tableHtml = `<div class="my-4 overflow-x-auto rounded-xl border border-slate-800 shadow-md bg-slate-950/70 custom-scrollbar">
        <table class="w-full text-left text-xs border-collapse">
          <thead>
            <tr class="bg-indigo-950/90 text-indigo-200 border-b border-indigo-800/60 font-black">`;

      headers.forEach((h) => {
        tableHtml += `<th class="p-2.5 font-bold tracking-wide">${h}</th>`;
      });

      tableHtml += `</tr></thead><tbody class="divide-y divide-slate-800/80">`;

      rows.forEach((r, idx) => {
        const bgClass = idx % 2 === 0 ? 'bg-slate-900/30' : 'bg-slate-950/50';
        tableHtml += `<tr class="${bgClass} hover:bg-indigo-950/30 transition-colors">`;
        r.forEach((cell) => {
          tableHtml += `<td class="p-2.5 text-slate-300 align-top">${cell}</td>`;
        });
        tableHtml += `</tr>`;
      });

      tableHtml += `</tbody></table></div>`;
      htmlBlocks.push(tableHtml);
      tableBuffer = [];
    };

    for (let i = 0; i < rawLines.length; i++) {
      const line = rawLines[i];
      const trimmed = line.trim();

      // Check placeholder tokens on their own line
      if (/^__(CODE_BLOCK|MATH_BLOCK|IMAGE)_\d+__$/.test(trimmed)) {
        flushList();
        flushTable();
        htmlBlocks.push(trimmed);
        continue;
      }

      // Check table row
      if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
        flushList();
        tableBuffer.push(trimmed);
        continue;
      } else if (tableBuffer.length > 0) {
        flushTable();
      }

      // Empty line
      if (!trimmed) {
        flushList();
        continue;
      }

      // Horizontal Rule
      if (trimmed === '---' || trimmed === '***' || trimmed === '___') {
        flushList();
        htmlBlocks.push('<hr class="my-5 border-slate-800/80" />');
        continue;
      }

      // Headings
      if (trimmed.startsWith('# ')) {
        flushList();
        const hText = formatBadges(trimmed.replace(/^#\s+/, '').replace(/\*\*/g, ''));
        htmlBlocks.push(`<h1 class="text-lg sm:text-xl font-black text-indigo-200 mt-6 mb-4 pb-2 border-b border-indigo-500/30 tracking-wide">${hText}</h1>`);
        continue;
      }
      if (trimmed.startsWith('## ')) {
        flushList();
        const hText = formatBadges(trimmed.replace(/^##\s+/, '').replace(/\*\*/g, ''));
        htmlBlocks.push(`<h2 class="text-base sm:text-lg font-black text-white mt-6 mb-3 pb-1.5 border-b border-slate-800 flex items-center space-x-2"><span class="w-2 h-4 rounded-full bg-teal-400 inline-block"></span><span>${hText}</span></h2>`);
        continue;
      }
      if (trimmed.startsWith('### ')) {
        flushList();
        const hText = formatBadges(trimmed.replace(/^###\s+/, '').replace(/\*\*/g, ''));
        htmlBlocks.push(`<h3 class="text-sm sm:text-base font-bold text-indigo-300 mt-5 mb-2 flex items-center space-x-2"><span class="w-1.5 h-3.5 rounded-full bg-indigo-500 inline-block"></span><span>${hText}</span></h3>`);
        continue;
      }
      if (trimmed.startsWith('#### ')) {
        flushList();
        const hText = formatBadges(trimmed.replace(/^####\s+/, '').replace(/\*\*/g, ''));
        htmlBlocks.push(`<h4 class="text-xs sm:text-sm font-bold text-slate-200 mt-4 mb-1.5 pl-2 border-l-2 border-indigo-400">${hText}</h4>`);
        continue;
      }

      // Blockquotes / Callout Boxes (> ...)
      if (trimmed.startsWith('>')) {
        flushList();
        let quoteContent = trimmed.replace(/^>\s*/, '');
        const hasEmoji = /^(📌|💡|⚠️|🔬|🎯|📝|🧠|🎉|⭐|🎨)/.test(quoteContent);
        const icon = hasEmoji ? quoteContent.slice(0, 2) : '📌';
        if (hasEmoji) {
          quoteContent = quoteContent.slice(2).trim();
        }
        const text = formatBadges(
          quoteContent
            .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-white">$1</strong>')
            .replace(/\*(.*?)\*/g, '<em class="italic text-slate-300">$1</em>')
            .replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 rounded bg-slate-900 text-cyan-300 font-mono text-xs border border-slate-700">$1</code>')
        );
        htmlBlocks.push(`<div class="my-3.5 p-3.5 rounded-xl bg-indigo-950/30 border-l-4 border-indigo-500 text-xs text-indigo-100/90 shadow-sm flex items-start space-x-2.5">
          <span class="text-base leading-none">${icon}</span>
          <div class="flex-1 font-medium leading-relaxed">${text}</div>
        </div>`);
        continue;
      }

      // Checkboxes / Task lists (- [ ] or - [x])
      if (/^\s*[-*]\s+\[([ xX])\]\s+/.test(trimmed)) {
        flushList();
        const isChecked = /^\s*[-*]\s+\[([xX])\]\s+/.test(trimmed);
        const label = trimmed.replace(/^\s*[-*]\s+\[([ xX])\]\s+/, '');
        const itemText = formatBadges(
          label
            .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-white">$1</strong>')
            .replace(/\*(.*?)\*/g, '<em class="italic text-slate-300">$1</em>')
            .replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 rounded bg-slate-900 text-cyan-300 font-mono text-xs border border-slate-700">$1</code>')
        );
        htmlBlocks.push(`<div class="flex items-center space-x-2 my-1.5 text-xs text-slate-200">
          <span class="w-4 h-4 rounded flex items-center justify-center font-bold text-[10px] ${
            isChecked ? 'bg-indigo-600 text-white' : 'border border-slate-700 bg-slate-900 text-transparent'
          }">${isChecked ? '✓' : ''}</span>
          <span>${itemText}</span>
        </div>`);
        continue;
      }

      // Unordered lists (- or *)
      if (/^[-*]\s+/.test(trimmed)) {
        if (!listBuffer || listBuffer.type !== 'ul') {
          flushList();
          listBuffer = { type: 'ul', items: [] };
        }
        const itemText = formatBadges(
          trimmed
            .replace(/^[-*]\s+/, '')
            .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-white">$1</strong>')
            .replace(/\*(.*?)\*/g, '<em class="italic text-slate-300">$1</em>')
            .replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 rounded bg-slate-900 text-cyan-300 font-mono text-xs border border-slate-700">$1</code>')
        );
        listBuffer.items.push(itemText);
        continue;
      }

      // Ordered lists (1. 2.)
      if (/^\d+\.\s+/.test(trimmed)) {
        if (!listBuffer || listBuffer.type !== 'ol') {
          flushList();
          listBuffer = { type: 'ol', items: [] };
        }
        const itemText = formatBadges(
          trimmed
            .replace(/^\d+\.\s+/, '')
            .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-white">$1</strong>')
            .replace(/\*(.*?)\*/g, '<em class="italic text-slate-300">$1</em>')
            .replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 rounded bg-slate-900 text-cyan-300 font-mono text-xs border border-slate-700">$1</code>')
        );
        listBuffer.items.push(itemText);
        continue;
      }

      flushList();

      // Regular Paragraph
      const pText = formatBadges(
        trimmed
          .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-white">$1</strong>')
          .replace(/\*(.*?)\*/g, '<em class="italic text-slate-300">$1</em>')
          .replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 rounded bg-slate-900 text-cyan-300 font-mono text-xs border border-slate-700">$1</code>')
      );
      htmlBlocks.push(`<p class="my-2 leading-relaxed text-xs sm:text-sm text-slate-200">${pText}</p>`);
    }

    flushList();
    flushTable();

    let fullHtml = htmlBlocks.join('\n');

    // STEP 6: Restore Placeholders Safely
    mathBlockTokens.forEach((token, idx) => {
      fullHtml = fullHtml.split(`__MATH_BLOCK_${idx}__`).join(token);
    });

    mathInlineTokens.forEach((token, idx) => {
      fullHtml = fullHtml.split(`__MATH_INLINE_${idx}__`).join(token);
    });

    codeBlockTokens.forEach((token, idx) => {
      fullHtml = fullHtml.split(`__CODE_BLOCK_${idx}__`).join(token);
    });

    imageTokens.forEach((token, idx) => {
      fullHtml = fullHtml.split(`__IMAGE_${idx}__`).join(token);
    });

    return fullHtml;
  }, [content, displayMode]);

  // Click delegation for images
  const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!allowImageZoom) return;
    const target = e.target as HTMLElement;
    if (target.tagName === 'IMG' && target.hasAttribute('data-zoom-src')) {
      const src = target.getAttribute('data-zoom-src') || '';
      const alt = target.getAttribute('data-zoom-alt') || 'Gambar';
      if (src) {
        setSelectedImage({ src, alt });
      }
    }
  };

  return (
    <>
      <div
        onClick={handleContainerClick}
        className={`math-rendered-content text-slate-200 leading-relaxed select-text ${className}`}
        dangerouslySetInnerHTML={{ __html: renderedHtml }}
      />

      {/* Image Lightbox Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-4 animate-fadeIn"
          onClick={() => setSelectedImage(null)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden flex flex-col shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-2 text-xs text-slate-300 font-bold">
                <ImageIcon className="w-4 h-4 text-indigo-400" />
                <span className="truncate max-w-md">{selectedImage.alt}</span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedImage(null)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Image View */}
            <div className="p-4 flex items-center justify-center overflow-auto max-h-[75vh]">
              <img
                src={selectedImage.src}
                alt={selectedImage.alt}
                className="max-h-full max-w-full object-contain rounded-lg shadow-lg"
              />
            </div>

            {/* Modal Footer */}
            <div className="p-2.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span>Klik di luar gambar atau tombol silang untuk menutup</span>
              <a
                href={selectedImage.src}
                target="_blank"
                rel="noreferrer"
                className="flex items-center space-x-1 text-indigo-400 hover:text-indigo-300 font-semibold"
              >
                <span>Buka di Tab Baru</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

