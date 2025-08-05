# Node.js 18 Alpine イメージを使用
FROM node:18-alpine AS base

# 依存関係のインストールステージ
FROM base AS deps
WORKDIR /app

# package.jsonとpackage-lock.jsonをコピー
COPY package*.json ./

# 依存関係をインストール
RUN npm ci --only=production

# ビルドステージ
FROM base AS builder
WORKDIR /app

# package.jsonとpackage-lock.jsonをコピー
COPY package*.json ./

# 開発依存関係も含めてインストール
RUN npm ci

# ソースコードをコピー
COPY . .

# TypeScriptをビルド
RUN npm run build

# 本番ステージ
FROM base AS runner
WORKDIR /app

# 本番用の依存関係をコピー
COPY --from=deps /app/node_modules ./node_modules

# ビルドされたファイルをコピー
COPY --from=builder /app/dist ./dist

# package.jsonをコピー（startスクリプト用）
COPY --from=builder /app/package.json ./package.json

# 非rootユーザーを作成
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nodeuser

# ファイルの所有者を変更
RUN chown -R nodeuser:nodejs /app
USER nodeuser

# ポートを公開
EXPOSE 8080

# 環境変数を設定
ENV PORT=8080
ENV NODE_ENV=production

# アプリケーションを起動
CMD ["npm", "start"] 