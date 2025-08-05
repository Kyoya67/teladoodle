import type { Room, Player, CreateRoomData, JoinRoomData, ApiResponse, RoomResponse } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

class ApiService {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const defaultOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, { ...defaultOptions, ...options });
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }
      
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // ルーム作成
  async createRoom(data: CreateRoomData): Promise<RoomResponse> {
    const response = await this.request<RoomResponse>('/rooms', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to create room');
    }
    
    return response.data;
  }

  // ルーム参加
  async joinRoom(data: JoinRoomData): Promise<RoomResponse> {
    const response = await this.request<RoomResponse>('/rooms/join', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to join room');
    }
    
    return response.data;
  }

  // ルーム情報取得
  async getRoom(roomId: string): Promise<Room> {
    const response = await this.request<Room>(`/rooms/${roomId}`);
    
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to get room');
    }
    
    return response.data;
  }

  // プレイヤーのルーム情報取得
  async getPlayerRoom(playerId: string): Promise<RoomResponse> {
    const response = await this.request<RoomResponse>(`/players/${playerId}/room`);
    
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to get player room');
    }
    
    return response.data;
  }

  // ルームから退出
  async leaveRoom(roomId: string, playerId: string): Promise<void> {
    await this.request(`/rooms/${roomId}/players/${playerId}`, {
      method: 'DELETE',
    });
  }

  // ゲーム開始
  async startGame(roomId: string): Promise<Room> {
    const response = await this.request<Room>(`/rooms/${roomId}/start`, {
      method: 'POST',
    });
    
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to start game');
    }
    
    return response.data;
  }

  // 統計情報取得
  async getStats() {
    const response = await this.request('/stats');
    return response.data;
  }

  // ヘルスチェック
  async healthCheck() {
    const response = await this.request('/');
    return response;
  }
}

export const apiService = new ApiService(); 