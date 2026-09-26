import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import kitImg from '../assets/images/exact_kit_1790439028601.jpg';

export interface FlyingItem {
  id: string;
  startX: number;
  startY: number;
  targetX: number;
  targetY: number;
  image?: string;
}

interface FlyingCartAnimationProps {
  flyingItems: FlyingItem[];
  onComplete: (id: string) => void;
}

export const FlyingCartAnimation: React.FC<FlyingCartAnimationProps> = ({
  flyingItems,
  onComplete,
}) => {
  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      <AnimatePresence>
        {flyingItems.map((item) => (
          <motion.div
            key={item.id}
            initial={{
              x: item.startX - 30,
              y: item.startY - 30,
              scale: 1,
              opacity: 1,
            }}
            animate={{
              x: item.targetX - 20,
              y: item.targetY - 20,
              scale: 0.35,
              opacity: 0.9,
            }}
            exit={{ opacity: 0, scale: 0.1 }}
            transition={{
              duration: 0.75,
              ease: [0.16, 1, 0.3, 1],
            }}
            onAnimationComplete={() => onComplete(item.id)}
            className="absolute top-0 left-0 w-16 h-16 rounded-full bg-white p-1 shadow-2xl ring-2 ring-white/60 flex items-center justify-center overflow-hidden"
          >
            <img
              src={item.image || kitImg}
              alt="Ultra Bee Brakes"
              className="w-full h-full object-contain"
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
