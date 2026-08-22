'use client';

import { motion } from "framer-motion";
import { Mail, Lock, User, Eye, EyeOff, ArrowRight } from "lucide-react";
import { GoogleIcon } from "./google-icon";

interface IconProps {
  className?: string;
  isFocused?: boolean;
}

export function AnimatedMailIcon({ className = "w-4 h-4", isFocused = false }: IconProps) {
  return (
    <motion.div
      animate={isFocused ? { scale: [1, 1.2, 1], rotate: [0, -8, 8, 0] } : { scale: 1, rotate: 0 }}
      transition={{ duration: 0.4 }}
      className="inline-flex items-center justify-center text-muted-foreground"
    >
      <Mail className={className} />
    </motion.div>
  );
}

export function AnimatedLockIcon({ className = "w-4 h-4", isFocused = false }: IconProps) {
  return (
    <motion.div
      animate={isFocused ? { y: [0, -2, 0], rotate: [0, -10, 10, 0] } : { y: 0, rotate: 0 }}
      transition={{ duration: 0.4 }}
      className="inline-flex items-center justify-center text-muted-foreground"
    >
      <Lock className={className} />
    </motion.div>
  );
}

export function AnimatedUserIcon({ className = "w-4 h-4", isFocused = false }: IconProps) {
  return (
    <motion.div
      animate={isFocused ? { scale: [1, 1.25, 1] } : { scale: 1 }}
      transition={{ duration: 0.3 }}
      className="inline-flex items-center justify-center text-muted-foreground"
    >
      <User className={className} />
    </motion.div>
  );
}

export function AnimatedEyeIcon({ isVisible, className = "w-4 h-4" }: { isVisible: boolean; className?: string }) {
  return (
    <motion.div
      key={isVisible ? "eye-visible" : "eye-hidden"}
      initial={{ scale: 0.7, opacity: 0, rotate: -20 }}
      animate={{ scale: 1, opacity: 1, rotate: 0 }}
      transition={{ duration: 0.25 }}
      className="inline-flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
    >
      {isVisible ? <EyeOff className={className} /> : <Eye className={className} />}
    </motion.div>
  );
}

export function AnimatedGoogleIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <motion.div
      whileHover={{ scale: 1.15, rotate: 6 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      className="inline-flex items-center justify-center"
    >
      <GoogleIcon className={className} />
    </motion.div>
  );
}

export function AnimatedArrowIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <motion.div
      animate={{ x: [0, 3, 0] }}
      transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
      className="inline-flex items-center justify-center"
    >
      <ArrowRight className={className} />
    </motion.div>
  );
}
