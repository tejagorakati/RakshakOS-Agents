import React, { useRef } from 'react';
import { FileSpreadsheet, Upload, X, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface ExcelUploadProps {
  selectedFileName?: string | null;
  selectedFileSize?: number | null;
  onFileSelect: (fileName: string, fileSize: number) => void;
  onFileRemove: () => void;
}

export const ExcelUpload: React.FC<ExcelUploadProps> = ({
  selectedFileName,
  selectedFileSize,
  onFileSelect,
  onFileRemove,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file.name, file.size);
    }
  };

  const formatFileSize = (bytes?: number | null) => {
    if (!bytes) return '';
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-4 font-sans text-xs">
      {/* CRITICAL EXCEL RULE WARNING BOX */}
      <div className="p-4 rounded-md border border-rose-200 bg-rose-50 text-rose-900 space-y-2">
        <div className="font-semibold flex items-center gap-2 text-rose-900 text-xs tracking-wide uppercase">
          <AlertTriangle size={16} className="text-rose-600 shrink-0" />
          Excel Bulk Upload Rule
        </div>
        <p className="text-rose-800 text-xs leading-relaxed">
          The Excel upload file MUST contain <strong className="text-rose-950 underline font-bold">TEAM MEMBERS ONLY</strong>.
          The NGO Leader / Coordinator details entered above must <strong className="text-rose-950 font-bold">NOT</strong> be included inside the uploaded Excel sheet to prevent duplicate leader registration.
        </p>
        <div className="pt-2 border-t border-rose-200 text-[11px] text-rose-900 flex items-center gap-2 font-mono">
          <span className="font-bold text-slate-800 font-sans">Expected Columns:</span>
          <code className="bg-white px-2 py-0.5 rounded border border-rose-200 text-slate-900">
            Name | Mobile / Contact | Email
          </code>
        </div>
      </div>

      {/* Upload Dropzone / File Selected State */}
      {selectedFileName ? (
        <div className="p-4 rounded-md border border-sky-200 bg-sky-50 space-y-3 text-slate-900">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-md bg-white border border-sky-200 text-sky-700">
                <FileSpreadsheet size={24} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 text-sm">{selectedFileName}</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-sans font-semibold">
                    File Selected
                  </span>
                </div>
                <span className="text-xs text-slate-600 block mt-0.5">
                  {formatFileSize(selectedFileSize)} • Ready for batch backend parsing on registration submit
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={onFileRemove}
              className="p-1.5 rounded-md text-slate-500 hover:text-rose-600 hover:bg-white transition-colors"
              title="Remove selected Excel file"
            >
              <X size={18} />
            </button>
          </div>

          <div className="text-[11px] text-slate-700 font-sans flex items-center gap-1.5 pt-2 border-t border-sky-200">
            <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
            File is queued. NGO team members will be processed automatically during backend onboarding.
          </div>
        </div>
      ) : (
        <div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".xlsx,.xls,.csv"
            className="hidden"
          />
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center cursor-pointer hover:border-slate-400 hover:bg-slate-50/80 transition-all space-y-2 bg-white"
          >
            <div className="w-10 h-10 mx-auto rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700">
              <Upload size={20} />
            </div>
            <div>
              <span className="text-xs font-sans font-bold text-slate-900 uppercase tracking-wide block">
                Click to Select Team Members Excel File (.xlsx / .csv)
              </span>
              <span className="text-xs text-slate-500 font-sans block mt-1">
                Upload batch roster for organization members (excluding NGO leader).
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
