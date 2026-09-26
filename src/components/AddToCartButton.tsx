import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingBag, Check } from 'lucide-react';

interface AddToCartButtonProps {
  onAdd: (buttonRect: DOMRect) => void;
  price?: number;
  label?: string;
  className?: string;
  compact?: boolean;
}

export const AddToCartButton: React.FC<AddToCartButtonProps> = ({
  onAdd,
  price = 799,
  label = 'Dodaj do koszyka',
  className = '',
  compact = false,
}) => {
  const [isAdded, setIsAdded] = useState(false);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    onAdd(rect);
    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
    }, 2000);
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.96 }}
      onClick={handleClick}
      className={`relative overflow-hidden font-semibold transition-all shadow-md active:shadow-sm cursor-pointer flex items-center justify-center gap-2 ${
        isAdded
          ? 'bg-emerald-500 text-white'
          : 'bg-white hover:bg-zinc-200 text-black'
      } ${
        compact
          ? 'px-4 py-2 text-xs rounded-xl'
          : 'px-6 py-3.5 text-sm rounded-full'
      } ${className}`}
    >
      <AnimatePresence mode="wait">
        {isAdded ? (
          <motion.span
            key="added"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="flex items-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            <span>Dodano do koszyka!</span>
          </motion.span>
        ) : (
          <motion.span
            key="idle"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className="flex items-center gap-2"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>{label}</span>
            {price && !compact && (
              <span className="opacity-70 tabular-nums">· {price} zł</span>
            )}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
};
