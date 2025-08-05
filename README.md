# Teladoodle

スマホでも快適に遊べるお絵描き伝言ゲーム

## 概要

Gartic Phoneのようなお絵描き伝言ゲームをベースにした改良版です。本家の不満点（スマホで描きづらい、セッション切れ、UI制限など）を解消し、より快適なゲーム体験を提供します。

## 主な機能

- 🎨 スマホ対応の描画キャンバス（ズーム/ピンチ対応予定）
- 🔄 セッション復帰機能（ブラウザ閉じても再接続可能）
- 👥 ルーム作成・参加機能
- ⏱️ 制限時間設定
- 📱 レスポンシブデザイン
- 🔮 将来的にReact Native（Expo）でアプリ化予定

## 技術スタック

- **フロントエンド**: React 19 + TypeScript + Vite
- **バックエンド**: Hono + Node.js + TypeScript
- **ルーティング**: React Router DOM
- **スタイリング**: Tailwind CSS
- **状態管理**: React Hooks（将来的にZustandを検討）
- **リアルタイム通信**: WebSocket
- **API**: RESTful API + WebSocket
- **デプロイ**: Cloud Run（バックエンド）+ Firebase Hosting（フロントエンド）

## 開発環境のセットアップ

### 前提条件

- Node.js 18以上
- npm または yarn

### インストール

```bash
# リポジトリをクローン
git clone <repository-url>
cd teladoodle

# 全依存関係をインストール（ワークスペース対応）
npm run install:all

# 共有パッケージをビルド
npm run build:shared

# 環境変数を設定
cp env.example .env.local
# .env.localを編集してAPI_URLを設定

# 開発サーバーを起動（フロントエンド + バックエンド）
npm run dev

# 個別に起動する場合
npm run dev:frontend  # フロントエンド（ポート5173）
npm run dev:backend   # バックエンド（ポート3000）
```

### 利用可能なスクリプト

```bash
# 開発
npm run dev              # フロントエンド + バックエンド同時起動
npm run dev:frontend     # フロントエンドのみ
npm run dev:backend      # バックエンドのみ

# ビルド
npm run build            # 全パッケージをビルド
npm run build:shared     # 共有パッケージのみ
npm run build:frontend   # フロントエンドのみ
npm run build:backend    # バックエンドのみ

# インストール
npm run install:all      # 全依存関係をインストール

# リント
npm run lint             # 全パッケージをリント
npm run lint:frontend    # フロントエンドのみ
npm run lint:backend     # バックエンドのみ

# クリーンアップ
npm run clean            # node_modulesを削除
```

## プロジェクト構造

```
teladoodle/
├── frontend/              # React (Vite) プロジェクト
│   ├── src/
│   │   ├── pages/         # 各画面（Top, CreateRoom, JoinRoom, Playなど）
│   │   ├── components/    # UIコンポーネント
│   │   ├── services/      # API・WebSocketサービス
│   │   ├── hooks/         # カスタムフック
│   │   ├── utils/         # 共通関数
│   │   ├── types/         # 型定義（共有型を再エクスポート）
│   │   └── App.tsx        # ルーティング設定
│   ├── public/            # 静的ファイル
│   ├── package.json       # フロントエンド依存関係
│   ├── vite.config.ts     # Vite設定
│   └── tsconfig.json      # TypeScript設定
├── backend/               # Hono API（Cloud Run向け）
│   ├── src/
│   │   ├── services/      # ビジネスロジック
│   │   ├── types/         # 型定義（共有型を再エクスポート）
│   │   └── index.ts       # メインアプリケーション
│   ├── package.json       # バックエンド依存関係
│   ├── Dockerfile         # Cloud Run用
│   └── GCP_SETUP.md       # GCPセットアップガイド
├── shared/                # 共有パッケージ
│   ├── types/             # 共通型定義
│   ├── utils/             # 共通ユーティリティ関数
│   ├── package.json       # 共有パッケージ設定
│   └── tsconfig.json      # TypeScript設定
├── package.json           # ルートワークスペース設定
├── .gitignore             # Git除外設定
└── README.md              # プロジェクト説明
```

## ゲームの流れ

1. **ルーム作成・参加**: プレイヤー名を入力してルームを作成または参加
2. **待機画面**: 他のプレイヤーの参加を待つ
3. **ゲーム開始**: ホストがゲームを開始
4. **お題入力**: 最初のプレイヤーがお題を入力
5. **絵を描く**: 次のプレイヤーが絵を描く
6. **回答を書く**: 次のプレイヤーが回答を書く
7. **結果表示**: 全員分の絵とテキストの履歴を表示
8. **次のラウンド**: 設定したラウンド数まで繰り返し

## セッション管理

- プレイヤー情報をlocalStorageに保存
- ブラウザを閉じても30秒以内なら再接続可能
- WebSocketの再接続対応
- スマホスリープ時の切断にも耐える設計

## 今後の実装予定

- [ ] キャンバス描画機能（Canvas API）
- [ ] WebSocketによるリアルタイム同期
- [ ] ゲーム進行ロジック
- [ ] 結果表示画面
- [ ] ズーム/ピンチ対応
- [ ] 音声効果
- [ ] アニメーション
- [ ] PWA対応
- [ ] React Native（Expo）版

## ライセンス

MIT License

## 貢献

プルリクエストやイシューの報告を歓迎します！
