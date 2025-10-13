# FPSゲームにおけるネットワーク技術

## 📊 現在のプロジェクトとの比較

### このプロジェクトの手法
```
【Simple Client-Server with Lag Compensation】
- クライアント: 入力 → サーバー送信 → 結果待機
- サーバー: 全判定を実行 → 結果をブロードキャスト
- 遅延補正: クライアント-サーバー間の時刻差を測定・加算
```

**長所**:
- シンプルで実装が容易
- チート対策が強固（サーバーが全て判定）
- 小規模（2人対戦）では十分

**短所**:
- 遅延が大きいと操作感が悪化
- サーバーの応答を待つ必要がある
- スケーラビリティに限界

---

## 🎮 FPSゲームの主流技術

### 1. Client-Side Prediction (クライアント予測)

最も重要な技術。プレイヤーの操作を即座に画面に反映し、後でサーバーの判定で修正する。

#### 基本原理

```typescript
// === クライアント側 ===
class Player {
  position: Vector3;
  velocity: Vector3;
  commandHistory: Command[] = [];
  lastAcknowledgedCommand: number = 0;

  // ユーザー入力時
  onInput(input: Input) {
    const command = {
      id: this.commandHistory.length,
      input: input,
      timestamp: Date.now()
    };

    // 1. ローカルで即座に実行（予測）
    this.applyCommand(command);

    // 2. コマンド履歴に保存
    this.commandHistory.push(command);

    // 3. サーバーに送信
    network.send('moveCommand', command);
  }

  // サーバーからの更新受信時
  onServerUpdate(serverState: PlayerState) {
    // サーバーが確認したコマンドまでを削除
    this.commandHistory = this.commandHistory.filter(
      cmd => cmd.id > serverState.lastCommandId
    );

    // サーバーの位置を起点に
    this.position = serverState.position;

    // 未確認のコマンドを再適用（Reconciliation）
    for (const cmd of this.commandHistory) {
      this.applyCommand(cmd);
    }
  }
}
```

**このプロジェクトとの違い**:
```typescript
// 現在の実装（client/src/components/playGame.tsx:133-141）
const touchFire = () => {
  const now = Date.now() + state.game.lag;
  if (!state.game.fire) {
    if (now >= state.game.time) {
      wsUser.emit('gameFire', { time: now, roomId: state.game.room });
      // ← ここでサーバーの応答を待つ
    }
    dispatch({ type: 'Fire' });
  }
};

// Client-Side Predictionを適用すると:
const touchFire = () => {
  const now = Date.now() + state.game.lag;
  if (!state.game.fire) {
    if (now >= state.game.time) {
      // 1. 即座にローカルで処理（予測）
      setLocalFire(true);
      setLocalWinner('me');

      // 2. サーバーに送信
      wsUser.emit('gameFire', {
        time: now,
        roomId: state.game.room,
        commandId: commandCounter++
      });

      // 3. サーバー結果で修正（後で）
    }
    dispatch({ type: 'Fire' });
  }
};
```

#### 実装例: Counter-Strike / Valorant

```typescript
// Valorantのような実装
interface GameState {
  tick: number;           // サーバーティック番号
  players: PlayerState[];
  projectiles: Projectile[];
}

class FPSClient {
  private stateHistory: GameState[] = [];
  private commandBuffer: Command[] = [];

  // 60FPSで更新
  update(deltaTime: number) {
    // ユーザー入力を収集
    const command = this.collectInput();

    // ローカルで即座にシミュレート
    this.predictMovement(command);

    // サーバーに送信（パケット圧縮）
    this.sendCommandToServer(command);
  }

  // サーバーから更新（例: 20Hz = 50ms毎）
  onServerSnapshot(snapshot: GameState) {
    // サーバーの状態を保存
    this.stateHistory.push(snapshot);

    // 予測との差を修正
    this.reconcile(snapshot);

    // 他プレイヤーを補間
    this.interpolateOtherPlayers(snapshot);
  }
}
```

---

