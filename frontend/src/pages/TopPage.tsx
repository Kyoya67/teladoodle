import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSession, canReconnect } from '../utils/session';

const TopPage: React.FC = () => {
  const navigate = useNavigate();
  const [playerName, setPlayerName] = useState('');
  const [roomId, setRoomId] = useState('');
  const [canReconnectSession, setCanReconnectSession] = useState(false);

  useEffect(() => {
    // セッション復帰可能かチェック
    const session = getSession();
    if (session && canReconnect()) {
      setPlayerName(session.playerName);
      setRoomId(session.roomId || '');
      setCanReconnectSession(true);
    }
  }, []);

  const handleCreateRoom = () => {
    if (!playerName.trim()) {
      alert('プレイヤー名を入力してください');
      return;
    }
    navigate('/create-room', { state: { playerName } });
  };

  const handleJoinRoom = () => {
    if (!playerName.trim() || !roomId.trim()) {
      alert('プレイヤー名とルームIDを入力してください');
      return;
    }
    navigate('/join-room', { state: { playerName, roomId } });
  };

  const handleReconnect = () => {
    if (canReconnectSession && roomId) {
      navigate('/play', { state: { playerName, roomId, isReconnect: true } });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Teladoodle</h1>
          <p className="text-gray-600">お絵描き伝言ゲーム</p>
        </div>

        {canReconnectSession && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800 text-sm mb-2">
              前回のセッションを復帰できます
            </p>
            <button
              onClick={handleReconnect}
              className="w-full bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 transition-colors"
            >
              セッションを復帰
            </button>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              プレイヤー名
            </label>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="あなたの名前"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              maxLength={20}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ルームID（参加時のみ）
            </label>
            <input
              type="text"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              placeholder="ルームIDを入力"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-3 pt-4">
            <button
              onClick={handleCreateRoom}
              className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 transition-colors font-medium"
            >
              新しいルームを作成
            </button>
            
            <button
              onClick={handleJoinRoom}
              className="w-full bg-green-500 text-white py-3 px-4 rounded-lg hover:bg-green-600 transition-colors font-medium"
            >
              ルームに参加
            </button>
          </div>
        </div>

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>スマホでも快適に遊べるお絵描き伝言ゲーム</p>
        </div>
      </div>
    </div>
  );
};

export default TopPage; 