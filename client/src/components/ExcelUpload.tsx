import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, FileSpreadsheet, X, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ExcelUploadProps {
  onFileUpload: (file: File) => void;
}

export default function ExcelUpload({ onFileUpload }: ExcelUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setUploadSuccess(false);
    }
  };

  const handleUpload = () => {
    if (selectedFile) {
      console.log('Upload triggered:', selectedFile.name);
      onFileUpload(selectedFile);
      setUploadSuccess(true);
    }
  };

  const handleClear = () => {
    setSelectedFile(null);
    setUploadSuccess(false);
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
              {uploadSuccess && (
                <div className="flex items-center justify-center gap-2 text-chart-2">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="text-sm font-medium">Upload successful!</span>
                </div>
              )}
              <div className="flex gap-2 justify-center">
                <Button
                  onClick={handleUpload}
                  disabled={uploadSuccess}
                  data-testid="button-upload"
                >
                  {uploadSuccess ? 'Uploaded' : 'Upload File'}
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