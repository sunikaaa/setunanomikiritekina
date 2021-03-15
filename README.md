
刹那の見斬り　的なやつ
===
How to Play
dokcer,docker-composeをインストールしてください。
/client/src/plugins/socket.tsファイル内のimport分のすぐ下に存在するIPアドレス（画像内部の白線部）は環境ごとに変更する必要があります。
ローカルならlocalhost
vagrantで起動させたならばvagrantFileに記述したIPアドレス
その他レンタルサーバー等でも同様にIPアドレスを適当に記述してください。

![screenshot 1615837359](https://user-images.githubusercontent.com/48460859/111211808-331cf080-8612-11eb-8f71-b3e8cac531e0.jpg)

その後、ルートディレクトリでdocker-compose upを使用してください。


# これは WebSocket と react を使用したピンクの悪魔の刹那の見斬りをリスペクトしたゲームです。

二人用のゲームです。
ランダムマッチング機能と申請マッチ機能が搭載されています。
## 接続すると以下のようなホーム画面が出てくるので名前を入力後enterかスタートを押してください。
![screenshot 1615836501](https://user-images.githubusercontent.com/48460859/111210005-0cf65100-8610-11eb-8085-7aa80426fe8a.jpg)

## もしあなた以外のプレイヤーが存在する場合、PLAYER欄に現在オンラインのプレイヤーが表示されます。
![screenshot 1615836086](https://user-images.githubusercontent.com/48460859/111210167-4333d080-8610-11eb-8e5c-59e491404c8a.jpg)

## この対戦を申し込むを押した場合押した方は右のように、申し込まれた方は左のように表示されます。
![screenshot 1615836100](https://user-images.githubusercontent.com/48460859/111210348-7bd3aa00-8610-11eb-9be4-9349dd8d307c.jpg)

## 実際の対戦画面はこのようになってます。

![screenshot 1615836145](https://user-images.githubusercontent.com/48460859/111210442-99a10f00-8610-11eb-9609-673b044e42e1.jpg)

![screenshot 1615836124](https://user-images.githubusercontent.com/48460859/111210526-b2112980-8610-11eb-8f31-ca586bece497.jpg)

## ランダムマッチ
ランダムマッチ待機中は以下のような感じです。
![screenshot 1615836213](https://user-images.githubusercontent.com/48460859/111210674-dec54100-8610-11eb-9a9e-b207a463e3a8.jpg)
### 対戦相手が見つかると
対戦相手が見つかるとこのように表示されます。お互いに準備完了を押すと上記の対戦画面へと移ります。
![screenshot 1615836163](https://user-images.githubusercontent.com/48460859/111210792-04524a80-8611-11eb-83d7-db5736a9fa67.jpg)

##　対戦中、または対戦待機中、ほかのプレイヤーにはこのように表示されます。
![screenshot 1615836171](https://user-images.githubusercontent.com/48460859/111211024-48dde600-8611-11eb-8164-8556e0cadcd2.jpg)
![screenshot 1615836219](https://user-images.githubusercontent.com/48460859/111211036-4aa7a980-8611-11eb-9d0a-07172b05d1e0.jpg)
