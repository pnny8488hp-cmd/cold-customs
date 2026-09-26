import React, { createContext, useContext, useState, useEffect } from 'react';
import defaultKit from '../assets/images/kit.png';
import defaultLever from '../assets/images/lever.png';
import defaultCaliper from '../assets/images/caliper.png';
import defaultRotor from '../assets/images/rotor.png';
import defaultGuard from '../assets/images/guard.png';

export interface ImageSlots {
  kit: string;
  lever: string;
  caliper: string;
  rotor: string;
  guard: string;
}

export type FitMode = 'cover' | 'contain';

interface ImageContextType {
  images: ImageSlots;
  isCustomLoaded: boolean;
  fitMode: FitMode;
  setFitMode: (mode: FitMode) => void;
  useChromaKey: boolean;
  setUseChromaKey: (val: boolean) => void;
  saveRawImage: (slot: keyof ImageSlots, fileOrDataUrl: File | string, applyKeying?: boolean) => Promise<string>;
  processMultipleFiles: (files: FileList | File[], withChromaKey?: boolean) => Promise<{ slot: string; success: boolean }[]>;
  resetToDefaults: () => Promise<void>;
  refreshFromServer: () => Promise<void>;
}

export const defaultImages: ImageSlots = {
  kit: defaultKit,
  lever: defaultLever,
  caliper: defaultCaliper,
  rotor: defaultRotor,
  guard: defaultGuard,
};

// IndexedDB persistence helper for heavy user-uploaded image binaries
const DB_NAME = 'ColdCustomsImageStorage';
const STORE_NAME = 'user_images';

function openImagesDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      return reject(new Error('IndexedDB not supported'));
    }
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains(STORE_NAME)) {
        req.result.createObjectStore(STORE_NAME);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function getStoredImagesFromIDB(): Promise<Partial<ImageSlots>> {
  try {
    const db = await openImagesDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const slots: (keyof ImageSlots)[] = ['kit', 'lever', 'caliper', 'rotor', 'guard'];
      const result: Partial<ImageSlots> = {};
      let remaining = slots.length;

      slots.forEach((slot) => {
        const getReq = store.get(slot);
        getReq.onsuccess = () => {
          if (getReq.result && typeof getReq.result === 'string') {
            result[slot] = getReq.result;
          }
          remaining--;
          if (remaining === 0) resolve(result);
        };
        getReq.onerror = () => {
          remaining--;
          if (remaining === 0) resolve(result);
        };
      });
    });
  } catch {
    return {};
  }
}

async function saveImageToIDB(slot: string, dataUrl: string): Promise<void> {
  try {
    const db = await openImagesDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.put(dataUrl, slot);
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    });
  } catch {}
}

async function clearImagesIDB(): Promise<void> {
  try {
    const db = await openImagesDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.clear();
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    });
  } catch {}
}

const ImageContext = createContext<ImageContextType | undefined>(undefined);

export const applyChromaKey = (
  img: HTMLImageElement,
  tolerance = 45,
  smoothness = 25
): string => {
  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth || img.width;
  canvas.height = img.naturalHeight || img.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return img.src;

  ctx.drawImage(img, 0, 0);
  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imgData.data;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    const maxRB = Math.max(r, b);
    const diff = g - maxRB;

    if (diff > tolerance) {
      if (diff > tolerance + smoothness) {
        data[i + 3] = 0;
      } else {
        const factor = 1 - (diff - tolerance) / smoothness;
        data[i + 3] = Math.round(data[i + 3] * factor);
      }
      data[i + 1] = maxRB;
    }
  }

  ctx.putImageData(imgData, 0, 0);
  return canvas.toDataURL('image/png');
};

