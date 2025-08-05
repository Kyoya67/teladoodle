# GCP セットアップガイド

## 前提条件

1. **Google Cloud SDK** がインストールされている
2. **Google Cloud プロジェクト** が作成されている
3. **請求が有効** になっている

## 1. Google Cloud SDK のインストール

### macOS
```bash
# Homebrewを使用
brew install google-cloud-sdk

# 初期化
gcloud init
```

### Windows
```bash
# 公式インストーラーをダウンロード
# https://cloud.google.com/sdk/docs/install
```

## 2. プロジェクトの設定

```bash
# プロジェクトIDを設定（your-project-idを実際のプロジェクトIDに変更）
export PROJECT_ID="your-project-id"
gcloud config set project $PROJECT_ID

# 必要なAPIを有効化
gcloud services enable run.googleapis.com
gcloud services enable cloudbuild.googleapis.com
```

## 3. 認証の設定

```bash
# アプリケーションのデフォルト認証情報を設定
gcloud auth application-default login
```

## 4. Cloud Run へのデプロイ

### 方法1: ソースコードから直接デプロイ（推奨）

```bash
# プロジェクトルートディレクトリで実行
cd backend

# Cloud Runにデプロイ
gcloud run deploy teladoodle-api \
  --source . \
  --platform managed \
  --region asia-northeast1 \
  --allow-unauthenticated \
  --memory 512Mi \
  --cpu 1 \
  --max-instances 10 \
  --timeout 300
```

### 方法2: Dockerイメージをビルドしてデプロイ

```bash
# Dockerイメージをビルド
docker build -t gcr.io/$PROJECT_ID/teladoodle-api .

# Container Registryにプッシュ
docker push gcr.io/$PROJECT_ID/teladoodle-api

# Cloud Runにデプロイ
gcloud run deploy teladoodle-api \
  --image gcr.io/$PROJECT_ID/teladoodle-api \
  --platform managed \
  --region asia-northeast1 \
  --allow-unauthenticated \
  --memory 512Mi \
  --cpu 1 \
  --max-instances 10 \
  --timeout 300
```

## 5. 環境変数の設定

```bash
# 環境変数を設定
gcloud run services update teladoodle-api \
  --region asia-northeast1 \
  --set-env-vars NODE_ENV=production
```

## 6. カスタムドメインの設定（オプション）

```bash
# カスタムドメインをマッピング
gcloud run domain-mappings create \
  --service teladoodle-api \
  --domain api.yourdomain.com \
  --region asia-northeast1
```

## 7. 監視とログの確認

```bash
# ログを確認
gcloud logs tail --service=teladoodle-api

# メトリクスを確認
gcloud run services describe teladoodle-api --region asia-northeast1
```

## 8. スケーリング設定

```bash
# 自動スケーリングの設定
gcloud run services update teladoodle-api \
  --region asia-northeast1 \
  --min-instances 0 \
  --max-instances 10 \
  --cpu-throttling
```

## 9. セキュリティ設定

```bash
# IAMポリシーを設定
gcloud run services add-iam-policy-binding teladoodle-api \
  --region asia-northeast1 \
  --member="allUsers" \
  --role="roles/run.invoker"
```

## 10. トラブルシューティング

### よくある問題

1. **メモリ不足エラー**
   ```bash
   # メモリを増やす
   gcloud run services update teladoodle-api \
     --region asia-northeast1 \
     --memory 1Gi
   ```

2. **タイムアウトエラー**
   ```bash
   # タイムアウトを延長
   gcloud run services update teladoodle-api \
     --region asia-northeast1 \
     --timeout 600
   ```

3. **CORSエラー**
   - フロントエンドのドメインをCORS設定に追加

### ログの確認

```bash
# リアルタイムログ
gcloud logs tail --service=teladoodle-api --region asia-northeast1

# 特定の時間範囲のログ
gcloud logs read "resource.type=cloud_run_revision AND resource.labels.service_name=teladoodle-api" \
  --limit 50 \
  --format "table(timestamp,severity,textPayload)"
```

## 11. コスト最適化

```bash
# 最小インスタンス数を0に設定（コールドスタートあり）
gcloud run services update teladoodle-api \
  --region asia-northeast1 \
  --min-instances 0

# CPUスロットリングを有効化
gcloud run services update teladoodle-api \
  --region asia-northeast1 \
  --cpu-throttling
```

## 12. 本番環境のベストプラクティス

1. **環境変数の管理**
   - 機密情報はSecret Managerを使用
   - 設定値は環境変数で管理

2. **ヘルスチェック**
   - `/` エンドポイントでヘルスチェック
   - 適切なステータスコードを返す

3. **エラーハンドリング**
   - 適切なエラーレスポンス
   - ログ出力の統一

4. **セキュリティ**
   - HTTPSの強制
   - 適切なCORS設定
   - 入力値のバリデーション

## 13. 開発環境との連携

### ローカル開発

```bash
# ローカルでサーバー起動
npm run dev

# 環境変数を設定
export API_URL=http://localhost:3000
```

### 本番環境

```bash
# デプロイ後のURLを取得
gcloud run services describe teladoodle-api \
  --region asia-northeast1 \
  --format "value(status.url)"

# フロントエンドの環境変数を更新
export API_URL=https://teladoodle-api-xxxxx-xx.a.run.app
``` 