### 2. Server Reconciliation (サーバー調整)

クライアントの予測とサーバーの実際の状態に差がある場合の修正処理。

```typescript
reconcile(serverState: GameState) {
  const localState = this.getCurrentState();
  const positionDiff = serverState.position.distance(localState.position);

  if (positionDiff > RECONCILIATION_THRESHOLD) {
    // 差が大きい場合
    if (positionDiff > TELEPORT_THRESHOLD) {
      // 瞬間移動で修正
      this.position = serverState.position;
    } else {
      // スムーズに補間
      this.position = Vector3.lerp(
        localState.position,
        serverState.position,
        0.3  // 補間率
      );
    }
  }

  // 未確認コマンドを再適用
  this.replayCommands(serverState.lastCommandId);
}
```

**閾値の例**:
- `RECONCILIATION_THRESHOLD`: 5cm（これ以下は無視）
- `TELEPORT_THRESHOLD`: 2m（ワープ）

---

### 3. Entity Interpolation (エンティティ補間)

他プレイヤーの動きを滑らかに表示する技術。

#### 基本概念

```typescript
class RemotePlayer {
  private stateBuffer: PlayerState[] = [];
  private renderDelay: number = 100; // 100ms遅延で描画

  onServerUpdate(state: PlayerState) {
    state.timestamp = Date.now();
    this.stateBuffer.push(state);

    // 古いデータを削除
    const cutoff = Date.now() - 1000;
    this.stateBuffer = this.stateBuffer.filter(
      s => s.timestamp > cutoff
    );
  }

  render() {
    const renderTime = Date.now() - this.renderDelay;

    // renderTime前後の2つの状態を取得
    const [older, newer] = this.findSurroundingStates(renderTime);

    if (!older || !newer) return;

    // 線形補間
    const t = (renderTime - older.timestamp) /
              (newer.timestamp - older.timestamp);

    this.position = Vector3.lerp(older.position, newer.position, t);
    this.rotation = Quaternion.slerp(older.rotation, newer.rotation, t);
  }
}
```

#### 視覚的説明

```
タイムライン:
|-----|-----|-----|-----|-----|-----|
t=0   50   100   150   200   250   300 (ms)

サーバー更新: 50ms毎に送信
       ↓     ↓     ↓     ↓     ↓
     state1 state2 state3 state4 state5

レンダリング（100ms遅延）:
              ↓
          render時刻=200ms
          renderTime-100ms=100ms

          state2(t=100) と state3(t=150) の間を補間
          t = (100-100)/(150-100) = 0.0
          → state2の位置で描画
```

**このプロジェクトでの類似実装**:

```typescript
// client/src/components/playGame.tsx:175-213
const Fire = ({ time }: any) => {
  const [nowTime, setstate] = useState(0);
  const { state } = useContext(NameContext);

  useEffect(() => {
    timer = setInterval(() => {
      if (!fire.current) {
        const now = Date.now() + state.game.lag;
        setstate(Math.floor((now - time) / 10));  // ← 10ms毎に更新（補間的）
      }
    }, 10);
  }, []);
};
```

---

### 4. Lag Compensation (遅延補正) - FPS方式

FPSでは**リワインド（巻き戻し）**方式が主流。

#### 原理

```typescript
// === サーバー側 ===
class FPSServer {
  private worldHistory: WorldState[] = [];
  private readonly HISTORY_LENGTH = 1000; // 1秒分保存

  // 毎ティック保存
  saveWorldState() {
    this.worldHistory.push({
      timestamp: Date.now(),
      players: this.players.map(p => p.clone()),
      objects: this.objects.map(o => o.clone())
    });

    // 古い履歴を削除
    const cutoff = Date.now() - this.HISTORY_LENGTH;
    this.worldHistory = this.worldHistory.filter(
      s => s.timestamp > cutoff
    );
  }

  // プレイヤーが射撃
  onShoot(playerId: string, shootData: ShootData) {
    const player = this.players.get(playerId);
    const lag = player.averagePing / 2; // 片道遅延

    // プレイヤーが見ていた時点まで巻き戻し
    const pastTime = shootData.clientTime - lag;
    const pastWorld = this.getWorldStateAt(pastTime);

    // 過去の世界で当たり判定
    const hitResult = this.raycast(
      shootData.origin,
      shootData.direction,
      pastWorld
    );

    if (hitResult.hit) {
      // ダメージ適用は現在時刻で
      this.applyDamage(hitResult.targetId, shootData.damage);
    }

    return hitResult;
  }
}
```