export const ImageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Always default to the uploaded assets
  const [images, setImages] = useState<ImageSlots>(defaultImages);

  const [fitMode, setFitMode] = useState<FitMode>(() => {
    return (localStorage.getItem('ubb_fit_mode') as FitMode) || 'cover';
  });

  const [useChromaKey, setUseChromaKey] = useState<boolean>(false);
  const [isCustomLoaded, setIsCustomLoaded] = useState<boolean>(true);

  // Load from IndexedDB and server on mount
  const refreshFromServer = async () => {
    try {
      const res = await fetch('/api/save-original-images');
      const ct = res.headers.get('content-type');
      if (res.ok && ct && ct.includes('application/json')) {
        const data = await res.json();
        if (data.images && Object.keys(data.images).length > 0) {
          setImages((prev) => {
            const next = { ...prev };
            for (const [slot, url] of Object.entries(data.images)) {
              if (slot in next && typeof url === 'string') {
                next[slot as keyof ImageSlots] = url;
              }
            }
            return next;
          });
          setIsCustomLoaded(true);
        }
      }
    } catch {
      // Safe fallback, defaults are already rendered
    }
  };

  useEffect(() => {
    let active = true;
    const initializeStorage = async () => {
      // 1. Check IndexedDB
      const idbImages = await getStoredImagesFromIDB();
      if (active && Object.keys(idbImages).length > 0) {
        setImages((prev) => ({ ...prev, ...idbImages }));
      }
      // 2. Sync with dev server filesystem if available
      if (active) {
        await refreshFromServer();
      }
    };

    initializeStorage();
    return () => {
      active = false;
    };
  }, []);

  const handleSetFitMode = (mode: FitMode) => {
    setFitMode(mode);
    try {
      localStorage.setItem('ubb_fit_mode', mode);
    } catch {}
  };

  const saveRawImage = async (
    slot: keyof ImageSlots,
    fileOrDataUrl: File | string,
    applyKeying = useChromaKey
  ): Promise<string> => {
    return new Promise((resolve, reject) => {
      const processData = async (dataUrl: string, ext = 'png') => {
        try {
          let finalDataUrl = dataUrl;

          if (applyKeying) {
            const img = new Image();
            await new Promise<void>((resImg, rejImg) => {
              img.onload = () => {
                finalDataUrl = applyChromaKey(img);
                resImg();
              };
              img.onerror = rejImg;
              img.src = dataUrl;
            });
          }

          // 1. Update React state immediately so user sees their photo right away
          setImages((prev) => ({ ...prev, [slot]: finalDataUrl }));
          setIsCustomLoaded(true);

          // 2. Persist to IndexedDB so page reload preserves it
          await saveImageToIDB(slot, finalDataUrl);

          // 3. Try server filesystem save
          try {
            const finalExt = applyKeying ? 'png' : (ext || 'png');
            const res = await fetch('/api/save-original-images', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                slot,
                base64: finalDataUrl,
                ext: finalExt,
              }),
            });
            const ct = res.headers.get('content-type');
            if (res.ok && ct && ct.includes('application/json')) {
              const result = await res.json();
              if (result.url) {
                setImages((prev) => ({ ...prev, [slot]: result.url }));
              }
            }
          } catch {
            // Server error is safely ignored because IndexedDB already has it
          }

          resolve(finalDataUrl);
        } catch (err) {
          reject(err);
        }
      };

      if (typeof fileOrDataUrl === 'string') {
        processData(fileOrDataUrl);
      } else {
        const fileExt = fileOrDataUrl.name.split('.').pop()?.toLowerCase() || 'png';
        const reader = new FileReader();
        reader.onload = (e) => {
          processData(e.target?.result as string, fileExt);
        };
        reader.onerror = reject;
        reader.readAsDataURL(fileOrDataUrl);
      }
    });
  };

  const processMultipleFiles = async (
    files: FileList | File[],
    withChroma = useChromaKey
  ): Promise<{ slot: string; success: boolean }[]> => {
    const results: { slot: string; success: boolean }[] = [];
    const fileList = Array.from(files);

    const allSlots: (keyof ImageSlots)[] = ['kit', 'lever', 'caliper', 'rotor', 'guard'];
    const assignedSlots = new Set<keyof ImageSlots>();

    // Pass 1: Try keyword matching
    const unassignedFiles: File[] = [];
    for (const file of fileList) {
      const name = file.name.toLowerCase();
      let matchedSlot: keyof ImageSlots | null = null;

      if (name.includes('2793') || name.includes('lever') || name.includes('klamka') || name.includes('pompa')) {
        matchedSlot = 'lever';
      } else if (name.includes('2794') || name.includes('caliper') || name.includes('zacisk')) {
        matchedSlot = 'caliper';
      } else if (name.includes('2795') || name.includes('rotor') || name.includes('tarcza')) {
        matchedSlot = 'rotor';
      } else if (name.includes('2796') || name.includes('guard') || name.includes('wspornik') || name.includes('oslona') || name.includes('adapter')) {
        matchedSlot = 'guard';
      } else if (name.includes('unnamed') || name.includes('kit') || name.includes('zestaw') || name.includes('calosc')) {
        matchedSlot = 'kit';
      }

      if (matchedSlot && !assignedSlots.has(matchedSlot)) {
        assignedSlots.add(matchedSlot);
        try {
          await saveRawImage(matchedSlot, file, withChroma);
          results.push({ slot: matchedSlot, success: true });
        } catch {
          results.push({ slot: matchedSlot, success: false });
        }
      } else {
        unassignedFiles.push(file);
      }
    }

    // Pass 2: For any unassigned files, assign them to remaining unassigned slots
    const remainingSlots = allSlots.filter((s) => !assignedSlots.has(s));
    for (let i = 0; i < unassignedFiles.length; i++) {
      const targetSlot = remainingSlots[i] || allSlots[i % allSlots.length];
      const file = unassignedFiles[i];
      try {
        await saveRawImage(targetSlot, file, withChroma);
        results.push({ slot: targetSlot, success: true });
      } catch {
        results.push({ slot: targetSlot, success: false });
      }
    }

    return results;
  };

  const resetToDefaults = async () => {
    try {
      await fetch('/api/save-original-images', { method: 'DELETE' });
    } catch {}
    await clearImagesIDB();
    ['kit', 'lever', 'caliper', 'rotor', 'guard'].forEach((s) => {
      localStorage.removeItem(`ubb_orig_${s}`);
    });
    setImages(defaultImages);
    setIsCustomLoaded(true);
  };

  return (
    <ImageContext.Provider
      value={{
        images,
        isCustomLoaded,
        fitMode,
        setFitMode: handleSetFitMode,
        useChromaKey,
        setUseChromaKey,
        saveRawImage,
        processMultipleFiles,
        resetToDefaults,
        refreshFromServer,
      }}
    >
      {children}
    </ImageContext.Provider>
  );
};

export const useProductImages = () => {
  const context = useContext(ImageContext);
  if (!context) {
    throw new Error('useProductImages must be used within an ImageProvider');
  }
  return context;
};
