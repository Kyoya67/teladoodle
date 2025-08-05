// ===== 共通型定義 =====

// プレイヤー情報
export interface Player {
  id: string;
  name: string;
  isHost: boolean;
  isConnected: boolean;
  lastSeen?: Date;
}

// ルーム情報
export interface Room {
  id: string;
  name: string;
  players: Player[];
  maxPlayers: number;
  status: 'waiting' | 'playing' | 'finished';
  currentRound: number;
  maxRounds: number;
  currentPlayerIndex: number;
  timeLimit: number; // 秒
}

// ゲーム進行状態
export interface GameState {
  phase: 'input' | 'drawing' | 'answering' | 'result';
  currentPrompt?: string;
  currentDrawing?: string; // base64 encoded canvas data
  currentAnswer?: string;
  roundHistory: RoundHistory[];
  timeRemaining: number;
}

// ラウンド履歴
export interface RoundHistory {
  round: number;
  prompt: string;
  drawings: { playerId: string; drawing: string }[];
  answers: { playerId: string; answer: string }[];
}

// 描画ツール設定
export interface DrawingTool {
  type: 'pen' | 'eraser';
  color: string;
  size: number;
}

// ===== フロントエンド専用型定義 =====

// セッション情報（localStorage用）
export interface SessionInfo {
  playerId: string;
  playerName: string;
  roomId?: string;
  lastConnected: Date;
}

// ===== バックエンド専用型定義 =====

// WebSocket関連の型定義
export interface WebSocketMessage {
  type: 'join' | 'leave' | 'start_game' | 'submit_prompt' | 'submit_drawing' | 'submit_answer' | 'ping' | 'pong';
  data?: any;
  playerId?: string;
  roomId?: string;
}

export interface JoinRoomData {
  playerName: string;
  roomId: string;
}

export interface CreateRoomData {
  playerName: string;
  roomName: string;
  maxPlayers: number;
  maxRounds: number;
  timeLimit: number;
}

// APIレスポンスの型定義
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface RoomResponse {
  room: Room;
  playerId: string;
  isHost: boolean;
} 