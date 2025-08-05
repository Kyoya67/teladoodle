import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { generateRoomId, generatePlayerId, saveSession } from '../utils/session';
import type { Room, Player } from '../types/index';

const CreateRoomPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const playerName = location.state?.playerName || '';

  const [roomName, setRoomName] = useState('');
  const [maxPlayers, setMaxPlayers] = useState(6);
  const [maxRounds, setMaxRounds] = useState(3);
  const [timeLimit, setTimeLimit] = useState(60);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (!playerName) {
      navigate('/');
      return;
    }
    // デフォルトルーム名を設定
    setRoomName(`${playerName}のルーム`);
  }, [playerName, navigate]);

  const handleCreateRoom = async () => {
    if (!roomName.trim()) {
      alert('ルーム名を入力してください');
      return;
    }

    setIsCreating(true);

    try {
      const roomId = generateRoomId();
      const playerId = generatePlayerId();

      // ホストプレイヤーを作成
      const hostPlayer: Player = {
        id: playerId,
        name: playerName,
        isHost: true,
        isConnected: true,
      };

      // ルーム情報を作成
      const room: Room = {
        id: roomId,
        name: roomName,
        players: [hostPlayer],
        maxPlayers,
        status: 'waiting',
        currentRound: 0,
        maxRounds,
        currentPlayerIndex: 0,
        timeLimit,
      };

      // セッション情報を保存
      saveSession({
        playerId,
        playerName,
        roomId,
        lastConnected: new Date(),
      });

      // TODO: 実際の実装ではWebSocketでルームを作成
      console.log('Creating room:', room);

      // プレイ画面に遷移
      navigate('/play', { 
        state: { 
          room, 
          playerId, 
          playerName,
          isHost: true 
        } 
      });

    } catch (error) {
      console.error('Failed to create room:', error);
      alert('ルームの作成に失敗しました');
    } finally {
      setIsCreating(false);
    }
  };

  const handleBack = () => {
    navigate('/');
  };

  if (!playerName) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">ルームを作成</h1>
          <p className="text-gray-600">プレイヤー: {playerName}</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ルーム名
            </label>
            <input
              type="text"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              placeholder="ルーム名を入力"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              maxLength={30}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              最大プレイヤー数
            </label>
            <select
              value={maxPlayers}
              onChange={(e) => setMaxPlayers(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={4}>4人</option>
              <option value={6}>6人</option>
              <option value={8}>8人</option>
              <option value={10}>10人</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ラウンド数
            </label>
            <select
              value={maxRounds}
              onChange={(e) => setMaxRounds(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={2}>2ラウンド</option>
              <option value={3}>3ラウンド</option>
              <option value={5}>5ラウンド</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              制限時間（秒）
            </label>
            <select
              value={timeLimit}
              onChange={(e) => setTimeLimit(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={30}>30秒</option>
              <option value={60}>60秒</option>
              <option value={90}>90秒</option>
              <option value={120}>120秒</option>
            </select>
          </div>

          <div className="space-y-3 pt-4">
            <button
              onClick={handleCreateRoom}
              disabled={isCreating}
              className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 disabled:bg-gray-400 transition-colors font-medium"
            >
              {isCreating ? '作成中...' : 'ルームを作成'}
            </button>
            
            <button
              onClick={handleBack}
              className="w-full bg-gray-500 text-white py-3 px-4 rounded-lg hover:bg-gray-600 transition-colors font-medium"
            >
              戻る
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateRoomPage; 