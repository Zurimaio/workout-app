// src/components/LoadingOverlay.jsx
import React from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function LoadingOverlay({ isVisible = false }) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.8 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 bg-gray-900 flex items-center justify-center z-50"
        >
          <motion.div
            className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin"
            initial={{ rotate: 0 }}
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
