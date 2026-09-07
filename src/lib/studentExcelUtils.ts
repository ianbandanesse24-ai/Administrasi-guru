import * as XLSX from 'xlsx';
import { ClassRoom, Student, SchoolLevel } from '../types';
import { StorageService } from './storage';

export interface ParsedStudentItem {
  no: number;
  name: string;
  nis: string;
  nisn: string;
  gender: 'L' | 'P';
  className: string;
  sheetName: string;
  parentPhone?: string;
  address?: string;
}

export interface ParseExcelResult {
  success: boolean;
  totalStudents: number;
  classesDetected: {
    name: string;
    studentCount: number;
    isNew: boolean;
  }[];
  students: ParsedStudentItem[];
  errors: string[];
  sheetCount: number;
}

export class StudentExcelUtils {
  /**
   * Generates and downloads an Excel template for student data.
   * Multi-sheet: If more than 1 class exists, each class gets its own dedicated sheet.
   * Columns: NO, NISN/NIS (Opsional), Nama Siswa, Kelas, L/P (Opsional)
   */
  static downloadTemplate(specificClassIdOrName?: string): void {
    try {
      const existingClasses = StorageService.getClasses();
      const schoolProfile = StorageService.getSchoolProfile();

      // Determine sheets to create
      let targetClasses: { name: string; level: SchoolLevel; grade: number }[] = [];

      if (specificClassIdOrName && specificClassIdOrName !== 'all') {
        const found = existingClasses.find(
          (c) => c.id === specificClassIdOrName || c.name.toLowerCase() === specificClassIdOrName.toLowerCase()
        );
        if (found) {
          targetClasses = [{ name: found.name, level: found.level, grade: found.grade }];
        }
      }

      if (targetClasses.length === 0) {
        if (existingClasses.length > 0) {
          targetClasses = existingClasses.map((c) => ({
            name: c.name,
            level: c.level,
            grade: c.grade,
          }));
        } else {
          // Default multi-class template with 3 sample class sheets
          targetClasses = [
            { name: 'Kelas 10-A', level: 'SMA', grade: 10 },
            { name: 'Kelas 10-B', level: 'SMA', grade: 10 },
            { name: 'Kelas 11-A', level: 'SMA', grade: 11 },
          ];
        }
      }

      const wb = XLSX.utils.book_new();

      // Sample student names for guidance
      const sampleNames = [
        { name: 'Ahmad Fauzi Dahlan', gender: 'L' as const, nisn: '0089123451', nis: '2025001' },
        { name: 'Annisa Putri Rahmawati', gender: 'P' as const, nisn: '0089123452', nis: '2025002' },
        { name: 'Budi Santoso Pratama', gender: 'L' as const, nisn: '0089123453', nis: '2025003' },
        { name: 'Dewi Lestari Maharani', gender: 'P' as const, nisn: '0089123454', nis: '2025004' },
        { name: 'Eko Prasetyo Utomo', gender: 'L' as const, nisn: '0089123455', nis: '2025005' },
      ];

      targetClasses.forEach((cls, classIdx) => {
        // Safe sheet name (Excel limits sheet names to 31 chars and no: \ / ? * [ ])
        const safeSheetName = cls.name.replace(/[/\\?*[\]]/g, '-').substring(0, 31);

        const rows: any[][] = [
          // Header info
          ['TEMPLATE IMPORT DATA SISWA - ' + cls.name.toUpperCase()],
          [`Satuan Pendidikan: ${schoolProfile.schoolName || 'SMA / SMK / SMP'} | Tahun Ajaran: ${schoolProfile.academicYear || '2025/2026'}`],
          ['PETUNJUK: Isi data siswa di bawah ini. Kolom NISN/NIS bersifat opsional. Tambahkan baris sesuai jumlah siswa.'],
          [], // Empty row
          // Column Headers (Mandatory per requirement: NO, NISN/NIS, Nama Siswa, Kelas)
          ['NO', 'NISN/NIS', 'Nama Siswa', 'Kelas', 'L/P'],
        ];

        // Add 5 sample rows per sheet
        sampleNames.forEach((sample, sIdx) => {
          const sampleNis = String(2025000 + (classIdx + 1) * 100 + sIdx + 1);
          const sampleNisn = `0089${String(100000 + (classIdx + 1) * 100 + sIdx + 1)}`;
          rows.push([
            sIdx + 1,
            `${sampleNisn} / ${sampleNis}`,
            sample.name,
            cls.name,
            sample.gender,
          ]);
        });

        const ws = XLSX.utils.aoa_to_sheet(rows);

        // Styling / Column Widths
        ws['!cols'] = [
          { wch: 6 },  // NO
          { wch: 24 }, // NISN/NIS (Optional)
          { wch: 35 }, // Nama Siswa
          { wch: 18 }, // Kelas
          { wch: 8 },  // L/P
        ];

        XLSX.utils.book_append_sheet(wb, ws, safeSheetName);
      });

      const fileName =
        targetClasses.length > 1
          ? `Template_Data_Siswa_Multi_Kelas_${new Date().toISOString().substring(0, 10)}.xlsx`
          : `Template_Data_Siswa_${targetClasses[0].name.replace(/\s+/g, '_')}.xlsx`;

      XLSX.writeFile(wb, fileName);
    } catch (err) {
      console.error('Failed to download student template:', err);
      alert('Gagal mengunduh template Excel: ' + (err as Error).message);
    }
  }

