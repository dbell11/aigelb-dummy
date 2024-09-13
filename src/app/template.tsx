"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

export default function Template({ children }: { children: React.ReactNode }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Kurze Verzögerung, um sicherzustellen, dass das Styling angewendet wurde
    const timeoutId = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <>
      <style jsx global>{`
        html,
        body {
          overflow-y: scroll; /* Immer Scrollbalken anzeigen */
          scrollbar-width: thin; /* Für Firefox */
          scrollbar-color: transparent transparent; /* Für Firefox */
        }
        /* Für Webkit-Browser (Chrome, Safari, etc.) */
        ::-webkit-scrollbar {
          width: 0px; /* Minimale Breite */
          background: transparent;
        }
        ::-webkit-scrollbar-thumb {
          background: transparent;
        }
      `}</style>
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -10, opacity: 0 }}
            transition={{
              type: "spring",
              stiffness: 260,
              damping: 20,
              duration: 0.5,
            }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
