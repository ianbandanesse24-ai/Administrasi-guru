import * as XLSX from 'xlsx';
import katex from 'katex';
import { SchoolProfile } from './storage';

export class ExportService {
  /**
   * Cleans any duplicate / inline signature blocks from document text/markdown/HTML
   * to ensure exactly one official signature block is rendered at the bottom.
   */
  static cleanDuplicateSignatures(text: string): string {
    if (!text) return '';
    let cleaned = text;

    // 1. Remove Markdown headers ONLY for dedicated signature sections at the very end of document
    cleaned = cleaned.replace(
      /(?:\r?\n|\n)(?:#{1,4}\s*(?:LEMBAR PENGESAHAN|TANDA TANGAN PENGESAHAN)[\s\S]*?(?:Kepala\s+Sekolah|Kepala\s+Satuan|Guru\s+Mata\s+Pelajaran|Guru\s+Pengampu)[\s\S]*)$/i,
      ''
    );

    // 2. Remove Markdown inline signatures at bottom (Mengetahui, Kepala Sekolah ... Guru Mata Pelajaran ...)
    cleaned = cleaned.replace(
      /(?:\r?\n|\n)(?:---+\s*)?(?:(?:\*{1,2}|_{1,2})?Mengetahui,(?:\*{1,2}|_{1,2})?)\s*(?:\r?\n)+[\s\S]*?(?:Kepala\s+Sekolah|Kepala\s+Satuan\s+Pendidikan)[\s\S]*?(?:Guru\s+Mata\s+Pelajaran|Guru\s+Pengampu)[\s\S]*?(?:NIP\.|NUPTK|$)/i,
      ''
    );

    // 3. Remove embedded HTML signature tables
    cleaned = cleaned.replace(
      /<table[^>]*>[\s\S]*?Mengetahui[\s\S]*?(?:Kepala\s+Sekolah|Kepala\s+Satuan\s+Pendidikan)[\s\S]*?(?:Guru\s+Mata\s+Pelajaran|Guru\s+Pengampu)[\s\S]*?<\/table>/gi,
      ''
    );

    // 4. Remove duplicate ttd-box or ttd-container div blocks
    cleaned = cleaned.replace(
      /<div\s+class=["'](?:ttd-box|ttd-container)["']>[\s\S]*?<\/div>/gi,
      ''
    );

    return cleaned.trim();
  }

  /**
   * Helper to convert Markdown formatted curriculum text to clean, semantic, and colored HTML
   * Safe placeholder token architecture:
   * 1. Protects KaTeX formulas, code blocks, images from line-splitting & <br/> injections
   * 2. Formats tables with alternating row shading, event badges, and print-safe borders
   * 3. Renders headings, blockquotes, lists, and pedagogical badges
   */
  static markdownToHtml(markdown: string): string {
    if (!markdown) return '';

    const cleanedSource = ExportService.cleanDuplicateSignatures(markdown);

    const formatBadgeChip = (text: string): string => {
      return text
        // Calendar badges & Event codes
        .replace(/(?:🟢\s*(\d*\s*JP|\d+)|\[KBM\s*(\d*\s*JP|\d+)\])/gi, '<span style="background-color:#dcfce7; color:#15803d; border:1px solid #86efac; padding:2px 8px; border-radius:12px; font-weight:bold; font-size:8.5pt; display:inline-block; margin:2px 1px;">🟢 $1$2</span>')
        .replace(/\[KBM\]/gi, '<span style="background-color:#dcfce7; color:#15803d; border:1px solid #86efac; padding:2px 8px; border-radius:12px; font-weight:bold; font-size:8.5pt; display:inline-block; margin:2px 1px;">🟢 KBM</span>')
        .replace(/🟢(?!\s*<)/g, '<span style="color:#16a34a; font-weight:bold;">🟢</span>')
        
        // Orange MPLS badge
        .replace(/(?:🟠\s*MPLS|\[MPLS\])/gi, '<span style="background-color:#ffedd5; color:#c2410c; border:1px solid #fdba74; padding:2px 8px; border-radius:12px; font-weight:bold; font-size:8.5pt; display:inline-block; margin:2px 1px;">🟠 MPLS</span>')
        .replace(/🟠(?!\s*<)/g, '<span style="color:#ea580c; font-weight:bold;">🟠</span>')
        
        // Yellow ASTS badge
        .replace(/(?:🟡\s*(?:ASTS|PTS|STS)|\[(?:ASTS|PTS|STS)\])/gi, '<span style="background-color:#fef9c3; color:#854d0e; border:1px solid #fde047; padding:2px 8px; border-radius:12px; font-weight:bold; font-size:8.5pt; display:inline-block; margin:2px 1px;">🟡 ASTS/PTS</span>')
        .replace(/🟡(?!\s*<)/g, '<span style="color:#ca8a04; font-weight:bold;">🟡</span>')
        
        // Purple ASAS badge
        .replace(/(?:🟣\s*(?:ASAS|PAS|SAS|PAT|AAS)|\[(?:ASAS|PAS|SAS|PAT|AAS)\])/gi, '<span style="background-color:#f3e8ff; color:#6b21a8; border:1px solid #d8b4fe; padding:2px 8px; border-radius:12px; font-weight:bold; font-size:8.5pt; display:inline-block; margin:2px 1px;">🟣 ASAS/PAS</span>')
        .replace(/🟣(?!\s*<)/g, '<span style="color:#9333ea; font-weight:bold;">🟣</span>')
        
        // Red LIBUR badge
        .replace(/(?:🔴\s*LIBUR|\[LIBUR[^\]]*\])/gi, '<span style="background-color:#fee2e2; color:#991b1b; border:1px solid #fca5a5; padding:2px 8px; border-radius:12px; font-weight:bold; font-size:8.5pt; display:inline-block; margin:2px 1px;">🔴 LIBUR</span>')
        .replace(/🔴(?!\s*<)/g, '<span style="color:#dc2626; font-weight:bold;">🔴</span>')
        
        // Blue P5 badge
        .replace(/(?:🔵\s*P5|\[P5[^\]]*\]|\[PROJEK[^\]]*\]|\[Profil Pelajar Pancasila\])/gi, '<span style="background-color:#e0f2fe; color:#0369a1; border:1px solid #7dd3fc; padding:2px 8px; border-radius:12px; font-weight:bold; font-size:8.5pt; display:inline-block; margin:2px 1px;">🔵 P5</span>')
        .replace(/🔵(?!\s*<)/g, '<span style="color:#0284c7; font-weight:bold;">🔵</span>')
        
        // Slate RAPOR badge
        .replace(/(?:⚪\s*RAPOR|\[RAPOR[^\]]*\]|\[RAPORT[^\]]*\])/gi, '<span style="background-color:#f1f5f9; color:#334155; border:1px solid #cbd5e1; padding:2px 8px; border-radius:12px; font-weight:bold; font-size:8.5pt; display:inline-block; margin:2px 1px;">⚪ RAPOR</span>')
        .replace(/⚪(?!\s*<)/g, '<span style="color:#64748b; font-weight:bold;">⚪</span>')

        // Teal ANBK badge
        .replace(/(?:🟤\s*ANBK|\[ANBK[^\]]*\]|\[ASESMEN NASIONAL[^\]]*\])/gi, '<span style="background-color:#ccfbf1; color:#0f766e; border:1px solid #5eead4; padding:2px 8px; border-radius:12px; font-weight:bold; font-size:8.5pt; display:inline-block; margin:2px 1px;">🟤 ANBK</span>')
        .replace(/🟤(?!\s*<)/g, '<span style="color:#0f766e; font-weight:bold;">🟤</span>')

        // Rose / Pink REMEDIAL badge
        .replace(/(?:🌸\s*REMEDIAL|\[REMEDIAL[^\]]*\]|\[CADANGAN[^\]]*\])/gi, '<span style="background-color:#ffe4e6; color:#9f1239; border:1px solid #fda4af; padding:2px 8px; border-radius:12px; font-weight:bold; font-size:8.5pt; display:inline-block; margin:2px 1px;">🌸 REMEDIAL</span>')
        .replace(/🌸(?!\s*<)/g, '<span style="color:#db2777; font-weight:bold;">🌸</span>')
        
        // Pedagogical & Deep Learning badges
        .replace(/\[(Mindful Learning|Mindful)\]/gi, '<span style="background-color:#eff6ff; color:#1d4ed8; border:1px solid #93c5fd; padding:2px 8px; border-radius:6px; font-weight:bold; font-size:8.5pt; display:inline-block; margin:2px 1px;">🧠 Mindful Learning</span>')
        .replace(/\[(Meaningful Learning|Meaningful)\]/gi, '<span style="background-color:#f0fdf4; color:#15803d; border:1px solid #86efac; padding:2px 8px; border-radius:6px; font-weight:bold; font-size:8.5pt; display:inline-block; margin:2px 1px;">💡 Meaningful Learning</span>')
        .replace(/\[(Joyful Learning|Joyful)\]/gi, '<span style="background-color:#fefce8; color:#a16207; border:1px solid #fde047; padding:2px 8px; border-radius:6px; font-weight:bold; font-size:8.5pt; display:inline-block; margin:2px 1px;">🎉 Joyful Learning</span>')
        .replace(/\[(Deep Learning|Pembelajaran Mendalam)\]/gi, '<span style="background-color:#ede9fe; color:#6d28d9; border:1px solid #c4b5fd; padding:2px 8px; border-radius:6px; font-weight:bold; font-size:8.5pt; display:inline-block; margin:2px 1px;">✨ Deep Learning</span>')
        .replace(/\[(Diferensiasi Konten|Diferensiasi Proses|Diferensiasi Produk|Diferensiasi)\]/gi, '<span style="background-color:#fce7f3; color:#9d174d; border:1px solid #f472b6; padding:2px 8px; border-radius:6px; font-weight:bold; font-size:8.5pt; display:inline-block; margin:2px 1px;">🎯 $1</span>')
        .replace(/\[(HOTS)\]/gi, '<span style="background-color:#fef3c7; color:#92400e; border:1px solid #fcd34d; padding:2px 6px; border-radius:4px; font-weight:bold; font-size:8.5pt; display:inline-block;">🔥 HOTS</span>')
        .replace(/\[(LOTS)\]/gi, '<span style="background-color:#f1f5f9; color:#475569; border:1px solid #cbd5e1; padding:2px 6px; border-radius:4px; font-weight:bold; font-size:8.5pt; display:inline-block;">📖 LOTS</span>')
        .replace(/\[(Tujuan Pembelajaran|TP)\]/gi, '<span style="background-color:#dbeafe; color:#1e40af; border:1px solid #93c5fd; padding:2px 8px; border-radius:6px; font-weight:bold; font-size:8.5pt; display:inline-block; margin:2px 1px;">🎯 Tujuan Pembelajaran</span>')
        .replace(/\[(Alur Tujuan Pembelajaran|ATP)\]/gi, '<span style="background-color:#e0e7ff; color:#3730a3; border:1px solid #a5b4fc; padding:2px 8px; border-radius:6px; font-weight:bold; font-size:8.5pt; display:inline-block; margin:2px 1px;">📈 ATP</span>')
        .replace(/\[(Asesmen Formatif)\]/gi, '<span style="background-color:#dcfce7; color:#15803d; border:1px solid #86efac; padding:2px 8px; border-radius:6px; font-weight:bold; font-size:8.5pt; display:inline-block; margin:2px 1px;">📝 Asesmen Formatif</span>')
        .replace(/\[(Asesmen Sumatif)\]/gi, '<span style="background-color:#fef3c7; color:#92400e; border:1px solid #fcd34d; padding:2px 8px; border-radius:6px; font-weight:bold; font-size:8.5pt; display:inline-block; margin:2px 1px;">📊 Asesmen Sumatif</span>')
        .replace(/\[(Asesmen Diagnostik)\]/gi, '<span style="background-color:#ffedd5; color:#c2410c; border:1px solid #fdba74; padding:2px 8px; border-radius:6px; font-weight:bold; font-size:8.5pt; display:inline-block; margin:2px 1px;">🔍 Asesmen Diagnostik</span>')
        .replace(/\[(KKTP)\]/gi, '<span style="background-color:#e0f2fe; color:#0369a1; border:1px solid #7dd3fc; padding:2px 6px; border-radius:4px; font-weight:bold; font-size:8.5pt; display:inline-block;">🎯 KKTP</span>')
        .replace(/\[(Tuntas)\]/gi, '<span style="background-color:#dcfce7; color:#15803d; border:1px solid #86efac; padding:2px 8px; border-radius:12px; font-weight:bold; font-size:8.5pt; display:inline-block;">✓ Tuntas</span>')
        .replace(/\[(Remedial|Belum Tuntas)\]/gi, '<span style="background-color:#fee2e2; color:#991b1b; border:1px solid #fca5a5; padding:2px 8px; border-radius:12px; font-weight:bold; font-size:8.5pt; display:inline-block;">⚠ Remedial</span>')
        .replace(/\[(Kegiatan Awal|Pendahuluan)\]/gi, '<span style="background-color:#eff6ff; color:#1d4ed8; border:1px solid #93c5fd; padding:2px 8px; border-radius:6px; font-weight:bold; font-size:8.5pt; display:inline-block; margin:2px 1px;">1️⃣ Pendahuluan</span>')
        .replace(/\[(Kegiatan Inti)\]/gi, '<span style="background-color:#f0fdf4; color:#15803d; border:1px solid #86efac; padding:2px 8px; border-radius:6px; font-weight:bold; font-size:8.5pt; display:inline-block; margin:2px 1px;">2️⃣ Kegiatan Inti</span>')
        .replace(/\[(Kegiatan Penutup|Penutup)\]/gi, '<span style="background-color:#fdf2f8; color:#9d174d; border:1px solid #fbcfe8; padding:2px 8px; border-radius:6px; font-weight:bold; font-size:8.5pt; display:inline-block; margin:2px 1px;">3️⃣ Penutup</span>')
        .replace(/\[(Refleksi Guru|Refleksi Siswa|Refleksi)\]/gi, '<span style="background-color:#f3e8ff; color:#6b21a8; border:1px solid #d8b4fe; padding:2px 8px; border-radius:6px; font-weight:bold; font-size:8.5pt; display:inline-block; margin:2px 1px;">🪞 $1</span>')
        .replace(/\[(Pengayaan)\]/gi, '<span style="background-color:#f0fdf4; color:#15803d; border:1px solid #86efac; padding:2px 8px; border-radius:6px; font-weight:bold; font-size:8.5pt; display:inline-block; margin:2px 1px;">🚀 Pengayaan</span>');
    };

    const mathBlockTokens: string[] = [];
    const mathInlineTokens: string[] = [];
    const codeBlockTokens: string[] = [];
    const imageTokens: string[] = [];

    let processed = cleanedSource;

    // STEP 1: Extract Fenced Code Blocks (``` ... ```)
    processed = processed.replace(/```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g, (_, lang, code) => {
      const rawCode = code.trim();
      const isCanvas = rawCode.includes('KANVAS') || rawCode.includes('SKETSA') || rawCode.includes('KREASI');
      const isDiagram = rawCode.includes('DIAGRAM') || rawCode.includes('SKEMA') || rawCode.includes('ALUR') || rawCode.includes('+---') || rawCode.includes('┌');

      let blockHeader = '';
      if (isCanvas) {
        blockHeader = `<div style="background:#e0e7ff; color:#3730a3; font-weight:bold; font-size:8.5pt; padding:5px 12px; border-bottom:1px solid #c7d2fe; display:flex; align-items:center; justify-content:space-between;"><span>🎨 KANVAS SKETSA & DIAGRAM SISWA</span><span style="font-size:7.5pt; color:#4338ca;">(Ruang Gambar & Visualisasi Kreatif Siswa)</span></div>`;
      } else if (isDiagram) {
        blockHeader = `<div style="background:#f0fdf4; color:#166534; font-weight:bold; font-size:8.5pt; padding:5px 12px; border-bottom:1px solid #bbf7d0; display:flex; align-items:center; justify-content:space-between;"><span>📊 DIAGRAM KONSEP & SKEMA ALUR ILMIAH</span><span style="font-size:7.5pt; color:#15803d;">(Representasi Visual Konseptual)</span></div>`;
      }

      const borderStyle = isCanvas
        ? 'border: 2px dashed #6366f1; background-color: #f8fafc;'
        : 'border: 1.5px solid #cbd5e1; background-color: #f8fafc;';

      const escaped = rawCode
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

      const tokenIndex = codeBlockTokens.length;
      const html = `<div style="border-radius:8px; overflow:hidden; margin:14px 0; page-break-inside:avoid; break-inside:avoid; ${borderStyle}">
        ${blockHeader}
        <pre style="margin:0; padding:12px; font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace; font-size:8.5pt; line-height:1.45; color:#1e293b; white-space:pre; overflow-x:auto; background-color:#f8fafc;">${escaped}</pre>
      </div>`;
      codeBlockTokens.push(html);
      return `\n\n__CODE_BLOCK_${tokenIndex}__\n\n`;
    });

    // STEP 2: Extract Block LaTeX: $$...$$ or \[...\]
    processed = processed.replace(/\$\$([\s\S]*?)\$\$/g, (_, math) => {
      const tokenIndex = mathBlockTokens.length;
      let rendered = '';
      try {
        rendered = `<div class="katex-block" style="text-align:center; margin:12px 0; padding:8px; background:#f8fafc; border-radius:6px; border:1px solid #cbd5e1; page-break-inside:avoid; break-inside:avoid;">${katex.renderToString(
          math.trim(),
          { displayMode: true, throwOnError: false }
        )}</div>`;
      } catch {
        rendered = `<div style="font-family:monospace; color:#dc2626; padding:6px; background:#fee2e2; border-radius:4px; font-size:9pt;">${math.trim()}</div>`;
      }
      mathBlockTokens.push(rendered);
      return `\n\n__MATH_BLOCK_${tokenIndex}__\n\n`;
    });

    processed = processed.replace(/\\\[([\s\S]*?)\\\]/g, (_, math) => {
      const tokenIndex = mathBlockTokens.length;
      let rendered = '';
      try {
        rendered = `<div class="katex-block" style="text-align:center; margin:12px 0; padding:8px; background:#f8fafc; border-radius:6px; border:1px solid #cbd5e1; page-break-inside:avoid; break-inside:avoid;">${katex.renderToString(
          math.trim(),
          { displayMode: true, throwOnError: false }
        )}</div>`;
      } catch {
        rendered = `<div style="font-family:monospace; color:#dc2626; padding:6px; background:#fee2e2; border-radius:4px; font-size:9pt;">${math.trim()}</div>`;
      }
      mathBlockTokens.push(rendered);
      return `\n\n__MATH_BLOCK_${tokenIndex}__\n\n`;
    });

    // STEP 3: Extract Inline LaTeX: $...$ or \(...\)
    processed = processed.replace(/\$([^\$\n\r]+?)\$/g, (_, math) => {
      const tokenIndex = mathInlineTokens.length;
      let rendered = '';
      try {
        rendered = `<span class="katex-inline" style="display:inline-block; margin:0 2px;">${katex.renderToString(
          math.trim(),
          { displayMode: false, throwOnError: false }
        )}</span>`;
      } catch {
        rendered = `<code style="background:#f1f5f9; color:#0f172a; padding:1px 4px; border-radius:3px; font-size:9pt; font-family:monospace;">${math.trim()}</code>`;
      }
      mathInlineTokens.push(rendered);
      return `__MATH_INLINE_${tokenIndex}__`;
    });

    processed = processed.replace(/\\\(([\s\S]*?)\\\)/g, (_, math) => {
      const tokenIndex = mathInlineTokens.length;
      let rendered = '';
      try {
        rendered = `<span class="katex-inline" style="display:inline-block; margin:0 2px;">${katex.renderToString(
          math.trim(),
          { displayMode: false, throwOnError: false }
        )}</span>`;
      } catch {
        rendered = `<code style="background:#f1f5f9; color:#0f172a; padding:1px 4px; border-radius:3px; font-size:9pt; font-family:monospace;">${math.trim()}</code>`;
      }
      mathInlineTokens.push(rendered);
      return `__MATH_INLINE_${tokenIndex}__`;
    });

    // STEP 4: Extract Images: ![alt](url)
    processed = processed.replace(/!\[(.*?)\]\((.*?)\)/g, (_, alt, url) => {
      const safeAlt = alt || 'Ilustrasi Pembelajaran';
      const safeUrl = url.trim();
      const tokenIndex = imageTokens.length;
      const html = `<div style="text-align:center; margin:16px 0; padding:12px; background-color:#f8fafc; border:1.5px solid #e2e8f0; border-radius:10px; page-break-inside:avoid; break-inside:avoid;">
        <img src="${safeUrl}" alt="${safeAlt}" style="max-width:100%; max-height:420px; border-radius:8px; display:inline-block; box-shadow:0 4px 6px -1px rgba(0,0,0,0.1);" />
        <div style="font-size:8.5pt; font-weight:bold; color:#64748b; margin-top:6px;">📷 <em>${safeAlt}</em></div>
      </div>`;
      imageTokens.push(html);
      return `\n\n__IMAGE_${tokenIndex}__\n\n`;
    });

    // STEP 5: Line-by-Line Parsing for Tables, Headings, Lists, Blockquotes, Checkboxes
    const rawLines = processed.split(/\r?\n/);
    const htmlLines: string[] = [];
    let inTable = false;
    let tableHeaders: string[] = [];
    let tableRows: string[][] = [];
    let inList = false;
    let listType: 'ul' | 'ol' = 'ul';

    const detectType = (str: string): 'libur' | 'kbm' | 'mpls' | 'asts' | 'asas' | 'p5' | 'rapor' | 'anbk' | 'remedial' | null => {
      if (!str) return null;
      const s = str.toUpperCase();
      if (s.includes('LIBUR') || s.includes('🔴') || s.includes('[LS1]') || s.includes('[LS2]') || s.includes('[LHR]') || s.includes('[LPP]')) return 'libur';
      if (s.includes('MPLS') || s.includes('🟠')) return 'mpls';
      if (s.includes('ASTS') || s.includes('PTS') || s.includes('STS') || s.includes('🟡')) return 'asts';
      if (s.includes('ASAS') || s.includes('PAS') || s.includes('SAS') || s.includes('PAT') || s.includes('AAS') || s.includes('🟣')) return 'asas';
      if (s.includes('P5') || s.includes('PROJEK') || s.includes('🔵')) return 'p5';
      if (s.includes('RAPOR') || s.includes('RAPORT') || s.includes('⚪')) return 'rapor';
      if (s.includes('ANBK') || s.includes('🟤')) return 'anbk';
      if (s.includes('REMEDIAL') || s.includes('CADANGAN') || s.includes('🌸')) return 'remedial';
      if (s.includes('KBM') || s.includes('🟢')) return 'kbm';
      return null;
    };

    let lastHeading = '';
    const closeTable = () => {
      if (inTable && (tableHeaders.length > 0 || tableRows.length > 0)) {
        const colType: Record<number, 'libur' | 'kbm' | 'mpls' | 'asts' | 'asas' | 'p5' | 'rapor' | 'anbk' | 'remedial' | null> = {};

        for (const row of tableRows) {
          const rowText = row.join(' ').toUpperCase();
          if (rowText.includes('AGENDA') || rowText.includes('KALDIK') || rowText.includes('LIBUR') || rowText.includes('KBM') || rowText.includes('ASTS') || rowText.includes('ASAS')) {
            row.forEach((cell, cIdx) => {
              const detected = detectType(cell);
              if (detected && !colType[cIdx]) {
                colType[cIdx] = detected;
              }
            });
          }
        }

        tableHeaders.forEach((th, cIdx) => {
          const detected = detectType(th);
          if (detected && !colType[cIdx]) {
            colType[cIdx] = detected;
          }
        });

        // Detect RPM table types
        const headerStr = tableHeaders.join(' ').toUpperCase();
        const isSintaksTable = headerStr.includes('TAHAP SINTAKS') || (headerStr.includes('FASE') && headerStr.includes('TUJUAN'));
        const isMeetingScenarioTable = headerStr.includes('KEGIATAN GURU') || headerStr.includes('KEGIATAN PESERTA DIDIK');
        const isMeeting1 = isMeetingScenarioTable && (lastHeading.includes('PERTEMUAN 1') || headerStr.includes('PERTEMUAN 1'));
        const isMeeting2Plus = isMeetingScenarioTable && !isMeeting1;
        const isDiferensiasiTable = headerStr.includes('REGULER') || (headerStr.includes('KEBUTUHAN KHUSUS') && headerStr.includes('BERPRESTASI'));
        const isAsesmenTable = headerStr.includes('JENIS ASESMEN') || (headerStr.includes('INSTRUMEN') && headerStr.includes('ASPEK YANG DINILAI'));
        const isIdentitasTable = lastHeading === 'IDENTITAS MODUL' || tableRows.some(r => (r[0] || '').toUpperCase().includes('MATA PELAJARAN') || (r[0] || '').toUpperCase().includes('MATERI POKOK'));
        const isMediaTable = headerStr.includes('RINCIAN MEDIA') || lastHeading.includes('MEDIA, ALAT') || tableRows.some(r => (r[0] || '').toUpperCase().includes('MEDIA PEMBELAJARAN') || (r[0] || '').toUpperCase().includes('ALAT & BAHAN'));

        let tableBorderColor = '#1e3a8a';
        let defaultHeaderBg = '#1e3a8a';
        let defaultHeaderColor = '#ffffff';

        if (isMeeting1) {
          tableBorderColor = '#d84315';
          defaultHeaderBg = '#d84315';
        } else if (isMeeting2Plus) {
          tableBorderColor = '#0288d1';
          defaultHeaderBg = '#0288d1';
        } else if (isSintaksTable) {
          tableBorderColor = '#00695c';
          defaultHeaderBg = '#00695c';
        } else if (isDiferensiasiTable || isAsesmenTable) {
          tableBorderColor = '#0288d1';
          defaultHeaderBg = '#e0f2fe';
          defaultHeaderColor = '#01579b';
        } else if (isIdentitasTable) {
          tableBorderColor = '#0288d1';
          defaultHeaderBg = '#0288d1';
          defaultHeaderColor = '#ffffff';
        } else if (isMediaTable) {
          tableBorderColor = '#00897b';
          defaultHeaderBg = '#00897b';
          defaultHeaderColor = '#ffffff';
        }

        let tableHtml = `<div style="overflow-x:auto; margin:14px 0; page-break-inside:avoid; break-inside:avoid;"><table style="width:100%; border-collapse:collapse; font-size:9.5pt; border:1.5px solid ${tableBorderColor};">`;
        if (tableHeaders.length > 0) {
          tableHtml += `<thead><tr style="background-color:${defaultHeaderBg}; color:${defaultHeaderColor};">`;
          tableHeaders.forEach((th, cIdx) => {
            const cType = colType[cIdx];
            let headerBg = defaultHeaderBg;
            let headerColor = defaultHeaderColor;
            let headerBorder = tableBorderColor;
            if (cType === 'libur') {
              headerBg = '#b91c1c';
              headerBorder = '#991b1b';
              headerColor = '#ffffff';
            } else if (cType === 'mpls') {
              headerBg = '#c2410c';
              headerBorder = '#9a3412';
              headerColor = '#ffffff';
            } else if (cType === 'asts') {
              headerBg = '#a16207';
              headerBorder = '#854d0e';
              headerColor = '#ffffff';
            } else if (cType === 'asas') {
              headerBg = '#7e22ce';
              headerBorder = '#6b21a8';
              headerColor = '#ffffff';
            } else if (cType === 'p5') {
              headerBg = '#0369a1';
              headerBorder = '#075985';
              headerColor = '#ffffff';
            } else if (cType === 'rapor') {
              headerBg = '#475569';
              headerBorder = '#334155';
              headerColor = '#ffffff';
            } else if (cType === 'anbk') {
              headerBg = '#0f766e';
              headerBorder = '#115e59';
              headerColor = '#ffffff';
            } else if (cType === 'remedial') {
              headerBg = '#be185d';
              headerBorder = '#9d174d';
              headerColor = '#ffffff';
            }

            tableHtml += `<th style="border:1px solid ${headerBorder}; padding:7px 8px; font-weight:bold; text-align:center; color:${headerColor}; background-color:${headerBg}; font-size:9pt;">${th}</th>`;
          });
          tableHtml += '</tr></thead>';
        }
        tableHtml += '<tbody>';

        tableRows.forEach((row, rIdx) => {
          const rowFirstCell = (row[0] || '').toUpperCase();
          const rowSecondCell = (row[1] || '').toUpperCase();
          const isTotalRow = rowFirstCell.includes('TOT') || rowFirstCell.includes('TOTAL') || rowSecondCell.includes('TOTAL') || rowSecondCell.includes('JUMLAH');
          const isAgendaRow = rowFirstCell.includes('AGENDA') || rowSecondCell.includes('AGENDA') || rowSecondCell.includes('KALDIK');

          let defaultRowBg = rIdx % 2 === 1 ? 'background-color:#f8fafc;' : 'background-color:#ffffff;';
          if (isTotalRow) {
            defaultRowBg = 'background-color:#e2e8f0; font-weight:bold; color:#0f172a;';
          } else if (isAgendaRow) {
            defaultRowBg = 'background-color:#f1f5f9; font-weight:bold;';
          }

          tableHtml += `<tr style="${defaultRowBg}">`;

          row.forEach((cell, cIdx) => {
            let cellStyle = `border:1px solid ${tableBorderColor}; padding:6px 8px; vertical-align:middle;`;
            const align = (cIdx === 0 && cell.length <= 5) || cell.includes('span') || cell.length <= 6 ? 'text-align:center;' : 'text-align:left;';
            cellStyle += ` ${align}`;

            // Specialized RPM Column Styling
            if (cIdx === 0) {
              if (isSintaksTable) {
                cellStyle += ' font-weight:bold; color:#00897b; text-align:center;';
              } else if (isMeeting1) {
                cellStyle += ' font-weight:bold; color:#d84315; text-align:center;';
              } else if (isMeeting2Plus) {
                cellStyle += ' font-weight:bold; color:#0288d1; text-align:center;';
              } else if (isIdentitasTable) {
                cellStyle += ' font-weight:bold; color:#0288d1; background-color:#f0f9ff;';
              } else if (isMediaTable) {
                cellStyle += ' font-weight:bold; color:#00897b; background-color:#f0fdf4;';
              }
            }

            const cellType = detectType(cell);
            const inheritedColType = colType[cIdx];
            const activeType = cellType || (inheritedColType && (cell === '-' || cell === '---' || cell === '' || isAgendaRow) ? inheritedColType : null);

            let cellContent = cell;

            if (activeType === 'libur') {
              cellStyle += ' background-color:#fee2e2 !important; border:1px solid #fca5a5 !important; color:#991b1b !important; font-weight:bold; text-align:center;';
              if (cell === '-' || cell === '---' || cell === '') {
                cellContent = '<span style="color:#b91c1c; font-size:8pt; font-weight:bold; display:inline-block; padding:1px 4px; background:#fee2e2; border-radius:4px;">🔴 LIBUR</span>';
              }
            } else if (activeType === 'kbm') {
              cellStyle += ' background-color:#dcfce7 !important; border:1px solid #86efac !important; color:#15803d !important; font-weight:bold; text-align:center;';
            } else if (activeType === 'mpls') {
              cellStyle += ' background-color:#ffedd5 !important; border:1px solid #fdba74 !important; color:#c2410c !important; font-weight:bold; text-align:center;';
              if (cell === '-' || cell === '---' || cell === '') {
                cellContent = '<span style="color:#c2410c; font-size:8pt; font-weight:bold;">🟠 MPLS</span>';
              }
            } else if (activeType === 'asts') {
              cellStyle += ' background-color:#fef9c3 !important; border:1px solid #fde047 !important; color:#854d0e !important; font-weight:bold; text-align:center;';
              if (cell === '-' || cell === '---' || cell === '') {
                cellContent = '<span style="color:#854d0e; font-size:8pt; font-weight:bold;">🟡 ASTS</span>';
              }
            } else if (activeType === 'asas') {
              cellStyle += ' background-color:#f3e8ff !important; border:1px solid #d8b4fe !important; color:#6b21a8 !important; font-weight:bold; text-align:center;';
              if (cell === '-' || cell === '---' || cell === '') {
                cellContent = '<span style="color:#6b21a8; font-size:8pt; font-weight:bold;">🟣 ASAS</span>';
              }
            } else if (activeType === 'p5') {
              cellStyle += ' background-color:#e0f2fe !important; border:1px solid #7dd3fc !important; color:#0369a1 !important; font-weight:bold; text-align:center;';
              if (cell === '-' || cell === '---' || cell === '') {
                cellContent = '<span style="color:#0369a1; font-size:8pt; font-weight:bold;">🔵 P5</span>';
              }
            } else if (activeType === 'rapor') {
              cellStyle += ' background-color:#f1f5f9 !important; border:1px solid #cbd5e1 !important; color:#334155 !important; font-weight:bold; text-align:center;';
              if (cell === '-' || cell === '---' || cell === '') {
                cellContent = '<span style="color:#334155; font-size:8pt; font-weight:bold;">⚪ RAPOR</span>';
              }
            } else if (activeType === 'anbk') {
              cellStyle += ' background-color:#ccfbf1 !important; border:1px solid #5eead4 !important; color:#0f766e !important; font-weight:bold; text-align:center;';
              if (cell === '-' || cell === '---' || cell === '') {
                cellContent = '<span style="color:#0f766e; font-size:8pt; font-weight:bold;">🟤 ANBK</span>';
              }
            } else if (activeType === 'remedial') {
              cellStyle += ' background-color:#ffe4e6 !important; border:1px solid #fda4af !important; color:#9f1239 !important; font-weight:bold; text-align:center;';
              if (cell === '-' || cell === '---' || cell === '') {
                cellContent = '<span style="color:#9f1239; font-size:8pt; font-weight:bold;">🌸 CAD</span>';
              }
            } else if (isTotalRow) {
              cellStyle += ' font-weight:bold; color:#0f172a;';
            }

            tableHtml += `<td style="${cellStyle}">${cellContent}</td>`;
          });
          tableHtml += '</tr>';
        });

        tableHtml += '</tbody></table></div>';
        htmlLines.push(tableHtml);
        inTable = false;
        tableHeaders = [];
        tableRows = [];
      }
    };

    const closeList = () => {
      if (inList) {
        htmlLines.push(listType === 'ul' ? '</ul>' : '</ol>');
        inList = false;
      }
    };

    for (let i = 0; i < rawLines.length; i++) {
      let line = rawLines[i].trim();

      // Check placeholder tokens on their own line
      if (/^__(CODE_BLOCK|MATH_BLOCK|IMAGE)_\d+__$/.test(line)) {
        closeList();
        closeTable();
        htmlLines.push(line);
        continue;
      }

      // Check for Markdown Table: | col1 | col2 |
      if (line.startsWith('|') && line.endsWith('|')) {
        closeList();
        if (/^\|[\s\-:|]+\|$/.test(line)) {
          continue;
        }

        const rawCells = line
          .slice(1, -1)
          .split('|')
          .map((c) => formatBadgeChip(c.trim().replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')));

        if (!inTable) {
          inTable = true;
          tableHeaders = rawCells;
        } else {
          tableRows.push(rawCells);
        }
        continue;
      } else {
        closeTable();
      }

      // Empty line
      if (!line) {
        closeList();
        htmlLines.push('<div style="height:6px;"></div>');
        continue;
      }

      // Horizontal Rule or Page Break
      if (line === '---' || line === '***' || line === '___') {
        closeList();
        htmlLines.push('<hr style="border:0; border-top:2px solid #cbd5e1; margin:20px 0 16px 0;" />');
        continue;
      }

      if (line.includes('page-break') || line.startsWith('<div style="page-break')) {
        closeList();
        htmlLines.push('<div class="page-break" style="page-break-before:always; break-before:page; margin-top:24px; margin-bottom:18px;"></div>');
        continue;
      }

      // RPM Hero Header Banner
      if (line.startsWith('# RENCANA PELAKSANAAN MODUL') || line.includes('RENCANA PELAKSANAAN MODUL (RPM)')) {
        closeList();
        let subtitle1 = 'Model Pembelajaran: DEEP LEARNING';
        let subtitle2 = '';
        if (i + 1 < rawLines.length && rawLines[i + 1].includes('DEEP LEARNING')) {
          subtitle1 = rawLines[i + 1].replace(/^[#\s*]+/, '').trim();
          i++;
        }
        if (i + 1 < rawLines.length && (rawLines[i + 1].includes('Mata Pelajaran') || rawLines[i + 1].includes('Kelas'))) {
          subtitle2 = rawLines[i + 1].replace(/^[#\s*]+/, '').trim();
          i++;
        }
        htmlLines.push(`
          <div style="background-color:#1565c0; color:#ffffff; padding:16px 20px; border-radius:6px; text-align:center; margin:16px 0 14px 0; border:1px solid #0d47a1; box-shadow:0 2px 4px rgba(0,0,0,0.08); page-break-after:avoid; break-after:avoid;">
            <h1 style="font-size:15pt; font-weight:900; margin:0; text-transform:uppercase; letter-spacing:0.5px; color:#ffffff;">RENCANA PELAKSANAAN MODUL (RPM)</h1>
            <div style="font-size:11pt; font-weight:bold; color:#fde047; margin:5px 0 3px 0;">${subtitle1}</div>
            ${subtitle2 ? `<div style="font-size:9.5pt; color:#e0f2fe; font-weight:500;">${subtitle2}</div>` : ''}
          </div>
        `);
        continue;
      }

      // Specialized RPM Section Banners
      const upperLine = line.toUpperCase();
      if (upperLine.includes('IDENTITAS MODUL')) {
        closeList();
        lastHeading = 'IDENTITAS MODUL';
        const cleanText = line.replace(/^[#\s*]+/, '').trim();
        const display = cleanText.startsWith('A.') ? cleanText : 'A. IDENTITAS MODUL';
        htmlLines.push(`<div style="background-color:#0288d1; color:#ffffff; padding:7px 14px; font-weight:bold; font-size:10.5pt; text-align:center; text-transform:uppercase; letter-spacing:0.5px; margin:16px 0 8px 0; border-radius:3px; page-break-after:avoid; break-after:avoid;">${display}</div>`);
        continue;
      }
      if (upperLine.includes('KOMPETENSI YANG DICAPAI')) {
        closeList();
        lastHeading = 'KOMPETENSI YANG DICAPAI';
        const cleanText = line.replace(/^[#\s*]+/, '').trim();
        const display = cleanText.startsWith('B.') ? cleanText : 'B. KOMPETENSI YANG DICAPAI';
        htmlLines.push(`<div style="background-color:#0288d1; color:#ffffff; padding:7px 14px; font-weight:bold; font-size:10.5pt; text-align:center; text-transform:uppercase; letter-spacing:0.5px; margin:16px 0 8px 0; border-radius:3px; page-break-after:avoid; break-after:avoid;">${display}</div>`);
        continue;
      }
      if (upperLine.includes('SINTAKS DEEP LEARNING') || upperLine.includes('SINTAKS (DESAIN PEMBELAJARAN DEEP LEARNING')) {
        closeList();
        lastHeading = 'SINTAKS DEEP LEARNING';
        const cleanText = line.replace(/^[#\s*]+/, '').trim();
        const display = cleanText.startsWith('C.') ? cleanText : 'C. SINTAKS (Desain Pembelajaran DEEP LEARNING)';
        htmlLines.push(`<div style="background-color:#00897b; color:#ffffff; padding:7px 14px; font-weight:bold; font-size:10.5pt; text-align:center; text-transform:uppercase; letter-spacing:0.5px; margin:16px 0 8px 0; border-radius:3px; page-break-after:avoid; break-after:avoid;">${display}</div>`);
        continue;
      }
      if (upperLine.includes('PERTEMUAN 1') && (line.startsWith('#') || upperLine.includes('MENIT'))) {
        closeList();
        lastHeading = 'PERTEMUAN 1';
        const cleanText = line.replace(/^[#\s*]+/, '').trim();
        htmlLines.push(`<div style="background-color:#d84315; color:#ffffff; padding:7px 14px; font-weight:bold; font-size:10.5pt; text-align:left; text-transform:uppercase; letter-spacing:0.5px; margin:18px 0 0 0; border-radius:3px 3px 0 0; page-break-after:avoid; break-after:avoid;">${cleanText}</div>`);
        continue;
      }
      if (/PERTEMUAN\s+[2-9]/.test(upperLine) && (line.startsWith('#') || upperLine.includes('MENIT'))) {
        closeList();
        lastHeading = 'PERTEMUAN 2+';
        const cleanText = line.replace(/^[#\s*]+/, '').trim();
        htmlLines.push(`<div style="background-color:#0288d1; color:#ffffff; padding:7px 14px; font-weight:bold; font-size:10.5pt; text-align:left; text-transform:uppercase; letter-spacing:0.5px; margin:18px 0 0 0; border-radius:3px 3px 0 0; page-break-after:avoid; break-after:avoid;">${cleanText}</div>`);
        continue;
      }
      if (upperLine.includes('KOMPETENSI AWAL & IDENTIFIKASI PESERTA DIDIK') || upperLine.includes('KOMPETENSI AWAL DAN IDENTIFIKASI PESERTA DIDIK')) {
        closeList();
        lastHeading = 'KOMPETENSI AWAL & IDENTIFIKASI PESERTA DIDIK';
        const cleanText = line.replace(/^[#\s*]+/, '').trim();
        const display = cleanText.startsWith('B.') ? cleanText : 'B. KOMPETENSI AWAL & IDENTIFIKASI PESERTA DIDIK';
        htmlLines.push(`<div style="background-color:#0288d1; color:#ffffff; padding:7px 14px; font-weight:bold; font-size:10.5pt; text-align:center; text-transform:uppercase; letter-spacing:0.5px; margin:16px 0 8px 0; border-radius:3px; page-break-after:avoid; break-after:avoid;">${display}</div>`);
        continue;
      }
      if (upperLine.includes('DESAIN PEMBELAJARAN') && (line.startsWith('#') || upperLine.startsWith('C.'))) {
        closeList();
        lastHeading = 'DESAIN PEMBELAJARAN';
        const cleanText = line.replace(/^[#\s*]+/, '').trim();
        const display = cleanText.startsWith('C.') ? cleanText : 'C. DESAIN PEMBELAJARAN';
        htmlLines.push(`<div style="background-color:#00897b; color:#ffffff; padding:7px 14px; font-weight:bold; font-size:10.5pt; text-align:center; text-transform:uppercase; letter-spacing:0.5px; margin:16px 0 8px 0; border-radius:3px; page-break-after:avoid; break-after:avoid;">${display}</div>`);
        continue;
      }
      if (upperLine.includes('LANGKAH-LANGKAH PEMBELAJARAN') || upperLine.includes('LANGKAH LANGKAH PEMBELAJARAN')) {
        closeList();
        lastHeading = 'LANGKAH-LANGKAH PEMBELAJARAN';
        const cleanText = line.replace(/^[#\s*]+/, '').trim();
        const display = cleanText.startsWith('D.') ? cleanText : 'D. LANGKAH-LANGKAH PEMBELAJARAN';
        htmlLines.push(`<div style="background-color:#00897b; color:#ffffff; padding:7px 14px; font-weight:bold; font-size:10.5pt; text-align:center; text-transform:uppercase; letter-spacing:0.5px; margin:16px 0 8px 0; border-radius:3px; page-break-after:avoid; break-after:avoid;">${display}</div>`);
        continue;
      }
      if (upperLine.includes('MEDIA DAN SUMBER BELAJAR') || upperLine.includes('MEDIA & SUMBER BELAJAR')) {
        closeList();
        lastHeading = 'MEDIA DAN SUMBER BELAJAR';
        const cleanText = line.replace(/^[#\s*]+/, '').trim();
        const display = cleanText.startsWith('F.') ? cleanText : 'F. MEDIA DAN SUMBER BELAJAR';
        htmlLines.push(`<div style="background-color:#00897b; color:#ffffff; padding:7px 14px; font-weight:bold; font-size:10.5pt; text-align:center; text-transform:uppercase; letter-spacing:0.5px; margin:16px 0 8px 0; border-radius:3px; page-break-after:avoid; break-after:avoid;">${display}</div>`);
        continue;
      }
      if (upperLine.includes('PROGRAM REMEDIAL DAN PENGAYAAN') || upperLine.includes('PROGRAM REMEDIAL & PENGAYAAN')) {
        closeList();
        lastHeading = 'PROGRAM REMEDIAL DAN PENGAYAAN';
        const cleanText = line.replace(/^[#\s*]+/, '').trim();
        const display = cleanText.startsWith('G.') ? cleanText : 'G. PROGRAM REMEDIAL DAN PENGAYAAN';
        htmlLines.push(`<div style="background-color:#0288d1; color:#ffffff; padding:7px 14px; font-weight:bold; font-size:10.5pt; text-align:center; text-transform:uppercase; letter-spacing:0.5px; margin:16px 0 8px 0; border-radius:3px; page-break-after:avoid; break-after:avoid;">${display}</div>`);
        continue;
      }
      if (upperLine.includes('REFLEKSI GURU') && (line.startsWith('#') || upperLine.startsWith('H.'))) {
        closeList();
        lastHeading = 'REFLEKSI GURU';
        const cleanText = line.replace(/^[#\s*]+/, '').trim();
        const display = cleanText.startsWith('H.') ? cleanText : 'H. REFLEKSI GURU';
        htmlLines.push(`<div style="background-color:#1565c0; color:#ffffff; padding:7px 14px; font-weight:bold; font-size:10.5pt; text-align:center; text-transform:uppercase; letter-spacing:0.5px; margin:16px 0 8px 0; border-radius:3px; page-break-after:avoid; break-after:avoid;">${display}</div>`);
        continue;
      }
      if (upperLine.includes('ASESMEN PEMBELAJARAN')) {
        closeList();
        lastHeading = 'ASESMEN PEMBELAJARAN';
        const cleanText = line.replace(/^[#\s*]+/, '').trim();
        const display = cleanText.startsWith('E.') ? cleanText : cleanText.startsWith('D.') ? cleanText : 'E. ASESMEN PEMBELAJARAN';
        htmlLines.push(`<div style="background-color:#00897b; color:#ffffff; padding:7px 14px; font-weight:bold; font-size:10.5pt; text-align:center; text-transform:uppercase; letter-spacing:0.5px; margin:16px 0 8px 0; border-radius:3px; page-break-after:avoid; break-after:avoid;">${display}</div>`);
        continue;
      }
      if (upperLine.includes('MEDIA, ALAT, DAN SUMBER BELAJAR') || upperLine.includes('MEDIA, ALAT DAN SUMBER')) {
        closeList();
        lastHeading = 'MEDIA, ALAT, DAN SUMBER BELAJAR';
        const cleanText = line.replace(/^[#\s*]+/, '').trim();
        const display = cleanText.startsWith('E.') ? cleanText : 'E. MEDIA, ALAT, DAN SUMBER BELAJAR';
        htmlLines.push(`<div style="background-color:#00897b; color:#ffffff; padding:7px 14px; font-weight:bold; font-size:10.5pt; text-align:center; text-transform:uppercase; letter-spacing:0.5px; margin:16px 0 8px 0; border-radius:3px; page-break-after:avoid; break-after:avoid;">${display}</div>`);
        continue;
      }
      if (upperLine.includes('DIFERENSIASI PEMBELAJARAN')) {
        closeList();
        lastHeading = 'DIFERENSIASI PEMBELAJARAN';
        const cleanText = line.replace(/^[#\s*]+/, '').trim();
        const display = cleanText.startsWith('F.') ? cleanText : 'F. DIFERENSIASI PEMBELAJARAN';
        htmlLines.push(`<div style="background-color:#00897b; color:#ffffff; padding:7px 14px; font-weight:bold; font-size:10.5pt; text-align:center; text-transform:uppercase; letter-spacing:0.5px; margin:16px 0 8px 0; border-radius:3px; page-break-after:avoid; break-after:avoid;">${display}</div>`);
        continue;
      }
      if (upperLine.includes('CATATAN / REFLEKSI GURU') || upperLine.includes('REFLEKSI GURU')) {
        closeList();
        lastHeading = 'CATATAN / REFLEKSI GURU';
        htmlLines.push(`<div style="background-color:#1565c0; color:#ffffff; padding:7px 14px; font-weight:bold; font-size:10.5pt; text-align:center; text-transform:uppercase; letter-spacing:0.5px; margin:16px 0 8px 0; border-radius:3px; page-break-after:avoid; break-after:avoid;">CATATAN / REFLEKSI GURU</div>`);
        continue;
      }

      if (line.trim().startsWith('....') || line.trim().startsWith('····')) {
        closeList();
        htmlLines.push(`<div style="border-bottom:1.5px dotted #94a3b8; height:22px; margin:4px 0;"></div>`);
        continue;
      }

      // Headings with Professional Educational Colored Styling
      if (line.startsWith('#### ')) {
        closeList();
        const text = formatBadgeChip(line.replace('#### ', '').replace(/\*\*/g, ''));
        lastHeading = text;
        htmlLines.push(`<h4 style="font-size:10.5pt; font-weight:bold; color:#1e293b; margin:12px 0 4px 0; border-left:3px solid #64748b; padding-left:8px; page-break-after:avoid; break-after:avoid;">${text}</h4>`);
        continue;
      }
      if (line.startsWith('### ')) {
        closeList();
        const text = formatBadgeChip(line.replace('### ', '').replace(/\*\*/g, ''));
        lastHeading = text;
        htmlLines.push(`<h3 style="font-size:11.5pt; font-weight:bold; color:#0369a1; border-left:4px solid #0284c7; padding-left:10px; margin:16px 0 6px 0; background-color:#f0f9ff; padding-top:4px; padding-bottom:4px; border-radius:0 4px 4px 0; page-break-after:avoid; break-after:avoid;">${text}</h3>`);
        continue;
      }
      if (line.startsWith('## ')) {
        closeList();
        const text = formatBadgeChip(line.replace('## ', '').replace(/\*\*/g, ''));
        lastHeading = text;
        htmlLines.push(`<h2 style="font-size:12.5pt; font-weight:bold; color:#1e3a8a; margin:20px 0 8px 0; padding:6px 12px; background-color:#eff6ff; border-left:5px solid #2563eb; border-radius:0 6px 6px 0; letter-spacing:0.3px; page-break-after:avoid; break-after:avoid;">${text}</h2>`);
        continue;
      }
      if (line.startsWith('# ')) {
        closeList();
        const text = formatBadgeChip(line.replace('# ', '').replace(/\*\*/g, ''));
        lastHeading = text;
        htmlLines.push(`<div style="background:linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%); border:1.5px solid #3b82f6; border-radius:8px; padding:10px 16px; margin:18px 0 14px 0; text-align:center; page-break-after:avoid; break-after:avoid;"><h1 style="font-size:14.5pt; font-weight:bold; color:#1e3a8a; margin:0; text-transform:uppercase; letter-spacing:0.5px;">${text}</h1></div>`);
        continue;
      }

      // Blockquotes / Callout Boxes (> ...)
      if (line.startsWith('> ')) {
        closeList();
        let quoteContent = line.replace('> ', '');
        const hasEmoji = /^(📌|💡|⚠️|🔬|🎯|📝|🧠|🎉|⭐|🎨)/.test(quoteContent);
        const icon = hasEmoji ? quoteContent.slice(0, 2) : '📌';
        if (hasEmoji) {
          quoteContent = quoteContent.slice(2).trim();
        }
        const text = formatBadgeChip(
          quoteContent
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`([^`]+)`/g, '<code style="background:#e2e8f0; color:#0f172a; padding:1px 4px; border-radius:3px; font-size:9pt; font-family:monospace;">$1</code>')
        );
        htmlLines.push(`<div style="background-color:#f0fdf4; border-left:4px solid #16a34a; border:1px solid #bbf7d0; padding:10px 14px; margin:10px 0; font-size:10pt; color:#166534; border-radius:6px; line-height:1.6; page-break-inside:avoid; break-inside:avoid;"><span style="font-size:11pt; margin-right:4px;">${icon}</span>${text}</div>`);
        continue;
      }

      // Checkboxes / Task List in Markdown (- [ ] or - [x])
      if (/^\s*[-*]\s+\[([ xX])\]\s+/.test(line)) {
        closeList();
        const isChecked = /^\s*[-*]\s+\[([xX])\]\s+/.test(line);
        const label = line.replace(/^\s*[-*]\s+\[([ xX])\]\s+/, '');
        const itemText = formatBadgeChip(
          label
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`([^`]+)`/g, '<code style="background:#e2e8f0; color:#0f172a; padding:1px 4px; border-radius:3px; font-size:9pt; font-family:monospace;">$1</code>')
        );
        const checkIcon = isChecked
          ? '<span style="display:inline-block; width:16px; height:16px; line-height:14px; text-align:center; background:#4f46e5; color:#ffffff; font-weight:bold; font-size:10pt; border-radius:3px; margin-right:8px; vertical-align:middle;">✓</span>'
          : '<span style="display:inline-block; width:16px; height:16px; line-height:14px; border:1.5px solid #94a3b8; background:#ffffff; border-radius:3px; margin-right:8px; vertical-align:middle;"></span>';
        htmlLines.push(`<div style="margin:5px 0; font-size:10pt; color:#1e293b; line-height:1.6; display:flex; align-items:flex-start;">${checkIcon}<span>${itemText}</span></div>`);
        continue;
      }

      // Unordered lists (- or *)
      if (/^[-*]\s+/.test(line)) {
        if (!inList || listType !== 'ul') {
          closeList();
          inList = true;
          listType = 'ul';
          htmlLines.push('<ul style="margin:6px 0 6px 18px; padding-left:8px; line-height:1.6; font-size:10pt; color:#1e293b;">');
        }
        const itemText = formatBadgeChip(
          line
            .replace(/^[-*]\s+/, '')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`([^`]+)`/g, '<code style="background:#f1f5f9; color:#0f172a; padding:1px 4px; border-radius:3px; font-size:9pt; font-family:monospace;">$1</code>')
        );
        htmlLines.push(`<li style="margin-bottom:5px;">${itemText}</li>`);
        continue;
      }

      // Numbered lists (1. 2.)
      if (/^\d+\.\s+/.test(line)) {
        if (!inList || listType !== 'ol') {
          closeList();
          inList = true;
          listType = 'ol';
          htmlLines.push('<ol style="margin:6px 0 6px 18px; padding-left:8px; line-height:1.6; font-size:10pt; color:#1e293b;">');
        }
        const itemText = formatBadgeChip(
          line
            .replace(/^\d+\.\s+/, '')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`([^`]+)`/g, '<code style="background:#f1f5f9; color:#0f172a; padding:1px 4px; border-radius:3px; font-size:9pt; font-family:monospace;">$1</code>')
        );
        htmlLines.push(`<li style="margin-bottom:5px;">${itemText}</li>`);
        continue;
      }

      closeList();

      // Regular paragraph
      const formatted = formatBadgeChip(
        line
          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
          .replace(/\*(.*?)\*/g, '<em>$1</em>')
          .replace(/`([^`]+)`/g, '<code style="background:#f1f5f9; color:#0f172a; padding:1px 4px; border-radius:3px; font-size:9pt; font-family:monospace;">$1</code>')
      );
      htmlLines.push(`<p style="margin:6px 0; line-height:1.6; font-size:10.5pt; color:#1e293b; text-align:justify;">${formatted}</p>`);
    }

    closeTable();
    closeList();

    let fullHtml = htmlLines.join('\n');

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
  }

  /**
   * Export JSON data to Excel (.xlsx) file with professional educational formatting
   */
  static exportToExcel(
    data: any[],
    fileName: string,
    sheetName: string = 'Data',
    titleHeader?: { schoolName?: string; docTitle?: string; academicYear?: string; teacherName?: string }
  ): void {
    try {
      let ws: XLSX.WorkSheet;

      if (titleHeader) {
        // Build rows with school header
        const rows: any[][] = [
          ['PEMERINTAH PROVINSI / KABUPATEN - DINAS PENDIDIKAN DAN KEBUDAYAAN'],
          [titleHeader.schoolName?.toUpperCase() || 'SMA / SMK / SMP NEGERI'],
          [(titleHeader.docTitle?.toUpperCase() || fileName.toUpperCase()).replace(/_/g, ' ')],
          [`Tahun Pelajaran: ${titleHeader.academicYear || '2025/2026'} | Guru Pengampu: ${titleHeader.teacherName || '-'}`],
          [], // Empty separator row
        ];

        if (data.length > 0) {
          const colKeys = Object.keys(data[0]);
          rows.push(colKeys);
          data.forEach((item) => {
            rows.push(colKeys.map((k) => item[k]));
          });
        }

        // Add signature rows
        rows.push([]);
        rows.push(['Mengetahui,', '', '', 'Maluku Tengah, ' + new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })]);
        rows.push(['Kepala Sekolah', '', '', 'Guru Mata Pelajaran']);
        rows.push([]);
        rows.push([]);
        rows.push(['( .................................................. )', '', '', `( ${titleHeader.teacherName || '..................................................'} )`]);

        ws = XLSX.utils.aoa_to_sheet(rows);
      } else {
        ws = XLSX.utils.json_to_sheet(data);
      }

      // Auto-fit column width approximation
      const colWidths = (data.length > 0 ? Object.keys(data[0]) : []).map((k) => ({
        wch: Math.max(k.length + 5, 16),
      }));
      if (colWidths.length > 0) {
        ws['!cols'] = colWidths;
      }

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, sheetName.substring(0, 31));
      XLSX.writeFile(wb, `${fileName}.xlsx`);
    } catch (err) {
      console.error('Failed to export to Excel:', err);
      alert('Gagal mengekspor data ke Excel: ' + (err as Error).message);
    }
  }

  /**
   * Helper to clean LaTeX and Markdown formatting into clean plain text for Excel cells
   */
  static cleanForExcel(text: string): string {
    if (!text) return '';
    return text
      // Clean KaTeX / LaTeX formulas into readable math strings
      .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '($1 / $2)')
      .replace(/\\sqrt\{([^}]+)\}/g, '√($1)')
      .replace(/\\cdot/g, ' · ')
      .replace(/\\times/g, ' × ')
      .replace(/\\pm/g, ' ± ')
      .replace(/\\leq/g, ' ≤ ')
      .replace(/\\geq/g, ' ≥ ')
      .replace(/\\neq/g, ' ≠ ')
      .replace(/\\approx/g, ' ≈ ')
      .replace(/\\infty/g, ' ∞ ')
      .replace(/\\rightarrow/g, ' → ')
      .replace(/\\rightleftharpoons/g, ' ⇌ ')
      .replace(/\\alpha/g, 'α')
      .replace(/\\beta/g, 'β')
      .replace(/\\gamma/g, 'γ')
      .replace(/\\delta/g, 'δ')
      .replace(/\\theta/g, 'θ')
      .replace(/\\lambda/g, 'λ')
      .replace(/\\mu/g, 'μ')
      .replace(/\\pi/g, 'π')
      .replace(/\\Delta/g, 'Δ')
      .replace(/\\Sigma/g, 'Σ')
      .replace(/\\int/g, '∫')
      .replace(/\\sum/g, '∑')
      .replace(/\\text\{([^}]+)\}/g, '$1')
      .replace(/\\mathbf\{([^}]+)\}/g, '$1')
      .replace(/\\mathit\{([^}]+)\}/g, '$1')
      .replace(/\\left|\\right/g, '')
      .replace(/\$\$([\s\S]*?)\$\$/g, '$1')
      .replace(/\$([^$]+)\$/g, '$1')
      // Clean Markdown tags
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/`([^`]+)`/g, '$1')
      // Format Pedagogical & Kaldik Badges cleanly
      .replace(/\[(Mindful Learning|Mindful)\]/gi, '[🧠 Mindful Learning]')
      .replace(/\[(Meaningful Learning|Meaningful)\]/gi, '[💡 Meaningful Learning]')
      .replace(/\[(Joyful Learning|Joyful)\]/gi, '[🎉 Joyful Learning]')
      .replace(/\[(Deep Learning|Pembelajaran Mendalam)\]/gi, '[✨ Deep Learning]')
      .replace(/\[(HOTS)\]/gi, '[🔥 HOTS]')
      .replace(/\[(LOTS)\]/gi, '[📖 LOTS]')
      .replace(/\[(Diferensiasi[^\]]*)\]/gi, '[🎯 $1]')
      .replace(/\[(Tujuan Pembelajaran|TP)\]/gi, '[🎯 TP]')
      .replace(/\[(Alur Tujuan Pembelajaran|ATP)\]/gi, '[📈 ATP]')
      .replace(/\[(Asesmen Formatif)\]/gi, '[📝 Asesmen Formatif]')
      .replace(/\[(Asesmen Sumatif)\]/gi, '[📊 Asesmen Sumatif]')
      .replace(/\[(KKTP)\]/gi, '[🎯 KKTP]')
      .replace(/(?:🟢\s*(\d*\s*JP|\d+)|\[KBM\s*(\d*\s*JP|\d+)\])/gi, '🟢 $1$2 KBM')
      .replace(/(?:🔴\s*LIBUR|\[LIBUR[^\]]*\])/gi, '🔴 LIBUR')
      .trim();
  }

  /**
   * Export Curriculum / Perangkat Ajar Markdown to Excel with structured tables
   */
  static exportCurriculumToExcel(
    markdownContent: string,
    docTitle: string,
    schoolProfileOrOptions: Partial<Omit<SchoolProfile, 'level'>> & {
      subject?: string;
      grade?: number | string;
      level?: any;
      semester?: any;
      teacherName?: string;
      docType?: string;
      [key: string]: any;
    },
    fileName: string
  ): void {
    try {
      const cleaned = ExportService.cleanDuplicateSignatures(markdownContent);
      const schoolName = schoolProfileOrOptions.schoolName || 'SMA / SMK NEGERI';
      const npsn = schoolProfileOrOptions.npsn || '-';
      const address = schoolProfileOrOptions.address || '-';
      const email = schoolProfileOrOptions.email || 'info@sekolah.sch.id';
      const academicYear = schoolProfileOrOptions.academicYear || '2025/2026';
      const semester = schoolProfileOrOptions.semester || 'Ganjil';
      const subject = schoolProfileOrOptions.subject || 'Semua Mata Pelajaran';
      const grade = schoolProfileOrOptions.grade || 10;
      const level = schoolProfileOrOptions.level || 'SMA';
      const teacherName = schoolProfileOrOptions.teacherName || 'Guru Pengampu';
      const teacherNip = schoolProfileOrOptions.teacherNip || '-';
      const headmasterName = schoolProfileOrOptions.headmasterName || 'Kepala Sekolah';
      const headmasterNip = schoolProfileOrOptions.headmasterNip || '-';
      const city = schoolProfileOrOptions.city || 'Maluku Tengah';
      const phase = String(grade) === '10' ? 'E' : Number(grade) > 10 ? 'F' : 'D';

      const rows: any[][] = [
        ['PEMERINTAH DAERAH PROVINSI / KABUPATEN - DINAS PENDIDIKAN DAN KEBUDAYAAN'],
        [schoolName.toUpperCase()],
        [`NPSN: ${npsn} | Alamat: ${address} | Email: ${email}`],
        [],
        [`DOKUMEN: ${docTitle.toUpperCase()}`],
        [`Kurikulum Deep Learning & Merdeka Belajar (Fase ${phase})`],
        [],
        ['Satuan Pendidikan:', schoolName, 'Tahun Pelajaran:', academicYear],
        ['Mata Pelajaran:', subject, 'Semester:', semester],
        ['Fase / Jenjang:', `${level} - Kelas ${grade}`, 'Guru Pengampu:', teacherName],
        [],
      ];

      const lines = cleaned.split('\n');
      let inMarkdownTable = false;
      let maxCols = 4;

      lines.forEach((line) => {
        const trimmed = line.trim();
        if (!trimmed) {
          if (inMarkdownTable) {
            inMarkdownTable = false;
            rows.push([]);
          }
          return;
        }

        // Check if markdown table row: | col1 | col2 | col3 |
        if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
          if (/^\|[\s\-:|]+\|$/.test(trimmed)) {
            // separator row
            return;
          }
          const cells = trimmed
            .slice(1, -1)
            .split('|')
            .map((c) => ExportService.cleanForExcel(c));
          
          if (cells.length > maxCols) {
            maxCols = cells.length;
          }
          rows.push(cells);
          inMarkdownTable = true;
          return;
        }

        if (inMarkdownTable) {
          inMarkdownTable = false;
          rows.push([]);
        }

        // Section Heading detection
        if (trimmed.startsWith('#')) {
          const sectionTitle = ExportService.cleanForExcel(trimmed.replace(/^#+\s*/, ''));
          rows.push([]);
          rows.push([`>>> ${sectionTitle.toUpperCase()} <<<`]);
          rows.push([]);
          return;
        }

        // Blockquotes
        if (trimmed.startsWith('>')) {
          const quoteText = ExportService.cleanForExcel(trimmed.replace(/^>\s*/, ''));
          rows.push(['📌 CATATAN:', quoteText]);
          return;
        }

        // List item
        if (/^[-*]\s+/.test(trimmed)) {
          const itemText = ExportService.cleanForExcel(trimmed.replace(/^[-*]\s+/, ''));
          rows.push(['•', itemText]);
          return;
        }

        // Numbered list
        if (/^\d+\.\s+/.test(trimmed)) {
          const match = trimmed.match(/^(\d+)\.\s+(.*)/);
          if (match) {
            rows.push([match[1] + '.', ExportService.cleanForExcel(match[2])]);
            return;
          }
        }

        // Regular line
        rows.push(['', ExportService.cleanForExcel(trimmed)]);
      });

      // Signature block matching official Lembar Pengesahan
      rows.push([]);
      rows.push([]);
      rows.push([
        'Mengetahui,',
        '',
        '',
        `${city}, ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`,
      ]);
      rows.push([`Kepala ${schoolName}`, '', '', 'Guru Mata Pelajaran']);
      rows.push([]);
      rows.push([]);
      rows.push([headmasterName, '', '', teacherName]);
      rows.push([`NIP. ${headmasterNip}`, '', '', `NIP. ${teacherNip}`]);

      const ws = XLSX.utils.aoa_to_sheet(rows);

      // Dynamically calculate column widths based on maximum contents in each column
      const colWidths: { wch: number }[] = [];
      for (let c = 0; c < Math.max(maxCols, 4); c++) {
        let maxLen = 14;
        rows.forEach((r) => {
          if (r && r[c] !== undefined && r[c] !== null) {
            const len = String(r[c]).length;
            if (len > maxLen) {
              maxLen = Math.min(len + 4, 60);
            }
          }
        });
        colWidths.push({ wch: Math.max(maxLen, c === 0 ? 8 : 16) });
      }
      ws['!cols'] = colWidths;

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Perangkat Ajar');
      XLSX.writeFile(wb, `${fileName}.xlsx`);
    } catch (err) {
      console.error('Failed to export curriculum to Excel:', err);
      alert('Gagal mengekspor perangkat ajar ke Excel: ' + (err as Error).message);
    }
  }

  /**
   * Export multi-sheet workbook to Excel (.xlsx)
   */
  static exportMultiSheetExcel(
    sheets: { sheetName: string; data: any[] }[],
    fileName: string
  ): void {
    try {
      const wb = XLSX.utils.book_new();
      sheets.forEach(({ sheetName, data }) => {
        const ws = XLSX.utils.json_to_sheet(data);
        XLSX.utils.book_append_sheet(wb, ws, sheetName.substring(0, 31));
      });
      XLSX.writeFile(wb, `${fileName}.xlsx`);
    } catch (err) {
      console.error('Failed to export multi-sheet Excel:', err);
      alert('Gagal mengekspor multi-sheet Excel: ' + (err as Error).message);
    }
  }

  /**
   * Export text/HTML document to Microsoft Word (.doc) with official Indonesian administration styling & rich colored accents
   */
  static exportToWord(
    title: string,
    bodyHtmlOrMarkdown: string,
    schoolProfileOrOptions: Partial<Omit<SchoolProfile, 'level'>> & {
      subject?: string;
      grade?: number | string;
      level?: any;
      semester?: any;
      teacherName?: string;
      docType?: string;
      [key: string]: any;
    },
    fileName: string
  ): void {
    const cleaned = ExportService.cleanDuplicateSignatures(bodyHtmlOrMarkdown);
    // If input is markdown, convert to clean, semantic, and colored HTML
    const contentHtml = cleaned.includes('<') && cleaned.includes('>')
      ? cleaned
      : ExportService.markdownToHtml(cleaned);

    const schoolName = schoolProfileOrOptions.schoolName || 'SMA / SMK NEGERI';
    const npsn = schoolProfileOrOptions.npsn || '-';
    const address = schoolProfileOrOptions.address || '-';
    const email = schoolProfileOrOptions.email || 'info@sekolah.sch.id';
    const academicYear = schoolProfileOrOptions.academicYear || '2025/2026';
    const semester = schoolProfileOrOptions.semester || 'Ganjil';
    const subject = schoolProfileOrOptions.subject || 'Fisika';
    const grade = schoolProfileOrOptions.grade || 10;
    const level = schoolProfileOrOptions.level || 'SMA';
    const teacherName = schoolProfileOrOptions.teacherName || 'Guru Pengampu';
    const teacherNip = schoolProfileOrOptions.teacherNip || '-';
    const headmasterName = schoolProfileOrOptions.headmasterName || 'Kepala Sekolah';
    const headmasterNip = schoolProfileOrOptions.headmasterNip || '-';
    const city = schoolProfileOrOptions.city || 'Maluku Tengah';
    const phase = String(grade) === '10' ? 'E' : Number(grade) > 10 ? 'F' : 'D';

    const docHtml = `
      <!DOCTYPE html>
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <title>${title}</title>
        <!-- KaTeX CSS for mathematical formatting -->
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css">
        <style>
          @page Section1 {
            size: 595.3pt 841.9pt;
            margin: 42.5pt 42.5pt 42.5pt 42.5pt;
            mso-header-margin: 35.4pt;
            mso-footer-margin: 35.4pt;
            mso-paper-source: 0;
          }
          div.Section1 {
            page: Section1;
          }
          body {
            font-family: 'Calibri', 'Times New Roman', Arial, sans-serif;
            font-size: 11pt;
            line-height: 1.5;
            color: #0f172a;
            margin: 0;
            padding: 0;
          }
          .kop-surat {
            text-align: center;
            border-bottom: 4px double #0f172a;
            padding-bottom: 8px;
            margin-bottom: 16px;
          }
          .kop-surat h3 {
            margin: 0;
            font-size: 10.5pt;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: #334155;
          }
          .kop-surat h1 {
            margin: 3px 0;
            font-size: 16pt;
            font-weight: 800;
            text-transform: uppercase;
            color: #0f172a;
            letter-spacing: 0.5px;
          }
          .kop-surat p {
            margin: 2px 0;
            font-size: 9pt;
            color: #475569;
          }
          .doc-title-box {
            background-color: #f8fafc;
            border: 1.5px solid #cbd5e1;
            border-radius: 6px;
            padding: 10px 14px;
            margin: 14px 0 12px 0;
            text-align: center;
          }
          .doc-title {
            color: #0f172a;
            font-size: 13pt;
            font-weight: 800;
            margin: 0;
            text-transform: uppercase;
            text-decoration: underline;
            letter-spacing: 0.5px;
          }
          .fase-badge {
            display: inline-block;
            margin-top: 4px;
            padding: 2px 10px;
            background-color: #e0e7ff;
            color: #3730a3;
            border: 1px solid #c7d2fe;
            border-radius: 12px;
            font-size: 8.5pt;
            font-weight: bold;
          }
          .meta-box {
            width: 100%;
            margin-bottom: 16px;
            font-size: 9.5pt;
            border-collapse: collapse;
            background-color: #f8fafc;
            border: 1px solid #cbd5e1;
            border-radius: 6px;
          }
          .meta-box td {
            padding: 5px 8px;
            border: none;
            color: #1e293b;
            vertical-align: middle;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 14px 0;
            font-size: 9.5pt;
            border: 1px solid #334155;
          }
          th, td {
            border: 1px solid #cbd5e1;
            padding: 6px 8px;
            text-align: left;
            vertical-align: top;
          }
          th {
            background-color: #1e3a8a;
            color: #ffffff;
            font-weight: bold;
            text-align: center;
            border: 1px solid #1e3a8a;
          }
          .katex {
            font-size: 1.05em;
          }
          .ttd-container {
            margin-top: 35px;
            width: 100%;
            page-break-inside: avoid;
          }
          .ttd-table {
            width: 100%;
            border: none !important;
            border-collapse: collapse;
          }
          .ttd-table td {
            border: none !important;
            text-align: center;
            width: 50%;
            vertical-align: top;
            font-size: 10.5pt;
            color: #0f172a;
          }
          .ttd-space {
            height: 60px;
          }
          h1, h2, h3, h4 {
            page-break-after: avoid;
          }
        </style>
      </head>
      <body>
        <div class="Section1">
          <div class="kop-surat">
            <h3>PEMERINTAH DAERAH PROVINSI / KABUPATEN</h3>
            <h3>DINAS PENDIDIKAN DAN KEBUDAYAAN</h3>
            <h1>${schoolName}</h1>
            <p>NPSN: ${npsn} | Alamat: ${address} | Email: ${email}</p>
          </div>

          <div class="doc-title-box">
            <div class="doc-title">${title}</div>
            <div class="fase-badge">Kurikulum Deep Learning & Merdeka Belajar (Fase ${phase})</div>
          </div>

          <table class="meta-box">
            <tr>
              <td style="width:20%;"><strong>Satuan Pendidikan:</strong></td>
              <td style="width:30%; font-weight:bold; color:#0f172a;">${schoolName}</td>
              <td style="width:20%;"><strong>Tahun Pelajaran:</strong></td>
              <td style="width:30%; font-weight:bold; color:#0f172a;">${academicYear}</td>
            </tr>
            <tr>
              <td><strong>Mata Pelajaran:</strong></td>
              <td style="font-weight:bold; color:#1e3a8a;">${subject}</td>
              <td><strong>Semester:</strong></td>
              <td style="font-weight:bold;">${semester}</td>
            </tr>
            <tr>
              <td><strong>Fase / Jenjang:</strong></td>
              <td style="font-weight:bold;">${level} - Kelas ${grade}</td>
              <td><strong>Guru Pengampu:</strong></td>
              <td style="font-weight:bold; color:#0f172a;">${teacherName}</td>
            </tr>
          </table>

          <div class="content">
            ${contentHtml}
          </div>

          <div class="ttd-container">
            <table class="ttd-table">
              <tr>
                <td>
                  Mengetahui,<br>
                  Kepala ${schoolName}
                  <div class="ttd-space"></div>
                  <strong><u>${headmasterName}</u></strong><br>
                  NIP. ${headmasterNip}
                </td>
                <td>
                  ${city}, ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}<br>
                  Guru Mata Pelajaran
                  <div class="ttd-space"></div>
                  <strong><u>${teacherName}</u></strong><br>
                  NIP. ${teacherNip}
                </td>
              </tr>
            </table>
          </div>
        </div>
      </body>
      </html>
    `;

    const blob = new Blob(['\ufeff', docHtml], {
      type: 'application/msword;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${fileName}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Print / PDF preview with official Indonesian School Kop Surat formatting & full color preservation
   */
  static printPdfPreview(
    title: string,
    bodyHtmlOrMarkdown: string,
    schoolProfileOrOptions: Partial<Omit<SchoolProfile, 'level'>> & {
      subject?: string;
      grade?: number | string;
      level?: any;
      semester?: any;
      teacherName?: string;
      docType?: string;
      [key: string]: any;
    }
  ): void {
    const printWindow = window.open('', '_blank', 'width=1000,height=880');

    const cleaned = ExportService.cleanDuplicateSignatures(bodyHtmlOrMarkdown);
    const contentHtml = cleaned.includes('<') && cleaned.includes('>')
      ? cleaned
      : ExportService.markdownToHtml(cleaned);

    const schoolName = schoolProfileOrOptions.schoolName || 'SMA / SMK NEGERI';
    const npsn = schoolProfileOrOptions.npsn || '-';
    const address = schoolProfileOrOptions.address || '-';
    const email = schoolProfileOrOptions.email || 'info@sekolah.sch.id';
    const academicYear = schoolProfileOrOptions.academicYear || '2025/2026';
    const semester = schoolProfileOrOptions.semester || 'Ganjil';
    const subject = schoolProfileOrOptions.subject || 'Fisika';
    const grade = schoolProfileOrOptions.grade || 10;
    const level = schoolProfileOrOptions.level || 'SMA';
    const teacherName = schoolProfileOrOptions.teacherName || 'Guru Pengampu';
    const teacherNip = schoolProfileOrOptions.teacherNip || '-';
    const headmasterName = schoolProfileOrOptions.headmasterName || 'Kepala Sekolah';
    const headmasterNip = schoolProfileOrOptions.headmasterNip || '-';
    const city = schoolProfileOrOptions.city || 'Maluku Tengah';
    const phase = String(grade) === '10' ? 'E' : Number(grade) > 10 ? 'F' : 'D';

    const fullHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${title} - ${schoolName}</title>
        <!-- KaTeX CSS for formula rendering -->
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css">
        <style>
          @page {
            size: A4 portrait;
            margin: 12mm 15mm 15mm 15mm;
          }
          * {
            box-sizing: border-box;
          }
          body {
            font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            font-size: 9.5pt;
            line-height: 1.6;
            color: #0f172a;
            margin: 0;
            padding: 24px;
            background: #ffffff;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          .kop {
            text-align: center;
            border-bottom: 4px double #020617;
            padding-bottom: 10px;
            margin-bottom: 16px;
          }
          .kop h3 {
            margin: 0;
            font-size: 10.5pt;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.8px;
            color: #1e293b;
          }
          .kop h1 {
            margin: 4px 0 2px 0;
            font-size: 16pt;
            font-weight: 900;
            text-transform: uppercase;
            color: #020617;
            letter-spacing: 0.5px;
          }
          .kop p {
            margin: 2px 0;
            font-size: 8.5pt;
            color: #475569;
          }
          .title-box {
            text-align: center;
            margin: 16px 0 18px 0;
          }
          .title {
            font-size: 13pt;
            font-weight: 900;
            color: #020617;
            margin: 0;
            text-transform: uppercase;
            text-decoration: underline;
            letter-spacing: 0.5px;
          }
          .fase-badge {
            display: inline-block;
            margin-top: 6px;
            padding: 3px 12px;
            background-color: #eef2ff;
            color: #312e81;
            border: 1px solid #c7d2fe;
            border-radius: 9999px;
            font-size: 8pt;
            font-weight: 700;
            letter-spacing: 0.3px;
          }
          .meta-table {
            width: 100%;
            border-collapse: separate;
            border-spacing: 0;
            font-size: 8.5pt;
            margin-bottom: 20px;
            background-color: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            overflow: hidden;
          }
          .meta-table td {
            padding: 7px 12px;
            border: none;
            color: #1e293b;
            vertical-align: middle;
            border-bottom: 1px solid #f1f5f9;
          }
          .meta-table tr:last-child td {
            border-bottom: none;
          }
          .content {
            font-size: 9.5pt;
            line-height: 1.65;
            color: #0f172a;
          }
          .content p {
            margin: 8px 0;
            text-align: justify;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 14px 0;
            font-size: 8.5pt;
            page-break-inside: auto;
            border: 1px solid #334155;
          }
          tr {
            page-break-inside: avoid;
            page-break-after: auto;
          }
          th, td {
            border: 1px solid #cbd5e1;
            padding: 6px 8px;
            vertical-align: top;
          }
          th {
            background-color: #1e3a8a;
            color: #ffffff;
            font-weight: bold;
            text-align: center;
            border: 1px solid #1e3a8a;
          }
          .katex {
            font-size: 1.05em;
          }
          .katex-block {
            margin: 12px 0;
            padding: 8px;
            background: #f8fafc;
            border-radius: 6px;
            border: 1px solid #cbd5e1;
          }
          .page-break {
            page-break-before: always;
            break-before: page;
          }
          .ttd-box {
            margin-top: 36px;
            padding-top: 16px;
            border-top: 1px solid #e2e8f0;
            display: flex;
            justify-content: space-between;
            page-break-inside: avoid;
            break-inside: avoid;
          }
          .ttd-col {
            text-align: center;
            width: 45%;
            font-size: 9pt;
            color: #0f172a;
            line-height: 1.4;
          }
          .ttd-col p {
            margin: 2px 0;
          }
          .ttd-space {
            height: 60px;
          }
          @media print {
            .no-print { display: none !important; }
            body { padding: 0; }
            * {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              color-adjust: exact !important;
            }
          }
        </style>
      </head>
      <body>
        <div class="no-print" style="background:#0f172a; color:white; padding:12px 20px; margin-bottom:20px; border-radius:8px; display:flex; justify-content:space-between; align-items:center; box-shadow:0 4px 6px -1px rgba(0,0,0,0.1);">
          <div>
            <div style="font-weight:bold; font-size:13px; color:#60a5fa;">Pratinjau Cetak / PDF Resmi Berwarna (A4)</div>
            <div style="font-size:11px; color:#94a3b8;">Format Sesuai Tampilan Pratinjau Dokumen & Kurikulum Deep Learning</div>
          </div>
          <div style="display:flex; gap:10px;">
            <button onclick="window.print()" style="background:#2563eb; color:white; border:none; padding:8px 18px; border-radius:6px; font-weight:bold; font-size:12px; cursor:pointer; display:flex; align-items:center; gap:6px; box-shadow:0 2px 4px rgba(37,99,235,0.3);">
              <span>🖨️ Cetak / Simpan PDF</span>
            </button>
            <button onclick="window.close()" style="background:#475569; color:white; border:none; padding:8px 14px; border-radius:6px; font-size:12px; cursor:pointer;">
              Tutup
            </button>
          </div>
        </div>

        <div class="kop">
          <h3>PEMERINTAH DAERAH PROVINSI / KABUPATEN</h3>
          <h3>DINAS PENDIDIKAN DAN KEBUDAYAAN</h3>
          <h1>${schoolName}</h1>
          <p>NPSN: ${npsn} | Alamat: ${address} | Email: ${email}</p>
        </div>

        <div class="title-box">
          <div class="title">${title}</div>
          <div class="fase-badge">Kurikulum Deep Learning & Merdeka Belajar (Fase ${phase})</div>
        </div>

        <table class="meta-table">
          <tr>
            <td style="width:20%;"><strong>Satuan Pendidikan:</strong></td>
            <td style="width:30%; font-weight:bold; color:#0f172a;">${schoolName}</td>
            <td style="width:20%;"><strong>Tahun Pelajaran:</strong></td>
            <td style="width:30%; font-weight:bold; color:#0f172a;">${academicYear}</td>
          </tr>
          <tr>
            <td><strong>Mata Pelajaran:</strong></td>
            <td style="font-weight:bold; color:#1e3a8a;">${subject}</td>
            <td><strong>Semester:</strong></td>
            <td style="font-weight:bold;">${semester}</td>
          </tr>
          <tr>
            <td><strong>Fase / Jenjang:</strong></td>
            <td style="font-weight:bold;">${level} - Kelas ${grade}</td>
            <td><strong>Guru Pengampu:</strong></td>
            <td style="font-weight:bold; color:#0f172a;">${teacherName}</td>
          </tr>
        </table>

        <div class="content">
          ${contentHtml}
        </div>

        <div class="ttd-box">
          <div class="ttd-col">
            Mengetahui,<br>
            Kepala ${schoolName}
            <div class="ttd-space"></div>
            <strong><u>${headmasterName}</u></strong><br>
            NIP. ${headmasterNip}
          </div>
          <div class="ttd-col">
            ${city}, ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}<br>
            Guru Mata Pelajaran
            <div class="ttd-space"></div>
            <strong><u>${teacherName}</u></strong><br>
            NIP. ${teacherNip}
          </div>
        </div>
      </body>
      </html>
    `;

    if (printWindow && printWindow.document) {
      try {
        printWindow.document.open();
        printWindow.document.write(fullHtml);
        printWindow.document.close();
        return;
      } catch (e) {
        console.warn('Direct popup write failed, falling back to iframe:', e);
      }
    }

    // Fallback to invisible iframe printing if popup is blocked
    try {
      let printIframe = document.getElementById('print-service-iframe') as HTMLIFrameElement;
      if (!printIframe) {
        printIframe = document.createElement('iframe');
        printIframe.id = 'print-service-iframe';
        printIframe.style.position = 'fixed';
        printIframe.style.right = '0';
        printIframe.style.bottom = '0';
        printIframe.style.width = '0';
        printIframe.style.height = '0';
        printIframe.style.border = '0';
        document.body.appendChild(printIframe);
      }
      const iframeDoc = printIframe.contentDocument || printIframe.contentWindow?.document;
      if (iframeDoc) {
        iframeDoc.open();
        iframeDoc.write(fullHtml);
        iframeDoc.close();
        setTimeout(() => {
          try {
            printIframe.contentWindow?.focus();
            printIframe.contentWindow?.print();
          } catch (e) {
            console.warn('Iframe print failed:', e);
          }
        }, 500);
      }
    } catch (err) {
      console.error('Print service fallback error:', err);
    }
  }
}
