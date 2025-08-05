// ===== 共通ユーティリティ関数 =====

// プレイヤーIDを生成
export const generatePlayerId = (): string => {
  return `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// ルームIDを生成
export const generateRoomId = (): string => {
  return `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// 日付の比較（再接続判定用）
export const isWithinReconnectTimeout = (lastConnected: Date, timeoutMs: number = 30 * 1000): boolean => {
  const timeSinceLastConnection = Date.now() - lastConnected.getTime();
  return timeSinceLastConnection < timeoutMs;
};

// 配列をシャッフル
export const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// ランダムな色を生成
export const generateRandomColor = (): string => {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

// 時間をフォーマット（秒 → MM:SS）
export const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

// 文字列を安全に切り詰める
export const truncateString = (str: string, maxLength: number): string => {
  if (str.length <= maxLength) return str;
  return str.substring(0, maxLength) + '...';
};

// バリデーション関数
export const validatePlayerName = (name: string): boolean => {
  return name.trim().length >= 1 && name.trim().length <= 20;
};

export const validateRoomName = (name: string): boolean => {
  return name.trim().length >= 1 && name.trim().length <= 30;
};

export const validateRoomId = (roomId: string): boolean => {
  return roomId.trim().length >= 1;
}; 