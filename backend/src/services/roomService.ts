import { Room, Player, CreateRoomData, JoinRoomData, generatePlayerId, generateRoomId } from '../../../shared/index.js';

class RoomService {
  private rooms: Map<string, Room> = new Map();
  private playerRooms: Map<string, string> = new Map(); // playerId -> roomId

  // ルームを作成
  createRoom(data: CreateRoomData): { room: Room; playerId: string } {
    const playerId = generatePlayerId();
    const roomId = generateRoomId();

    const hostPlayer: Player = {
      id: playerId,
      name: data.playerName,
      isHost: true,
      isConnected: true,
    };

    const room: Room = {
      id: roomId,
      name: data.roomName,
      players: [hostPlayer],
      maxPlayers: data.maxPlayers,
      status: 'waiting',
      currentRound: 0,
      maxRounds: data.maxRounds,
      currentPlayerIndex: 0,
      timeLimit: data.timeLimit,
    };

    this.rooms.set(roomId, room);
    this.playerRooms.set(playerId, roomId);

    console.log(`Room created: ${roomId} by ${data.playerName}`);
    return { room, playerId };
  }

  // ルームに参加
  joinRoom(data: JoinRoomData): { room: Room; playerId: string } | null {
    const room = this.rooms.get(data.roomId);
    if (!room) {
      return null;
    }

    if (room.players.length >= room.maxPlayers) {
      return null;
    }

    if (room.status !== 'waiting') {
      return null;
    }

    const playerId = generatePlayerId();
    const newPlayer: Player = {
      id: playerId,
      name: data.playerName,
      isHost: false,
      isConnected: true,
    };

    room.players.push(newPlayer);
    this.playerRooms.set(playerId, data.roomId);

    console.log(`${data.playerName} joined room: ${data.roomId}`);
    return { room, playerId };
  }

  // ルームを取得
  getRoom(roomId: string): Room | null {
    return this.rooms.get(roomId) || null;
  }

  // プレイヤーが参加しているルームを取得
  getPlayerRoom(playerId: string): Room | null {
    const roomId = this.playerRooms.get(playerId);
    if (!roomId) return null;
    return this.rooms.get(roomId) || null;
  }

  // プレイヤーをルームから削除
  removePlayer(playerId: string): Room | null {
    const roomId = this.playerRooms.get(playerId);
    if (!roomId) return null;

    const room = this.rooms.get(roomId);
    if (!room) return null;

    room.players = room.players.filter(p => p.id !== playerId);
    this.playerRooms.delete(playerId);

    // ルームが空になったら削除
    if (room.players.length === 0) {
      this.rooms.delete(roomId);
      console.log(`Room deleted: ${roomId}`);
      return null;
    }

    // ホストが抜けた場合、次のプレイヤーをホストにする
    if (!room.players.some(p => p.isHost) && room.players.length > 0) {
      room.players[0].isHost = true;
      console.log(`New host assigned: ${room.players[0].name}`);
    }

    console.log(`Player removed from room: ${roomId}`);
    return room;
  }

  // プレイヤーの接続状態を更新
  updatePlayerConnection(playerId: string, isConnected: boolean): Room | null {
    const roomId = this.playerRooms.get(playerId);
    if (!roomId) return null;

    const room = this.rooms.get(roomId);
    if (!room) return null;

    const player = room.players.find(p => p.id === playerId);
    if (!player) return null;

    player.isConnected = isConnected;
    player.lastSeen = isConnected ? undefined : new Date();

    return room;
  }

  // ゲームを開始
  startGame(roomId: string): boolean {
    const room = this.rooms.get(roomId);
    if (!room || room.status !== 'waiting') {
      return false;
    }

    if (room.players.length < 2) {
      return false;
    }

    room.status = 'playing';
    room.currentRound = 1;
    room.currentPlayerIndex = 0;

    console.log(`Game started in room: ${roomId}`);
    return true;
  }

  // 古いルームをクリーンアップ（定期的に実行）
  cleanupOldRooms(): void {
    const now = new Date();
    const timeout = 30 * 60 * 1000; // 30分

    for (const [roomId, room] of this.rooms.entries()) {
      const lastActivity = room.players.reduce((latest, player) => {
        if (player.lastSeen && player.lastSeen > latest) {
          return player.lastSeen;
        }
        return latest;
      }, new Date(0));

      if (now.getTime() - lastActivity.getTime() > timeout) {
        this.rooms.delete(roomId);
        room.players.forEach(player => {
          this.playerRooms.delete(player.id);
        });
        console.log(`Old room cleaned up: ${roomId}`);
      }
    }
  }

  // 統計情報を取得
  getStats() {
    return {
      totalRooms: this.rooms.size,
      totalPlayers: this.playerRooms.size,
      waitingRooms: Array.from(this.rooms.values()).filter(r => r.status === 'waiting').length,
      playingRooms: Array.from(this.rooms.values()).filter(r => r.status === 'playing').length,
    };
  }

  private generatePlayerId(): string {
    return `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateRoomId(): string {
    return `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export const roomService = new RoomService(); 