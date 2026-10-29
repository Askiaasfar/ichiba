import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, RefreshCw, AlertCircle, Check } from 'lucide-react';

interface MediaUploadProps {
  label: string;
  hint?: string;
  value?: string | string[];
  onChange: (value: string | string[]) => void;
  multiple?: boolean;
  aspectRatio?: '1:1' | '16:9' | 'auto';
  maxDimension?: number;
  quality?: number;
  className?: string;
}

export const MediaUpload: React.FC<MediaUploadProps> = ({
  label,
  hint = 'PNG, JPG, or WEBP up to 10MB. Images are auto-compressed for rapid loading.',
  value,
  onChange,
  multiple = false,
  aspectRatio = 'auto',
  maxDimension = 1200,
  quality = 0.82,
  className = ''
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Normalize current images
  const images: string[] = Array.isArray(value)
    ? value.filter(Boolean)
    : value
    ? [value]
    : [];

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          let { width, height } = img;

          // Resize if larger than maxDimension
          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = Math.round((height * maxDimension) / width);
              width = maxDimension;
            } else {
              width = Math.round((width * maxDimension) / height);
              height = maxDimension;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(e.target?.result as string);
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve(compressedDataUrl);
        };
        img.onerror = () => reject(new Error('Failed to read image file'));
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error('Failed to load file'));
      reader.readAsDataURL(file);
    });
  };

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setIsProcessing(true);
    setError(null);

    try {
      const processed: string[] = [];
      const filesToProcess = multiple ? Array.from(files) : [files[0]];

      for (const file of filesToProcess) {
        if (!file.type.startsWith('image/')) {
          throw new Error(`File "${file.name}" is not an image.`);
        }
        if (file.size > 15 * 1024 * 1024) {
          throw new Error(`File "${file.name}" exceeds 15MB size limit.`);
        }
        const dataUrl = await compressImage(file);
        processed.push(dataUrl);
      }

      if (multiple) {
        onChange([...images, ...processed]);
      } else {
        onChange(processed[0]);
      }
    } catch (err: any) {
      setError(err.message || 'Error processing image');
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemove = (indexToRemove: number) => {
    if (multiple) {
      const next = images.filter((_, idx) => idx !== indexToRemove);
      onChange(next);
    } else {
      onChange('');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold text-slate-800">
          {label}
        </label>
        {aspectRatio !== 'auto' && (
          <span className="text-[10px] uppercase font-bold tracking-wider text-[#D4AF37] bg-black px-2 py-0.5 rounded">
            Target Aspect {aspectRatio}
          </span>
        )}
      </div>

      {error && (
        <div className="p-2 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs flex items-center gap-2">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Preview thumbnails if images exist */}
      {images.length > 0 && (
        <div className={`grid gap-2.5 ${multiple ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4' : 'grid-cols-1'}`}>
          {images.map((imgSrc, idx) => (
            <div
              key={idx}
              className={`relative group rounded-xl overflow-hidden border border-slate-200 bg-slate-900 shadow-xs ${
                aspectRatio === '1:1'
                  ? 'aspect-square'
                  : aspectRatio === '16:9'
                  ? 'aspect-video'
                  : 'h-36'
              }`}
            >
              <img
                src={imgSrc}
                alt={`Uploaded ${idx + 1}`}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-1.5 bg-white text-slate-900 rounded-lg hover:bg-[#D4AF37] hover:text-black transition-colors"
                  title="Replace photo"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleRemove(idx)}
                  className="p-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  title="Remove photo"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="absolute bottom-1.5 left-1.5 bg-black/75 px-1.5 py-0.5 rounded text-[9px] text-[#D4AF37] font-semibold flex items-center gap-1">
                <Check className="w-2.5 h-2.5" />
                <span>Optimized</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Dropzone */}
      {(!images.length || multiple) && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
            dragOver
              ? 'border-[#D4AF37] bg-[#D4AF37]/5 ring-2 ring-[#D4AF37]/20'
              : 'border-slate-300 hover:border-[#D4AF37] hover:bg-slate-50/50'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            multiple={multiple}
            onChange={(e) => handleFiles(e.target.files)}
            className="hidden"
          />

          <div className="flex flex-col items-center justify-center gap-1.5 py-2">
            {isProcessing ? (
              <RefreshCw className="w-6 h-6 text-[#D4AF37] animate-spin" />
            ) : (
              <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                <Upload className="w-4 h-4 text-slate-700" />
              </div>
            )}
            <div className="text-xs font-semibold text-slate-800">
              {isProcessing
                ? 'Compressing & Optimizing image...'
                : multiple
                ? 'Click or drag photos to upload'
                : 'Click to select or drag photo here'}
            </div>
            <p className="text-[11px] text-slate-500 max-w-xs">{hint}</p>
          </div>
        </div>
      )}
    </div>
  );
};
