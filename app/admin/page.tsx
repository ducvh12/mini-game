'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Reward {
  id: string;
  name: string;
  type: string;
  value: string;
  probability: number;
  quantityLimit: number;
  quantityRemaining: number;
  status: string;
  message: string;
}

interface Stats {
  totalSpins: number;
  totalPlayers: number;
  spinsToday: number;
  topRewards: { name: string; count: number }[];
  dailySpins: { date: string; count: number }[];
}

export default function AdminPage() {
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [activeTab, setActiveTab] = useState<'rewards' | 'stats'>('stats');
  const [editingReward, setEditingReward] = useState<Reward | null>(null);
  const [clearing, setClearing] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [resultMessage, setResultMessage] = useState({ type: 'success' as 'success' | 'error', text: '' });

  useEffect(() => {
    const isAuth = sessionStorage.getItem('adminAuth') === 'true';
    if (isAuth) {
      setAuthenticated(true);
      loadData();
    }
  }, []);

  const loadData = async () => {
    try {
      const [rewardsRes, statsRes] = await Promise.all([
        fetch('/api/admin/rewards'),
        fetch('/api/admin/stats'),
      ]);
      const rewardsData = await rewardsRes.json();
      const statsData = await statsRes.json();
      setRewards(rewardsData);
      setStats(statsData);
    } catch (err) {
      console.error('Failed to load data:', err);
    }
  };

  const handleLogin = async () => {
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        setAuthenticated(true);
        sessionStorage.setItem('adminAuth', 'true');
        setError('');
        loadData();
      } else {
        const data = await res.json();
        setError(data.error || 'Mật khẩu không đúng');
      }
    } catch (err) {
      setError('Lỗi kết nối');
    }
  };

  const handleLogout = () => {
    setAuthenticated(false);
    sessionStorage.removeItem('adminAuth');
    setPassword('');
  };

  const handleUpdateReward = async (reward: Reward) => {
    try {
      const res = await fetch('/api/admin/rewards', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reward),
      });

      if (res.ok) {
        loadData();
        setEditingReward(null);
      }
    } catch (err) {
      console.error('Failed to update reward:', err);
    }
  };

  const handleClearSessions = async () => {
    setClearing(true);
    try {
      const res = await fetch('/api/admin/sessions', {
        method: 'DELETE',
      });

      const data = await res.json();

      if (res.ok) {
        setResultMessage({ type: 'success', text: 'Đã xóa tất cả sessions! Trang sẽ tự động tải lại...' });
        setShowResultModal(true);
        loadData();

        // Clear cookies and reload after 2 seconds
        setTimeout(() => {
          document.cookie.split(";").forEach((c) => {
            document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
          });
          window.location.href = '/';
        }, 2000);
      } else {
        console.error('Delete error:', data);
        setResultMessage({ type: 'error', text: data.error || 'Không thể xóa sessions' });
        setShowResultModal(true);
      }
    } catch (err) {
      console.error('Failed to clear sessions:', err);
      setResultMessage({ type: 'error', text: err instanceof Error ? err.message : 'Không thể kết nối' });
      setShowResultModal(true);
    } finally {
      setClearing(false);
      setShowConfirmModal(false);
    }
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl p-8 shadow-2xl max-w-md w-full">
          <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
            🔐 Admin Login
          </h1>
          <input
            type="password"
            placeholder="Nhập mật khẩu..."
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none mb-4"
          />
          {error && (
            <p className="text-red-600 mb-4 text-sm">{error}</p>
          )}
          <button
            onClick={handleLogin}
            className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Đăng nhập
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex justify-between items-center">

            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmModal(true)}
                disabled={clearing}
                className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {clearing ? '⏳ Đang xóa...' : '🗑️ Xóa Sessions'}
              </button>
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Đăng xuất
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('stats')}
              className={`flex-1 py-4 text-lg font-semibold transition-colors ${activeTab === 'stats'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
            >
              📈 Thống kê
            </button>
            <button
              onClick={() => setActiveTab('rewards')}
              className={`flex-1 py-4 text-lg font-semibold transition-colors ${activeTab === 'rewards'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
            >
              🎁 Quản lý phần thưởng
            </button>
          </div>

          <div className="p-6">
            {activeTab === 'stats' && stats && (
              <div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-lg">
                    <h3 className="text-lg opacity-90 mb-2">Tổng lượt quay</h3>
                    <p className="text-4xl font-bold">{stats.totalSpins}</p>
                  </div>
                  <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-xl shadow-lg">
                    <h3 className="text-lg opacity-90 mb-2">Tổng người chơi</h3>
                    <p className="text-4xl font-bold">{stats.totalPlayers}</p>
                  </div>
                  <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-xl shadow-lg">
                    <h3 className="text-lg opacity-90 mb-2">Lượt quay hôm nay</h3>
                    <p className="text-4xl font-bold">{stats.spinsToday}</p>
                  </div>
                </div>

                <div className="bg-gray-50 p-6 rounded-xl mb-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">
                    🏆 Top phần thưởng được trúng
                  </h3>
                  <div className="space-y-3">
                    {stats.topRewards.map((reward, idx) => (
                      <div
                        key={idx}
                        className="flex justify-between items-center bg-white px-4 py-3 rounded-lg shadow"
                      >
                        <span className="font-semibold text-gray-800">
                          {reward.name}
                        </span>
                        <span className="bg-blue-100 text-blue-800 px-4 py-1 rounded-full font-bold">
                          {reward.count} lần
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'rewards' && (
              <div>
                <div className="space-y-4">
                  {rewards.map((reward) => (
                    <div
                      key={reward.id}
                      className="bg-gray-50 p-4 rounded-xl border-2 border-gray-200"
                    >
                      {editingReward?.id === reward.id ? (
                        <div className="space-y-3">
                          <input
                            type="text"
                            value={editingReward.name}
                            onChange={(e) =>
                              setEditingReward({ ...editingReward, name: e.target.value })
                            }
                            className="w-full px-3 py-2 border rounded-lg"
                            placeholder="Tên"
                          />
                          <input
                            type="number"
                            value={editingReward.probability}
                            onChange={(e) =>
                              setEditingReward({
                                ...editingReward,
                                probability: parseFloat(e.target.value),
                              })
                            }
                            className="w-full px-3 py-2 border rounded-lg"
                            placeholder="Xác suất (%)"
                          />
                          <input
                            type="number"
                            value={editingReward.quantityLimit}
                            onChange={(e) =>
                              setEditingReward({
                                ...editingReward,
                                quantityLimit: parseInt(e.target.value),
                              })
                            }
                            className="w-full px-3 py-2 border rounded-lg"
                            placeholder="Giới hạn số lượng"
                          />
                          <input
                            type="number"
                            value={editingReward.quantityRemaining}
                            onChange={(e) =>
                              setEditingReward({
                                ...editingReward,
                                quantityRemaining: parseInt(e.target.value),
                              })
                            }
                            className="w-full px-3 py-2 border rounded-lg"
                            placeholder="Còn lại"
                          />
                          <select
                            value={editingReward.status}
                            onChange={(e) =>
                              setEditingReward({ ...editingReward, status: e.target.value })
                            }
                            className="w-full px-3 py-2 border rounded-lg"
                          >
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                          </select>
                          <textarea
                            value={editingReward.message}
                            onChange={(e) =>
                              setEditingReward({ ...editingReward, message: e.target.value })
                            }
                            className="w-full px-3 py-2 border rounded-lg"
                            rows={2}
                            placeholder="Lời chúc"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleUpdateReward(editingReward)}
                              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                            >
                              Lưu
                            </button>
                            <button
                              onClick={() => setEditingReward(null)}
                              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
                            >
                              Hủy
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h4 className="text-xl font-bold text-gray-800">
                                {reward.name}
                              </h4>
                              <p className="text-gray-600">{reward.message}</p>
                            </div>
                            <button
                              onClick={() => setEditingReward(reward)}
                              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm"
                            >
                              Sửa
                            </button>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                            <div>
                              <span className="text-gray-600">Xác suất:</span>
                              <span className="font-bold ml-2">{reward.probability}%</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Giới hạn:</span>
                              <span className="font-bold ml-2">
                                {reward.quantityLimit === 0 ? 'Không' : reward.quantityLimit}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-600">Còn lại:</span>
                              <span className="font-bold ml-2">{reward.quantityRemaining}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Trạng thái:</span>
                              <span
                                className={`font-bold ml-2 ${reward.status === 'active' ? 'text-green-600' : 'text-red-600'
                                  }`}
                              >
                                {reward.status}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Confirm Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-[scale-in_0.2s_ease-out]">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">⚠️</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Xác nhận xóa</h3>
              <p className="text-gray-600">
                Bạn có chắc chắn muốn xóa tất cả sessions và spin logs?
              </p>

            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleClearSessions}
                disabled={clearing}
                className="flex-1 bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {clearing ? 'Đang xóa...' : 'Xóa ngay'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Result Modal */}
      {showResultModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-[scale-in_0.2s_ease-out]">
            <div className="text-center mb-6">
              <div className={`w-16 h-16 ${resultMessage.type === 'success' ? 'bg-green-100' : 'bg-red-100'} rounded-full flex items-center justify-center mx-auto mb-4`}>
                <span className="text-4xl">{resultMessage.type === 'success' ? '✅' : '❌'}</span>
              </div>
              <h3 className={`text-2xl font-bold mb-2 ${resultMessage.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                {resultMessage.type === 'success' ? 'Thành công!' : 'Lỗi!'}
              </h3>
              <p className="text-gray-600">{resultMessage.text}</p>
            </div>
            <button
              onClick={() => setShowResultModal(false)}
              className={`w-full ${resultMessage.type === 'success' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'} text-white py-3 rounded-lg font-semibold transition-colors`}
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
