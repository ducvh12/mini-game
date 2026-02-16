'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import Cookies from 'js-cookie';
import { GiPartyPopper } from 'react-icons/gi';
import WheelSpinner from '@/components/WheelSpinner';

interface Reward {
  name: string;
  type: string;
  value: string;
  message: string;
}

interface WheelReward {
  id: string;
  name: string;
  type: string;
  probability: number;
  color: string;
}

interface RecentSpin {
  playerName: string;
  rewardName: string;
  createdAt: string;
}

export default function Home() {
  const [stage, setStage] = useState<'landing' | 'spinning' | 'reveal' | 'result'>('landing');
  const [playerName, setPlayerName] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [spinning, setSpinning] = useState(false);
  const [reward, setReward] = useState<Reward | null>(null);
  const [hasSpun, setHasSpun] = useState(false);
  const [error, setError] = useState('');
  const [recentSpins, setRecentSpins] = useState<RecentSpin[]>([]);
  const [wheelRewards, setWheelRewards] = useState<WheelReward[]>([]);
  const [selectedRewardIndex, setSelectedRewardIndex] = useState<number>(-1);
  const [isOpeningEnvelope, setIsOpeningEnvelope] = useState(false);

  // Định nghĩa màu sắc cho các phần thưởng - Chủ đề Tết
  const rewardColors = [
    'linear-gradient(135deg, #ff0000 0%, #ff6b6b 100%)', // Đỏ
    'linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)', // Vàng
    'linear-gradient(135deg, #ff4500 0%, #ff8c00 100%)', // Cam đậm
    'linear-gradient(135deg, #dc143c 0%, #ff69b4 100%)', // Đỏ hồng
    'linear-gradient(135deg, #ff6347 0%, #ffa07a 100%)', // Cam nhạt
    'linear-gradient(135deg, #b22222 0%, #ff4040 100%)', // Đỏ sẫm
    'linear-gradient(135deg, #ffb347 0%, #ffcc33 100%)', // Vàng cam
    'linear-gradient(135deg, #ff1493 0%, #ff69b4 100%)', // Hồng
    'linear-gradient(135deg, #cd5c5c 0%, #f08080 100%)', // Đỏ pastel
  ];

  useEffect(() => {
    fetchWheelRewards();
  }, []);

  useEffect(() => {
    const savedSessionId = Cookies.get('sessionId');
    const savedPlayerName = Cookies.get('playerName');

    if (savedSessionId && savedPlayerName) {
      setSessionId(savedSessionId);
      setPlayerName(savedPlayerName);
      setStage('spinning');
      fetchSessionInfo(savedSessionId);
    }

    fetchRecentSpins();
  }, []);

  const fetchWheelRewards = async () => {
    try {
      const res = await fetch('/api/admin/rewards');
      const data = await res.json();
      
      const activeRewards = data
        .filter((r: any) => r.status === 'active' && r.probability > 0)
        .map((r: any, idx: number) => ({
          id: r.id,
          name: r.name,
          type: r.type,
          probability: r.probability,
          color: rewardColors[idx % rewardColors.length],
        }));
      
      setWheelRewards(activeRewards);
    } catch (err) {
      console.error('Failed to fetch rewards:', err);
    }
  };

  const fetchRecentSpins = async () => {
    try {
      const res = await fetch('/api/recent-spins');
      const data = await res.json();
      setRecentSpins(data);
    } catch (err) {
      console.error('Failed to fetch recent spins:', err);
    }
  };

  const fetchSessionInfo = async (id: string) => {
    try {
      const res = await fetch(`/api/session?sessionId=${id}`);
      const data = await res.json();
      setHasSpun(data.spinsUsedToday > 0);
    } catch (err) {
      console.error('Failed to fetch session info:', err);
    }
  };

  const handleJoin = async () => {
    if (!playerName.trim()) {
      setError('Vui lòng nhập tên của bạn');
      return;
    }

    if (playerName.length > 30) {
      setError('Tên không được quá 30 ký tự');
      return;
    }

    try {
      const res = await fetch('/api/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerName: playerName.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error);
        return;
      }

      setSessionId(data.sessionId);
      Cookies.set('sessionId', data.sessionId, { expires: 30 / 86400 }); // 30 seconds
      Cookies.set('playerName', data.playerName, { expires: 30 / 86400 }); // 30 seconds
      setError('');
      setStage('spinning');
    } catch (err) {
      setError('Có lỗi xảy ra, vui lòng thử lại');
    }
  };

  const handleSpin = async () => {
    if (spinning) return;

    setSpinning(true);
    setError('');

    try {
      const res = await fetch('/api/spin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error);
        setSpinning(false);
        return;
      }

      setReward(data.reward);
      setHasSpun(true);
    } catch (err) {
      setError('Có lỗi xảy ra, vui lòng thử lại');
      setSpinning(false);
    }
  };

  const handleSpinComplete = (rewardIndex: number) => {
    setSelectedRewardIndex(rewardIndex);
    
    setTimeout(() => {
      setStage('reveal');
      setSpinning(false);
    }, 500);
  };

  const handleOpenEnvelope = () => {
    setIsOpeningEnvelope(true);
    
    // Confetti explosion with red and gold colors
    const duration = 2000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.4, 0.6), y: randomInRange(0.4, 0.6) },
        colors: ['#FFD700', '#FF0000', '#FFA500', '#FFFF00', '#FF6347'],
      });
    }, 250);

    // Show result after animation
    setTimeout(() => {
      setStage('result');
      setIsOpeningEnvelope(false);
      
      if (reward && reward.type === 'money' && parseInt(reward.value) >= 20000) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      }

      fetchRecentSpins();
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-600 via-red-500 to-yellow-500 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 text-7xl animate-float opacity-80">🏮</div>
        <div className="absolute top-20 right-20 text-7xl animate-float opacity-80" style={{ animationDelay: '1s' }}>🧧</div>
        <div className="absolute bottom-20 left-20 text-7xl animate-float opacity-80" style={{ animationDelay: '2s' }}>🎋</div>
        <div className="absolute bottom-10 right-10 text-7xl animate-float opacity-80" style={{ animationDelay: '1.5s' }}>🌸</div>
        <div className="absolute top-1/3 left-1/4 text-6xl animate-float opacity-60" style={{ animationDelay: '0.5s' }}>✨</div>
        <div className="absolute top-2/3 right-1/4 text-6xl animate-float opacity-60" style={{ animationDelay: '2.5s' }}>🎊</div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-6xl">
        <AnimatePresence mode="wait">
          {stage === 'landing' && (
            <motion.div
              key="landing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center justify-center min-h-[80vh]"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', duration: 0.8 }}
                className="text-center"
              >
                <motion.h1 
                  className="text-4xl md:text-9xl font-bold text-yellow-300 mb-6 text-shadow drop-shadow-2xl"
                  animate={{ 
                    textShadow: [
                      '0 0 20px rgba(255,215,0,0.5)',
                      '0 0 40px rgba(255,215,0,0.8)',
                      '0 0 20px rgba(255,215,0,0.5)',
                    ]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  🧧 QUAY LÌ XÌ 🧧
                </motion.h1>
                <p className="text-3xl md:text-4xl text-white mb-12 text-shadow font-bold">
                  Chúc Mừng Năm Mới 2026 🎊
                </p>
                <motion.div 
                  className="bg-white/95 backdrop-blur-md rounded-3xl p-10 shadow-2xl max-w-md mx-auto border-4 border-yellow-400"
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <div className="text-5xl mb-6">🎁</div>
                  <input
                    type="text"
                    placeholder="Nhập tên của bạn..."
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleJoin()}
                    className="w-full px-6 py-5 text-xl rounded-2xl border-3 border-yellow-400 focus:border-red-500 focus:outline-none focus:ring-4 focus:ring-red-300 mb-6 text-center font-semibold"
                    maxLength={30}
                  />
                  {error && (
                    <motion.p 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-red-600 mb-4 text-sm font-semibold bg-red-50 py-2 px-4 rounded-lg"
                    >
                      {error}
                    </motion.p>
                  )}
                  <motion.button
                    onClick={handleJoin}
                    className="w-full bg-gradient-to-r from-red-600 via-red-500 to-red-600 text-white text-2xl font-bold py-5 rounded-2xl shadow-xl transition-all relative overflow-hidden group"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span className="relative z-10">🎉 THAM GIA QUAY 🎉</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-red-700 via-red-600 to-red-700 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </motion.button>
                </motion.div>
              </motion.div>
            </motion.div>
          )}

          {stage === 'spinning' && (
            <motion.div
              key="spinning"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center min-h-[80vh]"
            >
              <motion.div
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="text-center mb-8 bg-white/20 backdrop-blur-md rounded-3xl px-12 py-6 border-2 border-white/30"
              >
                <h3 className="text-3xl font-bold text-yellow-300 text-shadow drop-shadow-lg">
                  Chúc mừng năm mới, {playerName}! 👋
                </h3>
              </motion.div>

              {wheelRewards.length > 0 && (
                <motion.div 
                  className="mb-8"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <WheelSpinner
                    rewards={wheelRewards}
                    spinning={spinning}
                    onSpinComplete={handleSpinComplete}
                  />
                </motion.div>
              )}

              {error && (
                <motion.p 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-white bg-red-600/90 backdrop-blur-sm px-8 py-4 rounded-2xl mb-6 text-xl font-semibold shadow-lg border-2 border-red-400"
                >
                  ⚠️ {error}
                </motion.p>
              )}

              <motion.button
                onClick={handleSpin}
                disabled={spinning || hasSpun}
                className={`bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-400 text-red-600 text-3xl font-bold py-8 px-16 rounded-3xl shadow-2xl transform transition-all border-4 border-yellow-500 relative overflow-hidden ${
                  spinning || hasSpun
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:scale-110 hover:shadow-3xl active:scale-95'
                }`}
                whileHover={spinning || hasSpun ? {} : { y: -5 }}
                whileTap={spinning || hasSpun ? {} : { scale: 0.95 }}
              >
                {spinning ? (
                  <span className="flex items-center gap-3">
                    <span className="animate-spin"></span> ĐANG QUAY...
                  </span>
                ) : hasSpun ? (
                  'ĐÃ QUAY RỒI'
                ) : (
                  <span className="flex items-center gap-2">
                    QUAY NGAY!
                  </span>
                )}
              </motion.button>
            </motion.div>
          )}

          {stage === 'reveal' && reward && (
            <motion.div
              key="reveal"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              className="flex flex-col items-center justify-center min-h-[80vh]"
            >
              <motion.div className="text-center relative">
                {/* Envelope Animation */}
                <motion.div
                  whileHover={{ scale: 1.05, rotate: [0, -3, 3, -3, 0] }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleOpenEnvelope}
                  className="cursor-pointer mb-8 relative"
                  animate={isOpeningEnvelope ? { 
                    scale: [1, 1.5, 2, 0],
                    rotate: [0, 10, -10, 720],
                    opacity: [1, 1, 1, 0],
                  } : { 
                    y: [0, -15, 0],
                    rotate: [0, 5, -5, 0],
                  }}
                  transition={isOpeningEnvelope ? { 
                    duration: 1.5,
                    ease: "easeInOut" 
                  } : { 
                    duration: 2, 
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <div className="text-9xl drop-shadow-2xl filter hover:brightness-110 transition-all relative">
                    🧧
                    {!isOpeningEnvelope && (
                      <motion.div
                        className="absolute inset-0 rounded-full"
                        animate={{
                          boxShadow: [
                            '0 0 20px rgba(255, 215, 0, 0.5)',
                            '0 0 40px rgba(255, 215, 0, 0.8)',
                            '0 0 60px rgba(255, 215, 0, 1)',
                            '0 0 40px rgba(255, 215, 0, 0.8)',
                            '0 0 20px rgba(255, 215, 0, 0.5)',
                          ],
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                    )}
                  </div>
                </motion.div>

                {!isOpeningEnvelope && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white/95 backdrop-blur-md rounded-3xl p-8 shadow-2xl border-4 border-red-400 max-w-md"
                  >
                    <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-orange-600 mb-4">
                      🎊 Chúc mừng {playerName}! 🎊
                    </h2>
                    <p className="text-xl text-gray-700 mb-6">
                      Bạn đã nhận được một lì xì may mắn!
                    </p>
                    <motion.button
                      onClick={handleOpenEnvelope}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      animate={{ 
                        boxShadow: [
                          '0 0 20px rgba(239, 68, 68, 0.5)',
                          '0 0 40px rgba(239, 68, 68, 0.8)',
                          '0 0 20px rgba(239, 68, 68, 0.5)',
                        ],
                      }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="bg-gradient-to-r from-red-500 to-orange-500 text-white text-2xl font-bold py-4 px-12 rounded-full shadow-xl border-4 border-yellow-400 hover:from-red-600 hover:to-orange-600 transition-all"
                    >
                      MỞ LÌ XÌ
                    </motion.button>
                  </motion.div>
                )}
              </motion.div>
            </motion.div>
          )}

          {stage === 'result' && reward && (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex flex-col items-center justify-center min-h-[80vh]"
            >
              <motion.div
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, type: 'spring' }}
                className="text-center mb-12 bg-white/95 backdrop-blur-md rounded-3xl p-12 shadow-2xl border-4 border-yellow-400 max-w-2xl"
              >
                <motion.div
                  animate={{ 
                    rotate: [0, 10, -10, 10, 0],
                    scale: [1, 1.1, 1.1, 1.1, 1]
                  }}
                  transition={{ duration: 0.5, repeat: 3 }}
                >
                  <GiPartyPopper className="text-yellow-500 text-9xl mx-auto mb-6 drop-shadow-xl" />
                </motion.div>
                
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5, type: 'spring' }}
                  className="bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl p-6 mb-6 border-4 border-yellow-400"
                >
                  {reward.type === 'money' && (
                    <motion.p 
                      className="text-8xl font-bold text-yellow-300 mb-2 drop-shadow-lg"
                      animate={{ 
                        scale: [1, 1.1, 1],
                      }}
                      transition={{ duration: 1, repeat: Infinity }}
                    >
                      {parseInt(reward.value).toLocaleString('vi-VN')}
                    </motion.p>
                  )}
                </motion.div>
                
                <motion.p 
                  className="text-2xl text-gray-700 font-semibold px-6 leading-relaxed"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                >
                  {reward.message}
                </motion.p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, type: 'spring' }}
                className="bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 text-white text-2xl font-bold py-5 px-1 rounded-2xl shadow-2xl border-4 border-purple-600"
              >
                ✨ Cảm ơn bạn đã tham gia!
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {recentSpins.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-12 bg-gradient-to-br from-white/95 to-yellow-50/95 backdrop-blur-md rounded-3xl p-8 shadow-2xl border-4 border-yellow-400 max-w-2xl mx-auto"
          >
            <motion.h3 
              className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-orange-600 mb-6 text-center flex items-center justify-center gap-3"
              animate={{ 
                scale: [1, 1.05, 1],
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              🏆 BẢNG VÀNG MAY MẮN 🏆
            </motion.h3>
            <div className="space-y-3">
              {recentSpins.map((spin, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="flex items-center justify-between bg-gradient-to-r from-yellow-100 via-orange-50 to-yellow-100 px-6 py-4 rounded-2xl shadow-md border-2 border-yellow-300 hover:shadow-lg transition-all hover:scale-102"
                >
                  <span className="font-bold text-gray-800 text-lg flex items-center gap-2">
                    <span className="text-2xl">{idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : '🎖️'}</span>
                    {spin.playerName}
                  </span>
                  <span className="text-red-600 font-bold text-lg bg-white/50 px-4 py-2 rounded-lg">
                    {spin.rewardName}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
