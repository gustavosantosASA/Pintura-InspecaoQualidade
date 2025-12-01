
import React, { useRef, useEffect, useState } from 'react';
import { Eraser, PenTool } from 'lucide-react';

interface SignaturePadProps {
  onEnd: (dataUrl: string | null) => void;
}

const SignaturePad: React.FC<SignaturePadProps> = ({ onEnd }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      // Make it responsive to parent
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.clientWidth;
      } else {
         canvas.width = 500;
      }
      canvas.height = 180;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = '#0f172a'; // slate-900
      }
    }
  }, []);

  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    
    let clientX, clientY;
    
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }

    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault(); 
    setIsDrawing(true);
    const pos = getPos(e);
    const ctx = canvasRef.current?.getContext('2d');
    ctx?.beginPath();
    ctx?.moveTo(pos.x, pos.y);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    e.preventDefault();
    const pos = getPos(e);
    const ctx = canvasRef.current?.getContext('2d');
    ctx?.lineTo(pos.x, pos.y);
    ctx?.stroke();
    setHasSignature(true);
  };

  const endDrawing = () => {
    setIsDrawing(false);
    if (canvasRef.current && hasSignature) {
      onEnd(canvasRef.current.toDataURL('image/png'));
    }
  };

  const clear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (canvas && ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      setHasSignature(false);
      onEnd(null);
    }
  };

  return (
    <div className="w-full">
      <div className="border border-slate-300 rounded-md bg-white relative overflow-hidden touch-none shadow-inner">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={endDrawing}
          onMouseLeave={endDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={endDrawing}
          className="cursor-crosshair w-full h-[180px]"
        />
        {!hasSignature && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
             <PenTool size={48} className="text-slate-400" />
          </div>
        )}
        <div className="absolute bottom-2 left-3 text-[10px] text-slate-400 pointer-events-none bg-white/80 px-1 rounded">
          Assine acima utilizando o mouse ou touch
        </div>
      </div>
      <button
        onClick={clear}
        type="button"
        className="mt-2 text-xs flex items-center text-slate-500 hover:text-red-600 font-medium transition-colors"
      >
        <Eraser className="w-3.5 h-3.5 mr-1" />
        Limpar Assinatura
      </button>
    </div>
  );
};

export default SignaturePad;
