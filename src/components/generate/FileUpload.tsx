"use client";
import { useRef, useState } from 'react';

interface FileUploadProps {
  onFileSelect?: (file: File | null) => void;
}

export function FileUpload({ onFileSelect }: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
    if (onFileSelect) onFileSelect(file);
  };

  return (
    <div className="w-full">
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.doc,.docx,.txt"
        onChange={handleFileChange}
        className="hidden"
      />
      <div
        onClick={handleClick}
        className="w-full h-72 rounded-lg border-2 border-dashed border-neutral-300 bg-neutral-50 flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-neutral-400 hover:bg-neutral-100 transition"
      >
        {selectedFile ? (
          <>
            <div className="w-12 h-12 rounded-full bg-black/5 flex items-center justify-center">
              <svg className="w-6 h-6 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-neutral-900">{selectedFile.name}</p>
              <p className="text-xs text-neutral-500 mt-1">{(selectedFile.size / 1024).toFixed(1)} KB</p>
            </div>
            <button className="text-xs underline text-neutral-600 hover:text-black">Change file</button>
          </>
        ) : (
          <>
            <div className="w-12 h-12 rounded-full bg-black/5 flex items-center justify-center">
              <svg className="w-6 h-6 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-neutral-900">Click to upload document</p>
              <p className="text-xs text-neutral-500 mt-1">PDF, DOC, DOCX, TXT up to 10MB</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
