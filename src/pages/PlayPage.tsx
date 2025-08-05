import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import type { Room, Player } from '../types/index';

const PlayPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { room, playerId, playerName, isHost, isReconnect } = location.state || {};

  const [currentRoom, setCurrentRoom] = useState<Room | null>(room);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!room || !playerId || !playerName) {
      navigate('/');
      return;
    }

    // 再接続の場合は特別な処理
    if (isReconnect) {
      console.log('Reconnecting to room:', room.id);
      // TODO: WebSocketで再接続処理
    }
  }, [room, playerId, playerName, isHost, isReconnect, navigate]);

  const handleStartGame = () => {
    if (!currentRoom) return;

    // TODO: WebSocketでゲーム開始を通知
    console.log('Starting game for room:', currentRoom.id);
    
    // ゲーム画面に遷移（後で実装）
    // navigate('/game', { state: { room: currentRoom, playerId, playerName, isHost } });
    alert('ゲーム機能は現在開発中です');
  };

  const handleLeaveRoom = () => {
    // TODO: WebSocketでルーム離脱を通知
    console.log('Leaving room:', currentRoom?.id);
    navigate('/');
  };

  const copyRoomId = async () => {
    if (!currentRoom) return;

    try {
      await navigator.clipboard.writeText(currentRoom.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy room ID:', error);
    }
  };

  const getCurrentPlayer = (): Player | undefined => {
    return currentRoom?.players.find(p => p.id === playerId);
  };

  if (!currentRoom || !playerId || !playerName) {
    return null;
  }

  const currentPlayer = getCurrentPlayer();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 to-purple-600 p-4">
      <div className="max-w-4xl mx-auto">
        {/* ヘッダー */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">{currentRoom.name}</h1>
              <p className="text-gray-600">ルームID: {currentRoom.id}</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={copyRoomId}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                {copied ? 'コピー完了!' : 'ルームIDをコピー'}
              </button>
              <button
                onClick={handleLeaveRoom}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                ルームを退出
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* プレイヤーリスト */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">プレイヤー ({currentRoom.players.length}/{currentRoom.maxPlayers})</h2>
              
              <div className="space-y-3">
                {currentRoom.players.map((player) => (
                  <div
                    key={player.id}
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      player.id === playerId ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${
                        player.isConnected ? 'bg-green-500' : 'bg-red-500'
                      }`} />
                      <span className="font-medium">{player.name}</span>
                      {player.isHost && (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                          ホスト
                        </span>
                      )}
                      {player.id === playerId && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                          あなた
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-500">
                      {player.isConnected ? 'オンライン' : 'オフライン'}
                    </div>
                  </div>
                ))}
              </div>

              {/* 空のスロット */}
              {Array.from({ length: currentRoom.maxPlayers - currentRoom.players.length }).map((_, index) => (
                <div
                  key={`empty-${index}`}
                  className="flex items-center p-3 rounded-lg border border-dashed border-gray-300"
                >
                  <div className="w-3 h-3 rounded-full bg-gray-300" />
                  <span className="text-gray-400 ml-3">待機中...</span>
                </div>
              ))}
            </div>
          </div>

          {/* ルーム設定とゲーム開始 */}
          <div className="space-y-6">
            {/* ルーム設定 */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">ルーム設定</h2>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">最大プレイヤー数</label>
                  <p className="text-lg font-semibold">{currentRoom.maxPlayers}人</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">ラウンド数</label>
                  <p className="text-lg font-semibold">{currentRoom.maxRounds}ラウンド</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">制限時間</label>
                  <p className="text-lg font-semibold">{currentRoom.timeLimit}秒</p>
                </div>
              </div>
            </div>

            {/* ゲーム開始ボタン */}
            {isHost && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">ゲーム管理</h2>
                <button
                  onClick={handleStartGame}
                  disabled={currentRoom.players.length < 2}
                  className="w-full bg-green-500 text-white py-3 px-4 rounded-lg hover:bg-green-600 disabled:bg-gray-400 transition-colors font-medium"
                >
                  {currentRoom.players.length < 2 
                    ? 'プレイヤーが不足しています' 
                    : 'ゲームを開始'
                  }
                </button>
                <p className="text-sm text-gray-500 mt-2">
                  最低2人のプレイヤーが必要です
                </p>
              </div>
            )}

            {/* ゲーム説明 */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">ゲームの流れ</h2>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-start space-x-2">
                  <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">1</span>
                  <span>お題を入力</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">2</span>
                  <span>絵を描く</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">3</span>
                  <span>回答を書く</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">4</span>
                  <span>結果を確認</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayPage; 