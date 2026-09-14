'use client';

import { motion } from 'framer-motion';

export default function SystemLoader() {
  return (
    <div className="flex h-screen flex-col items-center justify-center bg-background">
      <p className="mb-2 text-lg font-semibold text-foreground">Loading system</p>

      <p className="mb-5 text-sm text-muted-foreground">
        Please wait while we prepare your data
      </p>

      <div className="flex gap-3">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="h-3 w-3 rounded-full bg-primary"
            animate={{
              scale: [1, 1.4, 1],
              opacity: [0.2, 1, 0.2],
            }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              delay: i * 0.2,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>
    </div>
  );
}