#### 視覚的説明

```
【シナリオ: プレイヤーAがプレイヤーBを射撃】

実際の時間軸:
|-------|-------|-------|-------|
t=0    100ms   200ms   300ms   400ms

t=0:   BがA地点に移動
t=100: Aが射撃ボタンを押す（Aの画面ではBはA地点に見えている）
t=150: 射撃データがサーバー到着（50ms遅延）
t=150: しかし実際のBはB地点に移動済み

サーバーの処理:
1. Aの遅延(50ms)を計算
2. t=100の世界状態を復元
3. その時点でBはA地点にいた → ヒット判定
4. 現在時刻でBにダメージ適用
```

**このプロジェクトとの比較**:

```typescript
// 現在の実装: クライアント時刻を補正して送信
const now = Date.now() + state.game.lag;
wsUser.emit('gameFire', { time: now, roomId: state.game.room });

// FPS方式: サーバー側で巻き戻し
// クライアントは補正せずに送信
const clientTime = Date.now();
wsUser.emit('gameFire', {
  clientTime: clientTime,  // 生の時刻
  roomId: state.game.room
});

// サーバー側で巻き戻し処理
timeFire(socketId: string, roomId: string, data: any) {
  const player = this.getPlayer(socketId);
  const lag = player.averagePing / 2;

  // プレイヤーが見ていた時点の世界を復元
  const pastWorld = this.getWorldStateAt(data.clientTime - lag);

  // その時点で判定
  const result = this.checkWinner(pastWorld, data.clientTime);
}
```

---

### 5. Snapshot Compression (スナップショット圧縮)

FPSでは大量のデータを送信するため、圧縮が必須。

```typescript
// Delta Compression（差分圧縮）
class SnapshotCompressor {
  private lastSentState: GameState;

  compress(currentState: GameState): Uint8Array {
    if (!this.lastSentState) {
      // 初回はフルデータ
      return this.serializeFull(currentState);
    }

    // 差分のみを送信
    const delta = {
      tick: currentState.tick,
      changed: []
    };

    for (const player of currentState.players) {
      const oldPlayer = this.lastSentState.players.find(
        p => p.id === player.id
      );

      if (!oldPlayer) {
        // 新規プレイヤー
        delta.changed.push({ type: 'add', data: player });
      } else if (!player.equals(oldPlayer)) {
        // 変更あり
        delta.changed.push({
          type: 'update',
          id: player.id,
          diff: this.calculateDiff(oldPlayer, player)
        });
      }
    }

    this.lastSentState = currentState;
    return this.serializeDelta(delta);
  }

  // 位置の量子化（精度を落として圧縮）
  calculateDiff(old: Player, current: Player) {
    return {
      // 1cm単位に丸める（float → int16）
      dx: Math.round((current.x - old.x) * 100),
      dy: Math.round((current.y - old.y) * 100),
      dz: Math.round((current.z - old.z) * 100),

      // 角度は256段階（float → uint8）
      rotation: Math.round(current.rotation / 360 * 256)
    };
  }
}
```

**圧縮率の例**:
```
フルデータ: 1プレイヤー = 48バイト
  - position: 12バイト (float x3)
  - rotation: 16バイト (quaternion)
  - velocity: 12バイト (float x3)
  - health: 4バイト (int32)
  - etc: 4バイト

差分データ: 1プレイヤー = 8バイト
  - id: 2バイト (uint16)
  - dx,dy,dz: 6バイト (int16 x3)

10プレイヤー:
  - フル: 480バイト
  - 差分: 80バイト
  → 83%削減
```

