import type { SessionInfo } from '../types/index';
import { isWithinReconnectTimeout } from '../../../shared/index.js';

const SESSION_KEY = 'teladoodle_session';

// セッション情報を保存
export const saveSession = (session: SessionInfo): void => {
  const sessionData = {
    ...session,
    lastConnected: new Date().toISOString(),
  };
  localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
};

// セッション情報を取得
export const getSession = (): SessionInfo | null => {
  try {
    const data = localStorage.getItem(SESSION_KEY);
    if (!data) return null;
    
    const session = JSON.parse(data);
    return {
      ...session,
      lastConnected: new Date(session.lastConnected),
    };
  } catch {
    return null;
  }
};

// セッション情報を削除
export const clearSession = (): void => {
  localStorage.removeItem(SESSION_KEY);
};

// 再接続可能かチェック
export const canReconnect = (): boolean => {
  const session = getSession();
  if (!session || !session.lastConnected) return false;
  
  return isWithinReconnectTimeout(session.lastConnected);
}; 