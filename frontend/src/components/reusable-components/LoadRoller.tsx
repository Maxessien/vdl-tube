"use client";

import { motion } from "framer-motion";
import type { CSSProperties } from "react";

interface LoadRollerProps {
  className?: string;
  size?: number;
  strokeWidth?: number;
  duration?: number;
}

const LoadRoller = ({ className = "", size, strokeWidth = 6, duration = 1 }: LoadRollerProps) => {
  const containerStyle: CSSProperties = {
    width: size ? `${size}px` : "100%",
    height: size ? `${size}px` : "100%",
    display: "inline-block",
  };

  const radius = 45;
  const circumference = 2 * Math.PI * radius;

  return (
    <div style={containerStyle}>
      <motion.svg
        viewBox="0 0 100 100"
        style={{
          width: "100%",
          height: "100%",
          display: "block",
        }}
        animate={{ rotate: 360 }}
        transition={{
          duration: duration * 1.5,
          repeat: Infinity,
          ease: "linear",
          repeatType: "loop",
        }}
      >
        {/* Outer rotating ring with gradient effect */}
        <defs>
          <linearGradient id="loaderGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="currentColor" stopOpacity="1" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0.3" />
          </linearGradient>
        </defs>
        
        {/* Main animated circle */}
        <motion.circle
          cx="50"
          cy="50"
          r={radius}
          fill="transparent"
          stroke="url(#loaderGradient)"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference * 0.25}
          strokeDashoffset={0}
          strokeLinecap="round"
          animate={{
            strokeDashoffset: -circumference,
          }}
          transition={{
            duration: duration * 1.5,
            repeat: Infinity,
            ease: "linear",
            repeatType: "loop",
          }}
          className={className}
        />
        
        {/* Secondary subtle circle for depth */}
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="transparent"
          stroke="currentColor"
          strokeWidth={strokeWidth * 0.5}
          opacity="0.1"
        />
      </motion.svg>
    </div>
  );
};

export default LoadRoller;