---

### 6. Adaptive Tick Rate (適応ティックレート)

プレイヤーの状況に応じて更新頻度を変える。

```typescript
class AdaptiveNetworkManager {
  private tickRates = {
    high: 60,    // 16.7ms (低遅延・近距離戦闘)
    medium: 30,  // 33.3ms (通常)
    low: 20      // 50ms (遠距離・観戦)
  };

  calculateTickRate(player: Player): number {
    // 遅延が高い場合は低レートに
    if (player.ping > 150) return this.tickRates.low;

    // 戦闘中は高レート
    if (player.isInCombat()) return this.tickRates.high;

    // 移動中は中レート
    if (player.velocity.length() > 0.1) return this.tickRates.medium;

    // 静止時は低レート
    return this.tickRates.low;
  }

  // 可変長更新ループ
  async updateLoop() {
    while (this.running) {
      const startTime = Date.now();

      for (const player of this.players.values()) {
        const tickRate = this.calculateTickRate(player);
        const interval = 1000 / tickRate;

        if (startTime - player.lastUpdate >= interval) {
          this.sendUpdateToPlayer(player);
          player.lastUpdate = startTime;
        }
      }

      await this.sleep(10); // 10ms基本ループ
    }
  }
}
```

---

### 7. 主要FPSゲームの実装例

#### Valorant (Riot Games)

```typescript
// 公式技術記事からの抜粋
interface ValorantNetcode {
  tickRate: 128;              // サーバー: 128Hz
  clientUpdateRate: 128;      // クライアント送信: 128Hz
  snapshotRate: 30;           // スナップショット: 30Hz
  bufferTime: 15.625;         // 1フレーム分のバッファ

  features: [
    'Client-Side Prediction',
    'Server Reconciliation',
    'Lag Compensation (Rewind)',
    'Entity Interpolation',
    'Input Buffering'
  ];
}

// 実装の特徴:
// - サーバー128tickで超高精度判定
// - クライアントは予測でラグを隠蔽
// - 移動はクライアント予測、射撃はサーバー権威
```

#### Counter-Strike 2 (Valve)

```typescript
interface CS2Netcode {
  tickRate: 64;               // サーバー: 64Hz（競技は128Hz）
  subtickSystem: true;        // ティック間の入力を記録

  // Sub-Tick System: CS2の革新
  // 従来: 1ティック(15.6ms)内の入力は次ティックで処理
  // CS2: ティック内のどの時点で入力されたかを記録
  subtickPrecision: 0.1;      // 0.1ms精度

  features: [
    'Sub-Tick Input Recording',
    'Client-Side Prediction',
    'Lag Compensation',
    'Entity Interpolation'
  ];
}

// Sub-Tickの実装イメージ:
class SubTickSystem {
  recordInput(input: Input) {
    // ティック内の正確な時刻を記録
    const tickProgress = (Date.now() % tickInterval) / tickInterval;

    this.pendingInputs.push({
      input: input,
      tickProgress: tickProgress,  // 0.0 ~ 1.0
      timestamp: Date.now()
    });
  }

  processTick() {
    // ティック内の入力を時系列順に処理
    this.pendingInputs.sort((a, b) => a.tickProgress - b.tickProgress);

    for (const recorded of this.pendingInputs) {
      this.applyInputAt(recorded.tickProgress);
    }
  }
}
```

#### Apex Legends (Respawn)

```typescript
interface ApexNetcode {
  tickRate: 20;               // サーバー: 20Hz（低い！）
  clientUpdateRate: 60;       // クライアント: 60Hz

  // 20Hzでも快適な理由:
  optimizations: [
    'Aggressive Client Prediction',
    'Generous Hitbox (ヒットボックス大きめ)',
    'High Interpolation Buffer (100ms)',
    'Priority-Based Updates'
  ];

  // 優先度ベース更新
  prioritySystem: {
    nearbyPlayers: 20,        // 近くのプレイヤー: 20Hz
    distantPlayers: 10,       // 遠くのプレイヤー: 10Hz
    projectiles: 60,          // 弾丸: 60Hz
    staticObjects: 1          // 静的オブジェクト: 1Hz
  };
}
```

