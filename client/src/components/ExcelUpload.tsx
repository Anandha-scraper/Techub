import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, FileSpreadsheet, X, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import * as XLSX from "xlsx";

interface ExcelUploadProps {
  onUploaded?: () => void;
}

type ParsedStudent = {
  name: string;
  registerNumber: string;
  section?: string;
  batch?: string;
  username: string;
  password: string;
};

export default function ExcelUpload({ onUploaded }: ExcelUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewRows, setPreviewRows] = useState<ParsedStudent[] | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const downloadTemplate = () => {
    const headers = ['Student-name', 'Register-Number', 'Section', 'Batch'];
    const example = ['Ram S', '73152313007', 'A', '2023-2027'];
    const csv = `${headers.join(',')}\n${example.join(',')}`;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'students_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const toBatchDigits = (batchStr: string): string => {
    const match = String(batchStr || '').match(/(\d{4})\s*[-–]\s*(\d{4})/);
    if (!match) return "";
    const y1 = match[1].slice(-2);
    const y2 = match[2].slice(-2);
    return `${y1}${y2}`;
  };

  const generatePassword = (name: string, batch?: string): string => {
    const nameUpperNoSpaces = String(name || '').toUpperCase().replace(/\s+/g, '');
    const digits = toBatchDigits(String(batch || ''));
    return `${nameUpperNoSpaces}${digits}@#`;
  };

  const parseWorkbook = (file: File) => {
    try {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const data = new Uint8Array(reader.result as ArrayBuffer);
          const wb = XLSX.read(data, { type: 'array' });
          const sheet = wb.Sheets[wb.SheetNames[0]];
          const rows: any[] = XLSX.utils.sheet_to_json(sheet, { defval: "" });
          const parsed: ParsedStudent[] = rows.map((row) => {
            const name = String(row['Student-name'] || row['Student Name'] || row['STUDENT-NAME'] || '').trim();
            const registerNumber = String(row['Register-Number'] || row['Register Number'] || row['REGISTER-NUMBER'] || '').trim();
            const section = String(row['Section'] || row['SECTION'] || '').trim();
            const batch = String(row['Batch'] || row['BATCH'] || '').trim();
            const username = registerNumber.toUpperCase();
            const password = generatePassword(name, batch);
            return { name, registerNumber, section: section || undefined, batch: batch || undefined, username, password };
          }).filter(r => r.name && r.registerNumber);
          setPreviewRows(parsed);
          setError(null);
        } catch (e: any) {
          console.error(e);
          setError('Failed to parse file');
        }
      };
      reader.readAsArrayBuffer(file);
    } catch (e: any) {
      console.error(e);
      setError('Failed to read file');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && (file.name.endsWith('.xlsx') || file.name.endsWith('.csv'))) {
      setSelectedFile(file);
      setUploadSuccess(false);
      parseWorkbook(file);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setUploadSuccess(false);
      parseWorkbook(file);
    }
  };

  const handleUpload = async () => {
    if (!previewRows || previewRows.length === 0) return;
    try {
      const res = await fetch('/api/upload/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'x-admin-id': localStorage.getItem('userId') || '' },
        body: JSON.stringify({ students: previewRows.map(r => ({
          name: r.name,
          registerNumber: r.registerNumber,
          section: r.section,
          batch: r.batch,
        })) })
      });
      const contentType = res.headers.get('content-type') || '';
      const bodyText = await res.text();
      if (!res.ok) {
        const maybeJson = contentType.includes('application/json');
        const details = maybeJson ? (() => { try { return JSON.parse(bodyText); } catch { return undefined; } })() : undefined;
        const msg = (details && (details.message || details.error)) || bodyText || 'Upload failed';
        throw new Error(typeof msg === 'string' ? msg : 'Upload failed');
      }
      if (contentType.includes('application/json')) {
        try {
          const summary = JSON.parse(bodyText);
          console.log('Upload summary:', summary);
        } catch {
          // ignore parse errors on success path
        }
      }
      setUploadSuccess(true);
      if (onUploaded) onUploaded();
    } catch (e) {
      console.error(e);
      setError(e instanceof Error ? e.message : 'Upload failed');
    }
  };

  const handleClear = () => {
    setSelectedFile(null);
    setUploadSuccess(false);
    setPreviewRows(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Student Data</CardTitle>
        <CardDescription>
          Import students from Excel file (.xlsx or .csv)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-md border p-3 bg-muted/40 text-xs leading-5">
          <div className="font-medium mb-1">File format</div>
          <ul className="list-disc pl-5 space-y-1">
            <li>Required columns: <span className="font-mono">Student-name</span>, <span className="font-mono">Register-Number</span></li>
            <li>Optional columns: <span className="font-mono">Section</span>, <span className="font-mono">Batch</span></li>
            <li>Batch format: <span className="font-mono">Eg: 2023-2027</span> (we extract <span className="font-mono">2327</span> for password)</li>
            <li>File types: <span className="font-mono">.xlsx</span> or <span className="font-mono">.csv</span></li>
          </ul>
          <div className="mt-2">
            <Button type="button" variant="outline" size="sm" onClick={downloadTemplate} data-testid="button-download-template">Download CSV template</Button>
          </div>
        </div>
        {error && (
          <div className="text-sm text-red-600" role="alert">{error}</div>
        )}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            border-2 border-dashed rounded-md p-8 text-center transition-colors
            ${isDragging ? 'border-primary bg-primary/5' : 'border-border'}
            ${selectedFile ? 'bg-muted/50' : ''}
          `}
          data-testid="dropzone-excel"
        >
          {!selectedFile ? (
            <div className="space-y-4">
              <div className="flex justify-center">
                <Upload className="w-12 h-12 text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">
                  Drag and drop your file here
                </p>
                <p className="text-xs text-muted-foreground">
                  or click to browse
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.csv"
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
                data-testid="input-file"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                data-testid="button-browse"
              >
                Browse Files
              </Button>
              <div className="flex gap-2 justify-center">
                <Badge variant="outline">.xlsx</Badge>
                <Badge variant="outline">.csv</Badge>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-3">
                <FileSpreadsheet className="w-8 h-8 text-primary" />
                <div className="text-left">
                  <p className="text-sm font-medium">{selectedFile.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(selectedFile.size / 1024).toFixed(2)} KB
                  </p>
                </div>
              </div>
              {previewRows && previewRows.length > 0 && (
                <div className="overflow-auto border rounded-md text-left">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="px-3 py-2">Register-Number</th>
                        <th className="px-3 py-2">Student-name</th>
                        <th className="px-3 py-2">Section</th>
                        <th className="px-3 py-2">Batch</th>
                        <th className="px-3 py-2">Username</th>
                        <th className="px-3 py-2">Password</th>
                      </tr>
                    </thead>
                    <tbody>
                      {previewRows.map((r, idx) => (
                        <tr key={`${r.registerNumber}-${idx}`}>
                          <td className="px-3 py-2 font-mono">{r.registerNumber}</td>
                          <td className="px-3 py-2">{r.name}</td>
                          <td className="px-3 py-2">{r.section || '-'}</td>
                          <td className="px-3 py-2">{r.batch || '-'}</td>
                          <td className="px-3 py-2 font-mono">{r.username}</td>
                          <td className="px-3 py-2 font-mono">{r.password}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {uploadSuccess && (
                <div className="flex items-center justify-center gap-2 text-chart-2">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="text-sm font-medium">Upload successful!</span>
                </div>
              )}
              <div className="flex gap-2 justify-center">
                <Button onClick={handleUpload} disabled={uploadSuccess || !previewRows || previewRows.length === 0} data-testid="button-upload">
                  {uploadSuccess ? 'Uploaded' : 'Confirm Upload'}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleClear}
                  data-testid="button-clear"
                >
                  <X className="w-4 h-4 mr-2" />
                  Clear
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}