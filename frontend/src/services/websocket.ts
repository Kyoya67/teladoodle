import type { WebSocketMessage } from '../types';

const WS_BASE_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:3000';

interface WebSocketCallbacks {
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Event | any) => void;
  onMessage?: (message: WebSocketMessage) => void;
  onPlayerJoined?: (data: any) => void;
  onPlayerLeft?: (data: any) => void;
  onPlayerDisconnected?: (data: any) => void;
  onGameStarted?: (data: any) => void;
}

class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private callbacks: WebSocketCallbacks = {};
  private isConnecting = false;

  // 接続
  connect(callbacks: WebSocketCallbacks = {}) {
    if (this.ws?.readyState === WebSocket.OPEN || this.isConnecting) {
      return;
    }

    this.callbacks = callbacks;
    this.isConnecting = true;

    try {
      this.ws = new WebSocket(WS_BASE_URL);
      this.setupEventHandlers();
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      this.isConnecting = false;
      this.handleReconnect();
    }
  }

  // 切断
  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.isConnecting = false;
    this.reconnectAttempts = 0;
  }

  // メッセージ送信
  send(message: WebSocketMessage) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket is not connected');
    }
  }

  // ルームに参加
  joinRoom(playerName: string, roomId: string) {
    this.send({
      type: 'join',
      data: { playerName, roomId }
    });
  }

  // ルームから退出
  leaveRoom() {
    this.send({ type: 'leave' });
  }

  // ゲーム開始
  startGame() {
    this.send({ type: 'start_game' });
  }

  // お題を送信
  submitPrompt(prompt: string) {
    this.send({
      type: 'submit_prompt',
      data: { prompt }
    });
  }

  // 絵を送信
  submitDrawing(drawing: string) {
    this.send({
      type: 'submit_drawing',
      data: { drawing }
    });
  }

  // 回答を送信
  submitAnswer(answer: string) {
    this.send({
      type: 'submit_answer',
      data: { answer }
    });
  }

  // 接続状態を取得
  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  // イベントハンドラーの設定
  private setupEventHandlers() {
    if (!this.ws) return;

    this.ws.onopen = () => {
      console.log('WebSocket connected');
      this.isConnecting = false;
      this.reconnectAttempts = 0;
      this.callbacks.onConnect?.();
    };

    this.ws.onclose = (event) => {
      console.log('WebSocket disconnected:', event.code, event.reason);
      this.isConnecting = false;
      this.callbacks.onDisconnect?.();
      
      // 自動再接続
      if (event.code !== 1000) { // 正常な切断でない場合
        this.handleReconnect();
      }
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      this.isConnecting = false;
      this.callbacks.onError?.(error);
    };

    this.ws.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);
        this.handleMessage(message);
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };
  }

  // メッセージハンドラー
  private handleMessage(message: WebSocketMessage) {
    this.callbacks.onMessage?.(message);

    switch (message.type) {
      case 'player_joined':
        this.callbacks.onPlayerJoined?.(message.data);
        break;
      case 'player_left':
        this.callbacks.onPlayerLeft?.(message.data);
        break;
      case 'player_disconnected':
        this.callbacks.onPlayerDisconnected?.(message.data);
        break;
      case 'game_started':
        this.callbacks.onGameStarted?.(message.data);
        break;
      case 'error':
        this.callbacks.onError?.(message.data);
        break;
      case 'pong':
        // 接続確認応答
        break;
      default:
        console.log('Unknown message type:', message.type);
    }
  }

  // 再接続処理
  private handleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

    console.log(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

    setTimeout(() => {
      if (this.ws?.readyState !== WebSocket.OPEN) {
        this.connect(this.callbacks);
      }
    }, delay);
  }

  // 接続確認（ping/pong）
  ping() {
    this.send({ type: 'ping' });
  }
}

export const websocketService = new WebSocketService(); 