  /**
   * Parses an uploaded Excel (.xlsx, .xls, .csv) file.
   * Scans ALL sheets to extract students and assign them to respective classes.
   */
  static async parseExcelFile(file: File): Promise<ParseExcelResult> {
    return new Promise((resolve) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const buffer = e.target?.result as ArrayBuffer;
          if (!buffer) {
            resolve({
              success: false,
              totalStudents: 0,
              classesDetected: [],
              students: [],
              errors: ['File kosong atau tidak dapat dibaca.'],
              sheetCount: 0,
            });
            return;
          }

          const workbook = XLSX.read(new Uint8Array(buffer), { type: 'array' });
          const sheetNames = workbook.SheetNames;

          if (!sheetNames || sheetNames.length === 0) {
            resolve({
              success: false,
              totalStudents: 0,
              classesDetected: [],
              students: [],
              errors: ['File Excel tidak memiliki lembar kerja (worksheet).'],
              sheetCount: 0,
            });
            return;
          }

          const parsedStudents: ParsedStudentItem[] = [];
          const classCounts: Record<string, number> = {};
          const errors: string[] = [];

          sheetNames.forEach((sheetName) => {
            const worksheet = workbook.Sheets[sheetName];
            if (!worksheet) return;

            // Convert worksheet to 2D array of strings
            const rawRows: any[][] = XLSX.utils.sheet_to_json(worksheet, {
              header: 1,
              defval: '',
              blankrows: false,
            });

            if (!rawRows || rawRows.length === 0) return;

            // Locate header row by searching for keywords (nama, student, nis, no)
            let headerRowIndex = -1;
            let colIndexNo = -1;
            let colIndexNisOrNisn = -1;
            let colIndexNis = -1;
            let colIndexNisn = -1;
            let colIndexName = -1;
            let colIndexClass = -1;
            let colIndexGender = -1;
            let colIndexPhone = -1;
            let colIndexAddress = -1;

            for (let r = 0; r < Math.min(rawRows.length, 12); r++) {
              const row = rawRows[r].map((cell) => String(cell || '').trim().toLowerCase());

              const hasName = row.some((c) =>
                c.includes('nama') || c.includes('name') || c.includes('siswa') || c.includes('peserta didik')
              );
              const hasNoOrNis = row.some((c) =>
                c.includes('no') || c.includes('nis') || c.includes('nisn') || c.includes('induk') || c.includes('kelas')
              );

              if (hasName && hasNoOrNis) {
                headerRowIndex = r;
                row.forEach((cell, cIdx) => {
                  if (cell === 'no' || cell === 'no.' || cell === 'nomor' || cell === 'no urut') {
                    colIndexNo = cIdx;
                  } else if (
                    cell.includes('nisn/nis') ||
                    cell.includes('nis/nisn') ||
                    cell.includes('nisn / nis') ||
                    cell.includes('nis / nisn') ||
                    cell.includes('identitas') ||
                    cell === 'nisn/nis(optional)'
                  ) {
                    colIndexNisOrNisn = cIdx;
                  } else if (cell === 'nisn' || cell.includes('nisn')) {
                    colIndexNisn = cIdx;
                  } else if (cell === 'nis' || cell.includes('nis') || cell.includes('induk')) {
                    colIndexNis = cIdx;
                  } else if (
                    cell.includes('nama') ||
                    cell.includes('name') ||
                    cell.includes('siswa') ||
                    cell.includes('murid')
                  ) {
                    colIndexName = cIdx;
                  } else if (
                    cell === 'kelas' ||
                    cell.includes('kelas') ||
                    cell.includes('rombel') ||
                    cell === 'class'
                  ) {
                    colIndexClass = cIdx;
                  } else if (
                    cell === 'l/p' ||
                    cell === 'jk' ||
                    cell.includes('gender') ||
                    cell.includes('kelamin')
                  ) {
                    colIndexGender = cIdx;
                  } else if (cell.includes('hp') || cell.includes('telepon') || cell.includes('phone') || cell.includes('kontak')) {
                    colIndexPhone = cIdx;
                  } else if (cell.includes('alamat') || cell.includes('address')) {
                    colIndexAddress = cIdx;
                  }
                });
                break;
              }
            }

            // Fallback if no strict header found: assume first row is header
            if (headerRowIndex === -1) {
              // Try basic column guessing
              headerRowIndex = 0;
              const firstRow = (rawRows[0] || []).map((c) => String(c || '').trim().toLowerCase());
              firstRow.forEach((cell, cIdx) => {
                if (cell.includes('nama') || cell.includes('siswa')) colIndexName = cIdx;
                if (cell.includes('nis')) colIndexNisOrNisn = cIdx;
                if (cell.includes('kelas')) colIndexClass = cIdx;
              });
              if (colIndexName === -1 && rawRows[0] && rawRows[0].length >= 2) {
                // Positional fallback: Col 0: No, Col 1: NIS, Col 2: Name, Col 3: Class
                colIndexNo = 0;
                colIndexNisOrNisn = 1;
                colIndexName = 2;
                colIndexClass = 3;
              }
            }

            if (colIndexName === -1) {
              // Cannot determine student name column for this sheet
              return;
            }

            // Parse student rows starting after headerRowIndex
            for (let r = headerRowIndex + 1; r < rawRows.length; r++) {
              const row = rawRows[r];
              if (!row || row.length === 0) continue;

              const rawName = String(row[colIndexName] || '').trim();
              if (!rawName) continue;

              // Ignore rows that look like footer signatures or notes
              const lowerName = rawName.toLowerCase();
              if (
                lowerName.startsWith('mengetahui') ||
                lowerName.startsWith('kepala sekolah') ||
                lowerName.startsWith('guru mata pelajaran') ||
                lowerName.startsWith('nip.') ||
                lowerName.startsWith('catatan:') ||
                lowerName.startsWith('petunjuk:') ||
                lowerName.startsWith('total')
              ) {
                continue;
              }

              // Clean name: remove accidental leading numbers like "1. Ahmad", "2) Budi"
              const cleanName = rawName.replace(/^\d+[\.\)\-\s]+/, '').trim();
              if (!cleanName || cleanName.length < 2) continue;

              // Parse Class Name
              let className = '';
              if (colIndexClass >= 0 && row[colIndexClass]) {
                className = String(row[colIndexClass]).trim();
              }
              // If column is empty, fallback to sanitized Sheet name
              if (!className) {
                className = sheetName.replace(/^(sheet\s*\d+|halaman\s*\d+|data\s*siswa\s*)/i, '').trim();
                if (!className || /^\d+$/.test(className)) {
                  className = sheetName;
                }
              }

              // Parse NISN & NIS
              let nis = '';
              let nisn = '';

              if (colIndexNisOrNisn >= 0 && row[colIndexNisOrNisn]) {
                const combined = String(row[colIndexNisOrNisn]).trim();
                if (combined.includes('/')) {
                  const parts = combined.split('/').map((p) => p.trim());
                  // 10 digits is standard Indonesian NISN
                  if (parts[0].length === 10) {
                    nisn = parts[0];
                    nis = parts[1] || '';
                  } else {
                    nis = parts[0];
                    nisn = parts[1] || '';
                  }
                } else if (combined.includes('-')) {
                  const parts = combined.split('-').map((p) => p.trim());
                  nis = parts[0];
                  nisn = parts[1] || '';
                } else {
                  if (combined.length === 10 && /^\d+$/.test(combined)) {
                    nisn = combined;
                  } else {
                    nis = combined;
                  }
                }
              }

              if (colIndexNis >= 0 && row[colIndexNis] && !nis) {
                nis = String(row[colIndexNis]).trim();
              }
              if (colIndexNisn >= 0 && row[colIndexNisn] && !nisn) {
                nisn = String(row[colIndexNisn]).trim();
              }

              // Generate placeholder if missing
              const studentIdx = parsedStudents.length + 1;
              if (!nis) nis = String(2025000 + studentIdx);
              if (!nisn) nisn = `0089${String(100000 + studentIdx)}`;

              // Parse Gender (L/P)
              let gender: 'L' | 'P' = studentIdx % 2 === 0 ? 'P' : 'L';
              if (colIndexGender >= 0 && row[colIndexGender]) {
                const rawG = String(row[colIndexGender]).trim().toUpperCase();
                if (rawG.startsWith('L') || rawG.includes('LAKI') || rawG.includes('MALE') || rawG === '1') {
                  gender = 'L';
                } else if (rawG.startsWith('P') || rawG.includes('PEREMPUAN') || rawG.includes('WANITA') || rawG.includes('FEMALE') || rawG === '2') {
                  gender = 'P';
                }
              }

              const no =
                colIndexNo >= 0 && !isNaN(parseInt(row[colIndexNo]))
                  ? parseInt(row[colIndexNo])
                  : studentIdx;

              const parentPhone =
                colIndexPhone >= 0 && row[colIndexPhone]
                  ? String(row[colIndexPhone]).trim()
                  : '081234567890';

              const address =
                colIndexAddress >= 0 && row[colIndexAddress]
                  ? String(row[colIndexAddress]).trim()
                  : 'Alamat Siswa';

              parsedStudents.push({
                no,
                name: cleanName,
                nis,
                nisn,
                gender,
                className,
                sheetName,
                parentPhone,
                address,
              });

              classCounts[className] = (classCounts[className] || 0) + 1;
            }
          });

          if (parsedStudents.length === 0) {
            resolve({
              success: false,
              totalStudents: 0,
              classesDetected: [],
              students: [],
              errors: [
                'Tidak ditemukan baris data siswa yang valid. Pastikan file Excel memiliki kolom Nama Siswa dan tidak kosong.',
              ],
              sheetCount: sheetNames.length,
            });
            return;
          }

          const existingClasses = StorageService.getClasses();
          const existingClassNames = new Set(existingClasses.map((c) => c.name.trim().toLowerCase()));

          const classesDetected = Object.keys(classCounts).map((cName) => ({
            name: cName,
            studentCount: classCounts[cName],
            isNew: !existingClassNames.has(cName.trim().toLowerCase()),
          }));

          resolve({
            success: true,
            totalStudents: parsedStudents.length,
            classesDetected,
            students: parsedStudents,
            errors,
            sheetCount: sheetNames.length,
          });
        } catch (error) {
          console.error('Error parsing Excel:', error);
          resolve({
            success: false,
            totalStudents: 0,
            classesDetected: [],
            students: [],
            errors: ['Terjadi kesalahan saat memproses file Excel: ' + (error as Error).message],
            sheetCount: 0,
          });
        }
      };

      reader.onerror = () => {
        resolve({
          success: false,
          totalStudents: 0,
          classesDetected: [],
          students: [],
          errors: ['Gagal membaca file dari penyimpanan lokal.'],
          sheetCount: 0,
        });
      };

      reader.readAsArrayBuffer(file);
    });
  }

  /**
   * Commit parsed students to storage. Automatically provisions new classes if needed.
   */
  static commitImport(
    students: ParsedStudentItem[],
    mode: 'merge' | 'replace_by_class' | 'replace_all'
  ): {
    createdStudents: number;
    newClassesCreated: number;
  } {
    const existingClasses = StorageService.getClasses();
    const classMapByName = new Map<string, ClassRoom>();
    existingClasses.forEach((c) => classMapByName.set(c.name.trim().toLowerCase(), c));

    let newClassesCreated = 0;
    const academicYear = StorageService.getSchoolProfile().academicYear || '2025/2026';

    // 1. Ensure all detected classes exist
    students.forEach((s) => {
      const normalizedName = s.className.trim().toLowerCase();
      if (!classMapByName.has(normalizedName)) {
        // Auto-detect grade from class name like "Kelas 10-A" -> 10, "XII IPA" -> 12
        let grade = 10;
        const numMatch = s.className.match(/\b(10|11|12|7|8|9|1|2|3|4|5|6)\b/);
        if (numMatch) {
          grade = parseInt(numMatch[1]);
        } else if (/x\b/i.test(s.className)) {
          grade = 10;
        } else if (/xi\b/i.test(s.className)) {
          grade = 11;
        } else if (/xii\b/i.test(s.className)) {
          grade = 12;
        }

        const newClass = StorageService.addClass({
          name: s.className.trim(),
          level: 'SMA',
          grade,
          academicYear,
          homeroomTeacher: 'Guru Wali',
        });

        classMapByName.set(normalizedName, newClass);
        newClassesCreated++;
      }
    });

    // 2. Prepare new student objects with classId
    const newStudentObjects: Omit<Student, 'id'>[] = students.map((s) => {
      const cls = classMapByName.get(s.className.trim().toLowerCase());
      return {
        name: s.name,
        nis: s.nis,
        nisn: s.nisn,
        gender: s.gender,
        classId: cls ? cls.id : 'c1',
        className: cls ? cls.name : s.className,
        parentPhone: s.parentPhone || '081234567890',
        address: s.address || 'Alamat Siswa',
      };
    });

    // 3. Handle replacement or merge strategy
    const currentStudents = StorageService.getStudents();
    let finalStudents: Student[] = [];

    if (mode === 'replace_all') {
      finalStudents = newStudentObjects.map((s, idx) => ({
        ...s,
        id: `s-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 6)}`,
      }));
    } else if (mode === 'replace_by_class') {
      const affectedClassNames = new Set(students.map((s) => s.className.trim().toLowerCase()));
      const preservedStudents = currentStudents.filter(
        (s) => !affectedClassNames.has(s.className.trim().toLowerCase())
      );
      const addedStudents = newStudentObjects.map((s, idx) => ({
        ...s,
        id: `s-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 6)}`,
      }));
      finalStudents = [...preservedStudents, ...addedStudents];
    } else {
      // Merge: Add on top of existing
      const addedStudents = newStudentObjects.map((s, idx) => ({
        ...s,
        id: `s-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 6)}`,
      }));
      finalStudents = [...currentStudents, ...addedStudents];
    }

    StorageService.saveStudents(finalStudents);

    // Add log
    StorageService.addAccessLog({
      userId: 'active-user',
      userEmail: 'guru@belajar.id',
      userName: 'Guru Pengampu',
      userRole: 'guru',
      action: 'Import Template Excel Data Siswa',
      details: `Berhasil mengimpor ${newStudentObjects.length} siswa (Mode: ${mode}) pada ${Object.keys(classMapByName).length} rombel kelas.`,
      status: 'success',
    });

    return {
      createdStudents: newStudentObjects.length,
      newClassesCreated,
    };
  }
}
