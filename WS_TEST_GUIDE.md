# WebSocket接続テストガイド

## 📋 現在の状態

### ✅ 起動中のサービス
- **WebSocket Server**: `http://0.0.0.0:3030` (コンテナ内)
- **Nginx**: `http://localhost:80` (ホスト側)
- **Client Build**: `/var/www` (nginx経由で配信)

### 🔧 修正内容
1. **client/src/plugins/socket.ts**を修正
   - ハードコードされたIPアドレス (`ws://133.130.101.109:3030`) を削除
   - 環境変数による動的な接続先設定を追加
   - Docker環境では空文字（nginxプロキシ経由）、ローカル開発では`localhost:3030`

2. **WebSocketプロキシ設定** (nginx/default.conf)
   - `/socket.io/` へのリクエストを `websocket:3030` にプロキシ
   - WebSocketアップグレードヘッダー対応済み

---

## 🧪 テスト方法

### 方法1: WebSocketテストページ（推奨）

1. ブラウザで以下のURLを開く：
   ```
   http://localhost/ws-test.html
   ```

2. 表示内容を確認：
   - ✅ **接続成功**: 緑色の「✅ 接続成功」表示
   - ❌ **接続失敗**: 赤色のエラー表示
   - 🔄 **接続中**: 黄色の「🔄 再接続中...」表示

3. テスト操作：
   - **再接続ボタン**: WebSocket接続を再試行
   - **テストメッセージ送信**: サーバーにテストメッセージを送信
   - **ログクリア**: ログ表示をクリア

### 方法2: ブラウザの開発者ツール

1. ブラウザで `http://localhost/` を開く

2. 開発者ツール (F12) を開く

3. **Network** タブを選択

4. **WS** フィルターをクリック（WebSocket通信のみ表示）

5. 接続を確認：
   - WebSocket接続が表示される
   - Status: `101 Switching Protocols` が正常

6. **Console** タブで以下を実行：
   ```javascript
   // Socket.IOオブジェクトを確認
   console.log(window.io);
   
   // 接続テスト
   const testSocket = io('http://localhost');
   testSocket.on('connect', () => {
       console.log('✅ WebSocket接続成功！ Socket ID:', testSocket.id);
   });
   testSocket.on('connect_error', (error) => {
       console.error('❌ 接続エラー:', error);
   });
   ```

### 方法3: コマンドラインでテスト

#### Dockerログでリアルタイム監視

```powershell
# WebSocketサーバーのログを監視
docker logs setunanomikiritekina-websocket-1 -f

# 新しい接続があると以下のようなログが表示される:
# "接続されました: <socket-id>"
```

#### curlでHTTPエンドポイントを確認

```powershell
# nginxが動作しているか確認
curl http://localhost/

# WebSocketエンドポイントの確認（HTTPリクエストは失敗するが、サーバーが応答するはず）
curl -i http://localhost/socket.io/
```

---

## 🔍 トラブルシューティング

### ❌ 接続できない場合

#### 1. サービスが起動しているか確認
```powershell
docker-compose ps
```

すべてのサービスが `Up` 状態であることを確認

#### 2. WebSocketサーバーのログを確認
```powershell
docker logs setunanomikiritekina-websocket-1 --tail 50
```

エラーメッセージがないか確認

#### 3. Nginxのログを確認
```powershell
docker logs setunanomikiritekina-nginx-1 --tail 50
```

プロキシエラーがないか確認

#### 4. ネットワーク確認
```powershell
# ポートが開いているか確認
netstat -ano | findstr :80
netstat -ano | findstr :3030
```

#### 5. ファイアウォール確認
Windowsファイアウォールでポート80と3030が許可されているか確認

### 🔄 再起動手順

```powershell
# すべてのコンテナを停止
docker-compose down

# 再ビルドして起動
docker-compose up --build -d

# ログを監視
docker-compose logs -f websocket
```

---

## 📊 期待される動作

### 正常な接続フロー

1. **クライアント**: ブラウザで `http://localhost/` にアクセス
2. **Nginx**: リクエストを受信、静的ファイルを配信
3. **クライアントJS**: Socket.IO クライアントが初期化
4. **WebSocket接続**: `/socket.io/` へ接続試行
5. **Nginx**: WebSocketリクエストを `websocket:3030` にプロキシ
6. **WebSocketサーバー**: 接続を受け入れ、`connectUser` イベントを送信
7. **クライアント**: Socket IDを受信、接続確立

### 確認項目チェックリスト

- [ ] `docker-compose ps` で全サービスが `Up` 状態
- [ ] `http://localhost/` でページが表示される
- [ ] ブラウザの開発者ツールでWebSocket接続が確認できる
- [ ] `http://localhost/ws-test.html` で接続成功が表示される
- [ ] WebSocketサーバーのログに接続ログが表示される

---

## 🎯 環境変数での接続先設定（オプション）

### ローカル開発時に別のサーバーに接続したい場合

`.env.local` ファイルを `client/` ディレクトリに作成：

```env
REACT_APP_WS_URL=http://別のサーバーのアドレス:3030
```

### Docker環境で明示的に設定する場合

`docker-compose.yml` の `client` サービスに追加：

```yaml
environment:
  - REACT_APP_WS_URL=
```

空文字にすることで、nginxプロキシ経由の接続を強制します。

---

## 📝 よく使うコマンド

```powershell
# すべてのサービスを起動
docker-compose up -d

# ログをリアルタイム監視
docker-compose logs -f

# 特定サービスのログのみ
docker-compose logs -f websocket
docker-compose logs -f nginx

# サービスの再起動
docker-compose restart websocket

# すべて停止
docker-compose down

# すべて停止＋ボリューム削除
docker-compose down -v
```

---

## ✅ 成功時の表示例

### ws-test.html での表示
```
🔌 WebSocket接続テスト
接続先: http://localhost

✅ 接続成功

[14:30:25] WebSocketに接続を試みています...
[14:30:26] ✅ WebSocketに接続しました！
[14:30:26] Socket ID: abc123xyz
```

### WebSocketサーバーのログ
```
[nodemon] starting `ts-node ./src/index.ts`
http://0.0.0.0:3030
接続されました: abc123xyz
```

---

Happy Testing! 🚀

