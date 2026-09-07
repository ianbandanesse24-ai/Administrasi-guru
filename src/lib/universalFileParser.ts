import * as XLSX from 'xlsx';

export type FileCategory = 'pdf' | 'word' | 'excel' | 'powerpoint' | 'image' | 'text' | 'unknown';

export interface ParsedDocumentResult {
  fileName: string;
  fileSize: number;
  category: FileCategory;
  mimeType: string;
  extractedText: string;
  tableMarkdown?: string;
  sheetNames?: string[];
  base64?: string;
  previewUrl?: string;
  summaryText?: string;
  characterCount: number;
  wordCount: number;
}

export class UniversalFileParser {
  /**
   * Detects the category of a file based on its extension and MIME type.
   */
  static detectCategory(fileName: string, mimeType?: string): FileCategory {
    const ext = (fileName.split('.').pop() || '').toLowerCase();
    const mime = (mimeType || '').toLowerCase();

    if (ext === 'pdf' || mime.includes('pdf')) {
      return 'pdf';
    }
    if (['docx', 'doc', 'dotx'].includes(ext) || mime.includes('word') || mime.includes('officedocument.wordprocessingml')) {
      return 'word';
    }
    if (['xlsx', 'xls', 'csv', 'tsv', 'ods'].includes(ext) || mime.includes('spreadsheet') || mime.includes('excel') || mime.includes('csv')) {
      return 'excel';
    }
    if (['pptx', 'ppt'].includes(ext) || mime.includes('presentation') || mime.includes('powerpoint')) {
      return 'powerpoint';
    }
    if (['jpg', 'jpeg', 'png', 'webp', 'bmp', 'svg', 'gif'].includes(ext) || mime.startsWith('image/')) {
      return 'image';
    }
    if (['txt', 'md', 'markdown', 'rtf', 'html', 'htm', 'xml', 'json'].includes(ext) || mime.startsWith('text/')) {
      return 'text';
    }
    return 'unknown';
  }

  /**
   * Universal method to read and extract text/tables/data from ANY file format.
   * Runs local client-side extraction where possible (XLSX, Text, Images)
   * and falls back or augments with the server endpoint for DOCX/PDF/complex formats.
   */
  static async parseFile(file: File): Promise<ParsedDocumentResult> {
    const category = this.detectCategory(file.name, file.type);
    const fileName = file.name;
    const fileSize = file.size;
    const mimeType = file.type || this.getDefaultMime(category, fileName);

    // 1. Read Base64 representation (needed for PDF, Word, Images, and Server API)
    const base64Data = await this.readFileAsDataURL(file);

    let extractedText = '';
    let tableMarkdown = '';
    let sheetNames: string[] = [];

    // 2. Client-side extraction based on category
    if (category === 'excel') {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });
        sheetNames = workbook.SheetNames;

        const markdownSheets: string[] = [];
        workbook.SheetNames.forEach((sheetName) => {
          const worksheet = workbook.Sheets[sheetName];
          const rawData: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
          if (rawData && rawData.length > 0) {
            let sheetMd = `### Lembar Kerja: ${sheetName}\n\n`;
            // Build markdown table
            const headers = rawData[0];
            if (headers && headers.length > 0) {
              sheetMd += '| ' + headers.map((h: any) => String(h || '').trim() || '-').join(' | ') + ' |\n';
              sheetMd += '| ' + headers.map(() => ':---').join(' | ') + ' |\n';
              for (let i = 1; i < Math.min(rawData.length, 100); i++) {
                const row = rawData[i];
                sheetMd += '| ' + headers.map((_: any, colIdx: number) => String(row[colIdx] || '').replace(/\|/g, '\\|').trim()).join(' | ') + ' |\n';
              }
            }
            markdownSheets.push(sheetMd);
          }
        });

        tableMarkdown = markdownSheets.join('\n\n');
        extractedText = tableMarkdown;
      } catch (excelErr) {
        console.warn('Local Excel extraction warning:', excelErr);
      }
    } else if (category === 'text') {
      try {
        extractedText = await this.readFileAsText(file);
      } catch (txtErr) {
        console.warn('Local Text extraction warning:', txtErr);
      }
    } else if (category === 'image') {
      extractedText = `[Gambar Format Dokumen / Lampiran Visual: ${fileName} (${(fileSize / 1024).toFixed(1)} KB)]`;
    }

    // 3. For Word (.docx) or if extractedText is still empty, invoke server-side parser
    if (category === 'word' || category === 'powerpoint' || (!extractedText && (category === 'pdf' || category === 'unknown'))) {
      try {
        const res = await fetch('/api/ai/parse-uploaded-file', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileName,
            fileType: mimeType,
            fileBase64: base64Data,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          if (data.extractedText) {
            extractedText = data.extractedText;
          }
          if (data.tableMarkdown) {
            tableMarkdown = data.tableMarkdown;
          }
          if (data.sheetNames && data.sheetNames.length > 0) {
            sheetNames = data.sheetNames;
          }
        }
      } catch (serverErr) {
        console.warn('Server file parsing fallback warning:', serverErr);
      }
    }

    const words = extractedText.trim() ? extractedText.trim().split(/\s+/).length : 0;
    const chars = extractedText.length;

    let summaryText = '';
    if (category === 'excel') {
      summaryText = `Tabel Excel (${sheetNames.length} sheet terdeteksi: ${sheetNames.join(', ')}) dengan struktur matriks data`;
    } else if (category === 'word') {
      summaryText = `Dokumen Word (${words} kata terdeteksi) siap diintegrasikan dengan format modul ajar`;
    } else if (category === 'pdf') {
      summaryText = `Dokumen PDF (${(fileSize / 1024).toFixed(1)} KB) tersinkronisasi untuk acuan analisis`;
    } else if (category === 'image') {
      summaryText = `Lampiran Visual (${(fileSize / 1024).toFixed(1)} KB) untuk analisis tata letak dan struktur`;
    } else {
      summaryText = `Berkas teks (${words} kata) berhasil diekstraksi`;
    }

    return {
      fileName,
      fileSize,
      category,
      mimeType,
      extractedText,
      tableMarkdown,
      sheetNames,
      base64: base64Data,
      previewUrl: category === 'image' ? base64Data : undefined,
      summaryText,
      characterCount: chars,
      wordCount: words,
    };
  }

  private static readFileAsDataURL(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve((reader.result as string) || '');
      reader.onerror = (e) => reject(e);
      reader.readAsDataURL(file);
    });
  }

  private static readFileAsText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve((reader.result as string) || '');
      reader.onerror = (e) => reject(e);
      reader.readAsText(file);
    });
  }

  private static getDefaultMime(category: FileCategory, fileName: string): string {
    const ext = (fileName.split('.').pop() || '').toLowerCase();
    switch (category) {
      case 'pdf':
        return 'application/pdf';
      case 'word':
        return ext === 'doc' ? 'application/msword' : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      case 'excel':
        return ext === 'csv' ? 'text/csv' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      case 'powerpoint':
        return 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
      case 'image':
        return `image/${ext === 'jpg' ? 'jpeg' : ext}`;
      case 'text':
        return ext === 'html' ? 'text/html' : ext === 'json' ? 'application/json' : 'text/plain';
      default:
        return 'application/octet-stream';
    }
  }
}
