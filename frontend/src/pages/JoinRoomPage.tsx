import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { saveSession } from '../utils/session';
import { generatePlayerId } from '../../../shared/index.js';
import type { Room, Player } from '../types/index';

const JoinRoomPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { playerName, roomId: initialRoomId } = location.state || {};

  const [roomId, setRoomId] = useState(initialRoomId || '');
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!playerName) {
      navigate('/');
      return;
    }
  }, [playerName, navigate]);

  const handleJoinRoom = async () => {
    if (!roomId.trim()) {
      setError('ルームIDを入力してください');
      return;
    }

    setIsJoining(true);
    setError('');

    try {
      const playerId = generatePlayerId();

      // TODO: 実際の実装ではWebSocketでルームに参加
      // ここではモックのルーム情報を作成
      const mockRoom: Room = {
        id: roomId,
        name: `ルーム ${roomId}`,
        players: [
          {
            id: 'host_player',
            name: 'ホスト',
            isHost: true,
            isConnected: true,
          },
          {
            id: playerId,
            name: playerName,
            isHost: false,
            isConnected: true,
          }
        ],
        maxPlayers: 6,
        status: 'waiting',
        currentRound: 0,
        maxRounds: 3,
        currentPlayerIndex: 0,
        timeLimit: 60,
      };

      // セッション情報を保存
      saveSession({
        playerId,
        playerName,
        roomId,
        lastConnected: new Date(),
      });

      console.log('Joining room:', mockRoom);

      // プレイ画面に遷移
      navigate('/play', { 
        state: { 
          room: mockRoom, 
          playerId, 
          playerName,
          isHost: false 
        } 
      });

    } catch (error) {
      console.error('Failed to join room:', error);
      setError('ルームへの参加に失敗しました');
    } finally {
      setIsJoining(false);
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
          <h1 className="text-2xl font-bold text-gray-800 mb-2">ルームに参加</h1>
          <p className="text-gray-600">プレイヤー: {playerName}</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ルームID
            </label>
            <input
              type="text"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              placeholder="ルームIDを入力"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          <div className="space-y-3 pt-4">
            <button
              onClick={handleJoinRoom}
              disabled={isJoining}
              className="w-full bg-green-500 text-white py-3 px-4 rounded-lg hover:bg-green-600 disabled:bg-gray-400 transition-colors font-medium"
            >
              {isJoining ? '参加中...' : 'ルームに参加'}
            </button>
            
            <button
              onClick={handleBack}
              className="w-full bg-gray-500 text-white py-3 px-4 rounded-lg hover:bg-gray-600 transition-colors font-medium"
            >
              戻る
            </button>
          </div>
        </div>

        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="text-sm font-medium text-blue-800 mb-2">参加方法</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• ホストからルームIDを教えてもらってください</li>
            <li>• ルームIDを入力して「ルームに参加」を押してください</li>
            <li>• ホストがゲームを開始するまでお待ちください</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default JoinRoomPage; 