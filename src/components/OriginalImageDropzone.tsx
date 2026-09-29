import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Upload, Check, RefreshCw, X, Server, Camera, Trash2 } from 'lucide-react';
import { useProductImages, ImageSlots, FitMode, defaultImages } from '../context/ImageContext';

interface OriginalImageDropzoneProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OriginalImageDropzone: React.FC<OriginalImageDropzoneProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    images,
    isCustomLoaded,
    fitMode,
    setFitMode,
    useChromaKey,
    setUseChromaKey,
    saveRawImage,
    processMultipleFiles,
    resetToDefaults,
    refreshFromServer,
  } = useProductImages();

  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isDraggingGlobal, setIsDraggingGlobal] = useState(false);
  const [activeSlotUploading, setActiveSlotUploading] = useState<string | null>(null);

  // Global Drag & Drop disabled for public customers
  useEffect(() => {
    // Disabled global window listeners
  }, []);

  // Handle Multi-file upload batch
  const handleBatchUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsProcessing(true);
    setMessage(`Przetwarzanie ${files.length} plików...`);

    try {
      const results = await processMultipleFiles(files, useChromaKey);
      const successCount = results.filter((r) => r.success).length;
      setMessage(`✓ Pomyślnie zapisano ${successCount} zdjęć na dysku serwera (/public/images/)!`);
      setTimeout(() => {
        setMessage(null);
      }, 4000);
    } catch {
      setMessage('Błąd zapisu plików.');
    } finally {
      setIsProcessing(false);
      if (e.target) e.target.value = '';
    }
  };

  // Handle Single slot upload
  const handleSingleSlotUpload = async (
    slot: keyof ImageSlots,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setActiveSlotUploading(slot);
    setMessage(`Zapisywanie zdjęcia dla sekcji: ${slot}...`);

    try {
      await saveRawImage(slot, file, useChromaKey);
      setMessage(`✓ Zapisano ${slot} na serwerze!`);
      setTimeout(() => setMessage(null), 3000);
    } catch {
      setMessage('Błąd zapisu na serwerze.');
    } finally {
      setActiveSlotUploading(null);
      if (e.target) e.target.value = '';
    }
  };

  const slotLabels: { key: keyof ImageSlots; label: string; desc: string }[] = [
    { key: 'kit', label: '1. Cały zestaw Ultra Bee Brakes (Główne)', desc: 'Zdjęcie kompletu: tarcza, zacisk, klamka, przewód' },
    { key: 'lever', label: '2. Klamka i pompa', desc: 'Lewa klamka ze zbiorniczkiem i pompą' },
    { key: 'caliper', label: '3. Zacisk 2-tłoczkowy', desc: 'Aluminiowy zacisk hamulcowy z klockami' },
    { key: 'rotor', label: '4. Tarcza 240 mm', desc: 'Stalowa tarcza 240 mm o grubości 3,2 mm' },
    { key: 'guard', label: '5. Wspornik CNC', desc: 'Czarny frezowany adapter zacisku' },
    { key: 'plateClean', label: '6. Front Plate (Bez naklejki)', desc: 'Czysta czarna tablica ze zintegrowanymi siatkami (119 zł)' },
    { key: 'plateSticker', label: '7. Front Plate (Z okleiną #1)', desc: 'Tablica z fabrycznie naklejoną okleiną gratis (119 zł)' },
  ];

  return (
    <>
      {/* Full-screen Drag Overlay */}
      <AnimatePresence>
        {isDraggingGlobal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center p-6 border-4 border-dashed border-white m-4 rounded-3xl pointer-events-none"
          >
            <div className="w-20 h-20 rounded-full bg-white/20 border border-white/40 text-white flex items-center justify-center mb-4 animate-bounce">
              <Upload className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2 text-center">
              Upuść zdjęcia tutaj
            </h3>
            <p className="text-zinc-300 text-sm text-center max-w-md">
              Pliki zostaną zapisane bezpośrednio na dysku serwera bez żadnych zmian AI.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal / Dialog */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/80 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-2xl bg-[#09090d] border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl z-10 overflow-hidden max-h-[92vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
                <div>
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <span>Zarządzanie zdjęciami produktu</span>
                    <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 flex items-center gap-1">
                      <Server className="w-3 h-3" />
                      Dysk serwera
                    </span>
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1">
                    Każde wgrane zdjęcie zapisuje się na stałe na serwerze w folderze <code>public/images/</code>.
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Status Message */}
              {message && (
                <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
                  {isProcessing ? (
                    <RefreshCw className="w-4 h-4 animate-spin shrink-0" />
                  ) : (
                    <Check className="w-4 h-4 shrink-0" />
                  )}
                  <span>{message}</span>
                </div>
              )}

              {/* View options bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 mb-6 p-3 bg-zinc-900/60 rounded-2xl border border-white/10 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-zinc-400">Dopasowanie:</span>
                  <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-xl border border-white/10">
                    <button
                      type="button"
                      onClick={() => setFitMode('cover')}
                      className={`py-1 px-2.5 rounded-lg font-medium text-[11px] transition-all cursor-pointer ${
                        fitMode === 'cover'
                          ? 'bg-white text-black font-semibold shadow-xs'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      Pełne tło (Cover)
                    </button>
                    <button
                      type="button"
                      onClick={() => setFitMode('contain')}
                      className={`py-1 px-2.5 rounded-lg font-medium text-[11px] transition-all cursor-pointer ${
                        fitMode === 'contain'
                          ? 'bg-white text-black font-semibold shadow-xs'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      Dopasuj (Contain)
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={refreshFromServer}
                    className="flex items-center gap-1 text-[11px] text-zinc-400 hover:text-white cursor-pointer px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Przeładuj z serwera</span>
                  </button>
                </div>
              </div>

              {/* Slot by Slot Upload Cards */}
              <div className="space-y-3 mb-6">
                <span className="text-xs font-semibold text-zinc-300 uppercase tracking-wider block">
                  Zdjęcia poszczególnych komponentów:
                </span>
                
                {slotLabels.map(({ key, label, desc }) => {
                  const isCustom = images[key] !== defaultImages[key];
                  const isUploading = activeSlotUploading === key;

                  return (
                    <div
                      key={key}
                      className="p-3.5 rounded-2xl bg-zinc-900/80 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-white/20 transition-all"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="w-14 h-14 rounded-xl bg-zinc-950 border border-white/10 p-0.5 flex items-center justify-center shrink-0 overflow-hidden relative">
                          <img
                            src={images[key]}
                            alt={label}
                            className={`w-full h-full ${
                              fitMode === 'cover' ? 'object-cover' : 'object-contain'
                            }`}
                          />
                          {isCustom && (
                            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-black" title="Zapisano na serwerze" />
                          )}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-white truncate">
                              {label}
                            </span>
                            {isCustom ? (
                              <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20 font-medium">
                                Zapisane
                              </span>
                            ) : (
                              <span className="text-[10px] text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded-md">
                                Domyślne
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-zinc-400 block mt-0.5">
                            {desc}
                          </span>
                        </div>
                      </div>

                      {/* Upload button for this specific slot */}
                      <label className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-white hover:bg-zinc-200 text-black font-semibold text-xs cursor-pointer transition-all shrink-0 shadow-sm">
                        {isUploading ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>Zapisywanie...</span>
                          </>
                        ) : (
                          <>
                            <Camera className="w-3.5 h-3.5" />
                            <span>{isCustom ? 'Zmień plik' : 'Wgraj zdjęcie'}</span>
                          </>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleSingleSlotUpload(key, e)}
                          disabled={isProcessing || isUploading}
                          className="hidden"
                        />
                      </label>
                    </div>
                  );
                })}
              </div>

              {/* Multi-file Dropzone Alternative */}
              <div className="pt-4 border-t border-white/10">
                <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block mb-2">
                  Lub wgraj kilka plików naraz:
                </span>
                <label className="border-2 border-dashed border-white/20 hover:border-white/40 rounded-2xl p-4 text-center cursor-pointer transition-colors block bg-zinc-900/30 group">
                  <Upload className="w-6 h-6 text-zinc-400 group-hover:text-white transition-colors mx-auto mb-1.5" />
                  <span className="text-xs font-semibold text-white block">
                    Wybierz wszystkie pliki jednocześnie
                  </span>
                  <span className="text-[11px] text-zinc-400 block mt-0.5">
                    System automatycznie przypisze je do wolnych sekcji i zapisze na serwerze
                  </span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleBatchUpload}
                    disabled={isProcessing}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Footer */}
              <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
                <button
                  onClick={resetToDefaults}
                  className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300 underline cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Wyczyść wgrane zdjęcia</span>
                </button>

                <button
                  onClick={onClose}
                  className="px-5 py-2 text-xs font-semibold text-black bg-white hover:bg-zinc-200 rounded-xl transition-all cursor-pointer shadow-md"
                >
                  Gotowe
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
