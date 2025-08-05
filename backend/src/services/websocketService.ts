import { WebSocket, WebSocketServer } from 'ws';
import { WebSocketMessage } from '../types/index.js';
import { roomService } from './roomService.js';

interface ConnectedClient {
  ws: WebSocket;
  playerId?: string;
  roomId?: string;
}

class WebSocketService {
  private wss: WebSocketServer | null = null;
  private clients: Map<WebSocket, ConnectedClient> = new Map();

  initialize(server: any) {
    this.wss = new WebSocketServer({ server });

    this.wss.on('connection', (ws: WebSocket) => {
      console.log('New WebSocket connection');
      
      this.clients.set(ws, { ws });

      ws.on('message', (data: Buffer) => {
        try {
          const message: WebSocketMessage = JSON.parse(data.toString());
          this.handleMessage(ws, message);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
          this.sendError(ws, 'Invalid message format');
        }
      });

      ws.on('close', () => {
        this.handleDisconnect(ws);
      });

      ws.on('error', (error) => {
        console.error('WebSocket error:', error);
        this.handleDisconnect(ws);
      });

      // 接続確認
      this.send(ws, { type: 'pong' });
    });
  }

  private handleMessage(ws: WebSocket, message: WebSocketMessage) {
    const client = this.clients.get(ws);
    if (!client) return;

    switch (message.type) {
      case 'join':
        this.handleJoin(ws, message);
        break;
      case 'leave':
        this.handleLeave(ws, message);
        break;
      case 'start_game':
        this.handleStartGame(ws, message);
        break;
      case 'submit_prompt':
        this.handleSubmitPrompt(ws, message);
        break;
      case 'submit_drawing':
        this.handleSubmitDrawing(ws, message);
        break;
      case 'submit_answer':
        this.handleSubmitAnswer(ws, message);
        break;
      case 'ping':
        this.send(ws, { type: 'pong' });
        break;
      default:
        this.sendError(ws, `Unknown message type: ${message.type}`);
    }
  }

  private handleJoin(ws: WebSocket, message: WebSocketMessage) {
    const client = this.clients.get(ws);
    if (!client) return;

    const { playerName, roomId } = message.data;
    if (!playerName || !roomId) {
      this.sendError(ws, 'Missing playerName or roomId');
      return;
    }

    const result = roomService.joinRoom({ playerName, roomId });
    if (!result) {
      this.sendError(ws, 'Failed to join room');
      return;
    }

    client.playerId = result.playerId;
    client.roomId = roomId;

    // ルーム内の全員に通知
    this.broadcastToRoom(roomId, {
      type: 'player_joined',
      data: {
        player: result.room.players.find(p => p.id === result.playerId),
        room: result.room
      }
    });

    // 参加者に確認メッセージ
    this.send(ws, {
      type: 'join_success',
      data: {
        room: result.room,
        playerId: result.playerId
      }
    });
  }

  private handleLeave(ws: WebSocket, message: WebSocketMessage) {
    const client = this.clients.get(ws);
    if (!client || !client.playerId) return;

    const room = roomService.removePlayer(client.playerId);
    if (room) {
      // ルーム内の全員に通知
      this.broadcastToRoom(room.id, {
        type: 'player_left',
        data: {
          playerId: client.playerId,
          room: room
        }
      });
    }

    client.playerId = undefined;
    client.roomId = undefined;
  }

  private handleStartGame(ws: WebSocket, message: WebSocketMessage) {
    const client = this.clients.get(ws);
    if (!client || !client.roomId) return;

    const room = roomService.getRoom(client.roomId);
    if (!room) {
      this.sendError(ws, 'Room not found');
      return;
    }

    const player = room.players.find(p => p.id === client.playerId);
    if (!player || !player.isHost) {
      this.sendError(ws, 'Only host can start the game');
      return;
    }

    const success = roomService.startGame(client.roomId);
    if (!success) {
      this.sendError(ws, 'Failed to start game');
      return;
    }

    const updatedRoom = roomService.getRoom(client.roomId);
    if (updatedRoom) {
      this.broadcastToRoom(client.roomId, {
        type: 'game_started',
        data: { room: updatedRoom }
      });
    }
  }

  private handleSubmitPrompt(ws: WebSocket, message: WebSocketMessage) {
    // TODO: ゲーム進行ロジックを実装
    console.log('Submit prompt:', message.data);
  }

  private handleSubmitDrawing(ws: WebSocket, message: WebSocketMessage) {
    // TODO: ゲーム進行ロジックを実装
    console.log('Submit drawing:', message.data);
  }

  private handleSubmitAnswer(ws: WebSocket, message: WebSocketMessage) {
    // TODO: ゲーム進行ロジックを実装
    console.log('Submit answer:', message.data);
  }

  private handleDisconnect(ws: WebSocket) {
    const client = this.clients.get(ws);
    if (client && client.playerId) {
      const room = roomService.updatePlayerConnection(client.playerId, false);
      if (room) {
        this.broadcastToRoom(room.id, {
          type: 'player_disconnected',
          data: {
            playerId: client.playerId,
            room: room
          }
        });
      }
    }

    this.clients.delete(ws);
    console.log('WebSocket disconnected');
  }

  private broadcastToRoom(roomId: string, message: any) {
    for (const [ws, client] of this.clients.entries()) {
      if (client.roomId === roomId && ws.readyState === WebSocket.OPEN) {
        this.send(ws, message);
      }
    }
  }

  private send(ws: WebSocket, message: any) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  }

  private sendError(ws: WebSocket, error: string) {
    this.send(ws, {
      type: 'error',
      data: { message: error }
    });
  }

  // 統計情報を取得
  getStats() {
    return {
      totalConnections: this.clients.size,
      activeConnections: Array.from(this.clients.values()).filter(c => c.ws.readyState === WebSocket.OPEN).length,
    };
  }
}

export const websocketService = new WebSocketService(); 