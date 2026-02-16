'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

interface Reward {
  id: string;
  name: string;
  type: string;
  probability: number;
  color: string;
}

interface WheelSpinnerProps {
  rewards: Reward[];
  spinning: boolean;
  onSpinComplete?: (rewardIndex: number) => void;
}

export default function WheelSpinner({ rewards, spinning, onSpinComplete }: WheelSpinnerProps) {
  const [rotation, setRotation] = useState(0);
  const wheelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (spinning) {
      // Random final position (3-7 full rotations + random offset)
      const spins = 3 + Math.random() * 4; // 3-7 vòng
      const randomOffset = Math.random() * 360;
      const finalRotation = rotation + (spins * 360) + randomOffset;
      
      setRotation(finalRotation);

      // Calculate which segment we landed on
      setTimeout(() => {
        const normalizedRotation = finalRotation % 360;
        const segmentAngle = 360 / rewards.length;
        // Adjust for arrow at top (pointing down)
        const adjustedRotation = (360 - normalizedRotation + 90) % 360;
        const selectedIndex = Math.floor(adjustedRotation / segmentAngle);
        
        if (onSpinComplete) {
          onSpinComplete(selectedIndex % rewards.length);
        }
      }, 4000); // Match animation duration
    }
  }, [spinning]);

  const segmentAngle = 360 / rewards.length;

  return (
    <div className="relative flex items-center justify-center">
      {/* Arrow pointer at top */}
      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 z-20">
        <div className="w-0 h-0 border-l-[25px] border-l-transparent border-r-[25px] border-r-transparent border-t-[40px] border-t-white drop-shadow-lg"></div>
      </div>

      {/* Wheel container with shadow */}
      <div className="relative">
        <motion.div
          ref={wheelRef}
          className="relative w-[400px] h-[400px] rounded-full shadow-2xl"
          animate={{ rotate: rotation }}
          transition={{
            duration: 4,
            ease: [0.17, 0.67, 0.12, 0.99],
          }}
        >
          {/* SVG for arc segments */}
          <svg className="absolute inset-0 w-full h-full rounded-full border-8 border-white overflow-hidden" viewBox="0 0 200 200">
            <defs>
              {rewards.map((reward, index) => {
                // Extract colors from gradient string
                const gradientMatch = reward.color.match(/#[0-9a-fA-F]{6}/g);
                const startColor = gradientMatch?.[0] || '#ff0000';
                const endColor = gradientMatch?.[1] || '#ff6b6b';
                
                return (
                  <linearGradient key={`gradient-${reward.id}`} id={`gradient-${index}`} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor={startColor} />
                    <stop offset="100%" stopColor={endColor} />
                  </linearGradient>
                );
              })}
            </defs>
            {rewards.map((reward, index) => {
              const startAngle = (index * segmentAngle - 90) * Math.PI / 180;
              const endAngle = ((index + 1) * segmentAngle - 90) * Math.PI / 180;
              
              const x1 = 100 + 100 * Math.cos(startAngle);
              const y1 = 100 + 100 * Math.sin(startAngle);
              const x2 = 100 + 100 * Math.cos(endAngle);
              const y2 = 100 + 100 * Math.sin(endAngle);
              
              const largeArcFlag = segmentAngle > 180 ? 1 : 0;
              
              return (
                <path
                  key={reward.id}
                  d={`M 100 100 L ${x1} ${y1} A 100 100 0 ${largeArcFlag} 1 ${x2} ${y2} Z`}
                  fill={`url(#gradient-${index})`}
                  stroke="white"
                  strokeWidth="2"
                />
              );
            })}
          </svg>
            
          {/* Text layer - separate from segments */}
          <div className="absolute inset-0">
            {rewards.map((reward, index) => {
              return (
                <div
                  key={`text-${reward.id}`}
                  className="absolute inset-0 flex items-center justify-center pointer-events-none"
                  style={{
                    transform: `rotate(${index * segmentAngle + segmentAngle / 2}deg)`,
                    transformOrigin: 'center',
                  }}
                >
                  <div className="absolute top-[20%] left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <div
                      className="text-4xl"
                      style={{ 
                        filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.5))',
                      }}
                    >
                      🧧
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Center button */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 border-4 border-white shadow-xl flex items-center justify-center z-10">
              <span className="text-3xl">🎰</span>
            </div>
          </div>
        </motion.div>

        {/* Decorative outer ring */}
        <div className="absolute inset-0 rounded-full border-4 border-yellow-400 animate-pulse pointer-events-none"></div>
      </div>
    </div>
  );
}

// Helper function to calculate point on circle
function getPoint(angle: number, radius: number): string {
  const radian = (angle * Math.PI) / 180;
  const x = 50 + radius * Math.cos(radian);
  const y = 50 + radius * Math.sin(radian);
  return `${x}% ${y}%`;
}
