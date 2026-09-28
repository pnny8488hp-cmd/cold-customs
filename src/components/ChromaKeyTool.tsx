import React, { useRef, useState, useEffect } from 'react';
import { Sparkles, Sliders, Upload, RefreshCw, Eye } from 'lucide-react';
import kitImg from '../assets/images/kit.png';

interface ChromaKeyToolProps {
  onOpenCheckout: () => void;
}

export const ChromaKeyTool: React.FC<ChromaKeyToolProps> = ({ onOpenCheckout }) => {
  const [tolerance, setTolerance] = useState<number>(45);
  const [smoothness, setSmoothness] = useState<number>(20);
  const [customImage, setCustomImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setCustomImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Chroma key green removal algorithm on canvas
  const processChromaKey = (imageSrc: string) => {
    setIsProcessing(true);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageSrc;
    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = img.naturalWidth || 600;
      canvas.height = img.naturalHeight || 600;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      // Pure green keying
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // Green screen detection: G significantly dominates over R and B
        const maxRB = Math.max(r, b);
        const greenDifference = g - maxRB;

        if (greenDifference > tolerance) {
          // Falloff / smoothing
          const alphaFactor = Math.max(0, 1 - (greenDifference - tolerance) / smoothness);
          data[i + 3] = Math.round(data[i + 3] * alphaFactor);

          // Green despill: clamp green to max(r, b) to eliminate edge halos
          if (g > maxRB) {
            data[i + 1] = maxRB;
          }
        }
      }

      ctx.putImageData(imageData, 0, 0);
      setIsProcessing(false);
    };
  };

  useEffect(() => {
    if (customImage) {
      processChromaKey(customImage);
    }
  }, [customImage, tolerance, smoothness]);

  return (
    <div className="rounded-3xl bg-zinc-900/60 border border-white/10 p-6 sm:p-8 mt-12 overflow-hidden">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block mb-1">
            Silnik Chroma Key
          </span>
          <h3 className="text-xl font-bold text-white">
            Własne zdjęcia z green screenem
          </h3>
          <p className="text-xs text-zinc-400 mt-1">
            Wgraj dowolne zdjęcie hamulców na zielonym tle, aby usunąć tło bezpośrednio w przeglądarce bez zmiany wyglądu części.
          </p>
        </div>

        <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold cursor-pointer border border-white/10 transition-colors whitespace-nowrap self-start md:self-auto">
          <Upload className="w-4 h-4" />
          <span>Wgraj plik (JPG / PNG)</span>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
        </label>
      </div>

      {customImage ? (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          <div className="md:col-span-7 flex justify-center bg-zinc-950 rounded-2xl p-4 border border-white/5 relative">
            <canvas
              ref={canvasRef}
              className="max-h-[380px] w-auto object-contain rounded-xl"
            />
            {isProcessing && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center text-xs text-zinc-300 gap-2">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Wycinanie green screenu...</span>
              </div>
            )}
          </div>

          <div className="md:col-span-5 space-y-5">
            <div>
              <div className="flex justify-between text-xs text-zinc-400 mb-1.5">
                <span>Czułość wycinania zieleni (Tolerancja)</span>
                <span className="text-white font-mono">{tolerance}</span>
              </div>
              <input
                type="range"
                min="10"
                max="90"
                value={tolerance}
                onChange={(e) => setTolerance(Number(e.target.value))}
                className="w-full accent-white cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs text-zinc-400 mb-1.5">
                <span>Wygładzanie krawędzi (Despill)</span>
                <span className="text-white font-mono">{smoothness}</span>
              </div>
              <input
                type="range"
                min="5"
                max="50"
                value={smoothness}
                onChange={(e) => setSmoothness(Number(e.target.value))}
                className="w-full accent-white cursor-pointer"
              />
            </div>

            <p className="text-[11px] text-zinc-400">
              Oryginalna geometria, faktura metalu i śruby pozostają w 100% nienaruszone.
            </p>
          </div>
        </div>
      ) : (
        <div className="border border-dashed border-white/10 rounded-2xl p-6 text-center text-xs text-zinc-400">
          Możesz wgrać swoje pliki ze zdjęciami części w formacie JPG, aby natychmiast zobaczyć je z przezroczystym tłem na stronie produktu.
        </div>
      )}
    </div>
  );
};
