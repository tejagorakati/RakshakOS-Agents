import React, { useRef } from 'react';
import { Upload, FileText, X, Paperclip } from 'lucide-react';

interface CvUploadProps {
  label?: string;
  selectedFileName?: string | null;
  selectedFileSize?: number | null;
  onFileSelect: (fileName: string, fileSize: number) => void;
  onFileRemove: () => void;
  helperText?: string;
}

export const CvUpload: React.FC<CvUploadProps> = ({
  label = 'Upload CV / Qualification Document',
  selectedFileName,
  selectedFileSize,
  onFileSelect,
  onFileRemove,
  helperText = 'Attach resume/CV (.pdf, .docx, max 10MB) for skill verification upon account activation.',
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
    <div className="space-y-1.5 font-sans text-xs">
      <label className="text-slate-700 uppercase text-[10px] font-semibold tracking-wider flex items-center gap-1.5">
        <Paperclip size={13} className="text-slate-700" />
        {label}
      </label>

      {selectedFileName ? (
        <div className="flex items-center justify-between p-3 rounded-md border border-slate-200 bg-slate-50 text-slate-800">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <FileText size={18} className="text-slate-700 shrink-0" />
            <div className="truncate">
              <span className="text-xs font-semibold text-slate-900 block truncate">{selectedFileName}</span>
              {selectedFileSize && (
                <span className="text-[11px] text-slate-500 block">{formatFileSize(selectedFileSize)}</span>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={onFileRemove}
            className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-slate-200 transition-colors"
            title="Remove attached CV"
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".pdf,.doc,.docx"
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full flex items-center justify-center gap-2 p-3 rounded-md border border-dashed border-slate-300 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50 transition-all text-xs font-sans font-medium cursor-pointer"
          >
            <Upload size={14} className="text-slate-600" />
            <span>Select CV Document (.pdf / .docx)</span>
          </button>
        </div>
      )}

      {helperText && (
        <p className="text-[11px] text-slate-500 font-sans leading-normal">
          {helperText}
        </p>
      )}
    </div>
  );
};