---

## 🔄 このプロジェクトへの適用案

### レベル1: 基本的な改善

```typescript
// 1. クライアント予測の追加
const touchFire = () => {
  const now = Date.now() + state.game.lag;
  if (!state.game.fire) {
    if (now >= state.game.time) {
      // ローカル予測: 即座に表示
      dispatch({ type: 'LocalFire', payload: now - state.game.time });

      // サーバーに送信
      wsUser.emit('gameFire', {
        time: now,
        roomId: state.game.room,
        commandId: ++commandCounter
      });
    }
  }
};

// 2. サーバーからの調整
wsUser.on('finishGame', (result) => {
  // ローカル予測と比較
  if (result.winner !== localPrediction.winner) {
    // 予測が外れた場合は修正
    dispatch({ type: 'CorrectPrediction', payload: result });
  }
});
```

### レベル2: 履歴ベース判定

```typescript
// サーバー側
class GameRoom {
  private stateHistory: RoomState[] = [];

  timeFire(socketId: string, data: ShootData) {
    const player = this.getPlayer(socketId);

    // プレイヤーの遅延を考慮
    const pastTime = data.clientTime - player.averagePing / 2;

    // その時点の状態を復元
    const pastState = this.getStateAt(pastTime);

    // 過去の状態で判定
    const winner = this.determineWinner(pastState, data);

    return winner;
  }

  private getStateAt(timestamp: number): RoomState {
    // 二分探索で該当時刻の状態を取得
    return this.stateHistory.find(s =>
      Math.abs(s.timestamp - timestamp) < 10
    ) || this.currentState;
  }
}
```

---

## 📊 技術比較表

| 技術 | このプロジェクト | FPS主流 | 実装難易度 | 効果 |
|-----|---------------|---------|----------|------|
| **Client Prediction** | ❌ | ✅ 必須 | ⭐⭐⭐ | ラグ隠蔽 |
| **Server Reconciliation** | ❌ | ✅ 必須 | ⭐⭐⭐⭐ | 予測修正 |
| **Lag Compensation** | ⚠️ 簡易版 | ✅ Rewind方式 | ⭐⭐⭐⭐⭐ | 公平性 |
| **Entity Interpolation** | ❌ | ✅ 必須 | ⭐⭐⭐ | 滑らか表示 |
| **Snapshot Compression** | ❌ | ✅ 必須 | ⭐⭐⭐⭐ | 帯域削減 |
| **Adaptive Tick Rate** | ❌ | ✅ オプション | ⭐⭐⭐ | 最適化 |

---

## 🎯 まとめ

### このプロジェクトの位置づけ

**現在**: Simple Authoritative Server
- サーバーが全権限を持つ
- クライアントは入力送信と結果表示のみ
- 2人対戦なので十分実用的

**FPSとの違い**:
- FPSは数十人同時プレイ
- 常に移動・射撃が発生
- 1フレーム(16ms)単位の精度が必要

### 学習の順序

1. **Client-Side Prediction** ← まずここから
2. **Entity Interpolation**
3. **Server Reconciliation**
4. **Lag Compensation (Rewind)**
5. **Snapshot Compression**

### 参考リソース

- [Valve's Networking Guide](https://developer.valvesoftware.com/wiki/Source_Multiplayer_Networking)
- [Gabriel Gambetta's Fast-Paced Multiplayer](https://www.gabrielgambetta.com/client-server-game-architecture.html)
- [Riot Games: Valorant Netcode](https://technology.riotgames.com/news/valorants-128-tick-servers)
- [GDC: I Shot You First!](https://www.youtube.com/watch?v=6EwaW2iz4iA)

このプロジェクトは基礎を学ぶには最適で、FPSはその発展形です！
