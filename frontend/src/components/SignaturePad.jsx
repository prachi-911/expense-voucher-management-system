import React, { useRef, useState, useEffect } from 'react';
import { PenTool, Upload, Check, RefreshCw, Image as ImageIcon } from 'lucide-react';

const SignaturePad = ({ value, onChange, savedSignatureUrl, label = "Employee Signature" }) => {
  const [mode, setMode] = useState('draw'); // 'draw' | 'upload' | 'saved'
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);

  // Setup Canvas context
  useEffect(() => {
    if (mode === 'draw' && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = '#1e293b'; // dark slate
    }
  }, [mode]);

  // Set initial preview if existing value/url is provided
  useEffect(() => {
    if (value && typeof value === 'string' && (value.startsWith('http') || value.startsWith('/uploads'))) {
      setPreviewUrl(value);
      setMode('saved');
    }
  }, [value]);

  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');

    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
    setHasDrawn(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');

    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      const dataUrl = canvas.toDataURL('image/png');
      onChange({ type: 'base64', data: dataUrl });
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
    onChange({ type: 'none', data: null });
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewUrl(reader.result);
        onChange({ type: 'file', file, data: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUseSaved = () => {
    if (savedSignatureUrl) {
      setPreviewUrl(savedSignatureUrl);
      onChange({ type: 'saved', data: savedSignatureUrl });
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-semibold text-slate-700">
          {label} <span className="text-rose-500">*</span>
        </label>
        
        {/* Signature Input Mode Switcher */}
        <div className="flex items-center bg-slate-100 p-1 rounded-lg text-xs font-medium">
          <button
            type="button"
            onClick={() => { setMode('draw'); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
              mode === 'draw'
                ? 'bg-white text-indigo-700 shadow-sm font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <PenTool size={13} />
            <span>Draw</span>
          </button>
          <button
            type="button"
            onClick={() => { setMode('upload'); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
              mode === 'upload'
                ? 'bg-white text-indigo-700 shadow-sm font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Upload size={13} />
            <span>Upload Image</span>
          </button>
          {savedSignatureUrl && (
            <button
              type="button"
              onClick={() => { setMode('saved'); handleUseSaved(); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
                mode === 'saved'
                  ? 'bg-white text-indigo-700 shadow-sm font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Check size={13} />
              <span>Saved Profile</span>
            </button>
          )}
        </div>
      </div>

      {/* DRAW MODE */}
      {mode === 'draw' && (
        <div className="border border-slate-300 rounded-xl bg-white p-3 shadow-inner">
          <div className="relative border border-dashed border-slate-300 rounded-lg bg-slate-50/50 flex flex-col items-center justify-center overflow-hidden">
            <canvas
              ref={canvasRef}
              width={480}
              height={140}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
              className="cursor-crosshair w-full max-w-[480px] h-[140px] touch-none"
            />
            {!hasDrawn && (
              <div className="absolute pointer-events-none text-slate-400 text-xs flex items-center gap-1.5">
                <PenTool size={14} />
                <span>Draw your digital signature here with mouse or stylus</span>
              </div>
            )}
          </div>
          <div className="mt-2.5 flex items-center justify-between text-xs text-slate-500">
            <span>Canvas auto-captures on pen release</span>
            <button
              type="button"
              onClick={clearCanvas}
              className="inline-flex items-center gap-1 text-rose-600 hover:text-rose-700 font-medium py-1 px-2 rounded-md hover:bg-rose-50 transition-colors"
            >
              <RefreshCw size={12} />
              <span>Clear Canvas</span>
            </button>
          </div>
        </div>
      )}

      {/* UPLOAD MODE */}
      {mode === 'upload' && (
        <div className="border border-slate-300 rounded-xl bg-white p-4">
          <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 hover:border-indigo-400 rounded-xl p-6 transition-colors bg-slate-50/50">
            {previewUrl && (
              <div className="mb-4 bg-white p-2 rounded-lg border border-slate-200 shadow-sm max-w-[280px]">
                <img
                  src={previewUrl}
                  alt="Signature Preview"
                  className="max-h-24 object-contain mx-auto"
                />
              </div>
            )}
            <ImageIcon className="text-slate-400 mb-2" size={32} />
            <p className="text-sm font-medium text-slate-700 mb-1">
              Select Signature Image (PNG, JPG, JPEG)
            </p>
            <p className="text-xs text-slate-500 mb-4">Max file size: 5MB</p>
            <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 font-medium rounded-lg text-xs hover:bg-indigo-100 transition-colors">
              <Upload size={14} />
              <span>Browse Image File</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>
      )}

      {/* SAVED PROFILE SIGNATURE MODE */}
      {mode === 'saved' && (
        <div className="border border-slate-300 rounded-xl bg-white p-4">
          <p className="text-xs text-slate-600 mb-3 font-medium">Using pre-saved profile signature:</p>
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 flex items-center justify-center max-w-sm mx-auto">
            <img
              src={previewUrl || savedSignatureUrl}
              alt="Saved Signature"
              className="max-h-24 object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default SignaturePad;
