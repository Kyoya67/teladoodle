import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { serve } from '@hono/node-server';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { roomService } from './services/roomService.js';
import { websocketService } from './services/websocketService.js';
import type { ApiResponse, RoomResponse, CreateRoomData, JoinRoomData } from './types/index.js';

const app = new Hono();

// ミドルウェア
app.use('*', logger());
app.use('*', cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'https://your-frontend-domain.com'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

// バリデーションスキーマ
const createRoomSchema = z.object({
  playerName: z.string().min(1).max(20),
  roomName: z.string().min(1).max(30),
  maxPlayers: z.number().min(2).max(10),
  maxRounds: z.number().min(1).max(10),
  timeLimit: z.number().min(10).max(300),
});

const joinRoomSchema = z.object({
  playerName: z.string().min(1).max(20),
  roomId: z.string().min(1),
});

// ヘルスチェック
app.get('/', (c) => {
  return c.json({
    message: 'Teladoodle API is running!',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// 統計情報
app.get('/stats', (c) => {
  const roomStats = roomService.getStats();
  const wsStats = websocketService.getStats();
  
  return c.json({
    rooms: roomStats,
    websocket: wsStats,
    timestamp: new Date().toISOString(),
  });
});

// ルーム作成
app.post('/rooms', zValidator('json', createRoomSchema), async (c) => {
  try {
    const data: CreateRoomData = await c.req.json();
    
    const result = roomService.createRoom(data);
    
    const response: ApiResponse<RoomResponse> = {
      success: true,
      data: {
        room: result.room,
        playerId: result.playerId,
        isHost: true,
      },
    };
    
    return c.json(response, 201);
  } catch (error) {
    console.error('Failed to create room:', error);
    const response: ApiResponse = {
      success: false,
      error: 'Failed to create room',
    };
    return c.json(response, 500);
  }
});

// ルーム参加
app.post('/rooms/join', zValidator('json', joinRoomSchema), async (c) => {
  try {
    const data: JoinRoomData = await c.req.json();
    
    const result = roomService.joinRoom(data);
    
    if (!result) {
      const response: ApiResponse = {
        success: false,
        error: 'Room not found or full',
      };
      return c.json(response, 404);
    }
    
    const response: ApiResponse<RoomResponse> = {
      success: true,
      data: {
        room: result.room,
        playerId: result.playerId,
        isHost: false,
      },
    };
    
    return c.json(response);
  } catch (error) {
    console.error('Failed to join room:', error);
    const response: ApiResponse = {
      success: false,
      error: 'Failed to join room',
    };
    return c.json(response, 500);
  }
});

// ルーム情報取得
app.get('/rooms/:roomId', (c) => {
  const roomId = c.req.param('roomId');
  const room = roomService.getRoom(roomId);
  
  if (!room) {
    const response: ApiResponse = {
      success: false,
      error: 'Room not found',
    };
    return c.json(response, 404);
  }
  
  const response: ApiResponse<Room> = {
    success: true,
    data: room,
  };
  
  return c.json(response);
});

// プレイヤー情報取得
app.get('/players/:playerId/room', (c) => {
  const playerId = c.req.param('playerId');
  const room = roomService.getPlayerRoom(playerId);
  
  if (!room) {
    const response: ApiResponse = {
      success: false,
      error: 'Player not in any room',
    };
    return c.json(response, 404);
  }
  
  const player = room.players.find(p => p.id === playerId);
  if (!player) {
    const response: ApiResponse = {
      success: false,
      error: 'Player not found in room',
    };
    return c.json(response, 404);
  }
  
  const response: ApiResponse<RoomResponse> = {
    success: true,
    data: {
      room,
      playerId,
      isHost: player.isHost,
    },
  };
  
  return c.json(response);
});

// ルームから退出
app.delete('/rooms/:roomId/players/:playerId', (c) => {
  const playerId = c.req.param('playerId');
  const room = roomService.removePlayer(playerId);
  
  const response: ApiResponse = {
    success: true,
    data: { room },
  };
  
  return c.json(response);
});

// ゲーム開始
app.post('/rooms/:roomId/start', (c) => {
  const roomId = c.req.param('roomId');
  const success = roomService.startGame(roomId);
  
  if (!success) {
    const response: ApiResponse = {
      success: false,
      error: 'Failed to start game',
    };
    return c.json(response, 400);
  }
  
  const room = roomService.getRoom(roomId);
  const response: ApiResponse<Room> = {
    success: true,
    data: room!,
  };
  
  return c.json(response);
});

// エラーハンドリング
app.onError((err, c) => {
  console.error('Application error:', err);
  return c.json({
    success: false,
    error: 'Internal server error',
  }, 500);
});

// 404ハンドリング
app.notFound((c) => {
  return c.json({
    success: false,
    error: 'Not found',
  }, 404);
});

// サーバー起動
const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;

console.log(`🚀 Teladoodle API server starting on port ${port}`);

const server = serve({
  fetch: app.fetch,
  port,
});

// WebSocketサーバーの初期化
websocketService.initialize(server);

// 定期的なクリーンアップ
setInterval(() => {
  roomService.cleanupOldRooms();
}, 5 * 60 * 1000); // 5分ごと

console.log(`✅ Server is running on http://localhost:${port}`);
console.log(`📊 Stats endpoint: http://localhost:${port}/stats`); 