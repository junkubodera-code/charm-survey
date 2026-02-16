# CharmSurvey ステップ2：サーバーセットアップガイド

## 📋 概要

このガイドでは、CharmSurvey を本番環境（`https://charm-inc.jp/`）でデプロイする方法を説明します。

---

## 🛠️ 必要な環境

- Node.js (v16 以上)
- PostgreSQL (v12 以上)
- npm
- Heroku アカウント（またはその他のデプロイサービス）

---

## 📝 ステップ 1：ローカル開発環境のセットアップ

### 1.1 ファイルの準備

以下のファイルが同じフォルダにあることを確認してください：
```
charm-survey/
├── server.js
├── database.js
├── package.json
├── .env.example
└── charm_survey_v6.html
```

### 1.2 環境変数の設定

`.env.example` をコピーして `.env` ファイルを作成します：

```bash
cp .env.example .env
```

`.env` ファイルを編集して、PostgreSQL の認証情報を設定します：

```env
PORT=3000
DOMAIN=https://charm-inc.jp
DB_USER=postgres
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=charm_survey
NODE_ENV=development
```

### 1.3 依存パッケージのインストール

```bash
npm install
```

### 1.4 PostgreSQL データベースの作成

PostgreSQL に接続して、データベースを作成します：

```bash
psql -U postgres

# PostgreSQL プロンプト内で：
CREATE DATABASE charm_survey;
CREATE USER charm_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE charm_survey TO charm_user;
\q
```

### 1.5 ローカルで実行

```bash
npm start
```

ブラウザで `http://localhost:3000` にアクセスして、管理画面が表示されることを確認します。

---

## 🚀 ステップ 2：本番環境へのデプロイ（Heroku）

### 2.1 Heroku にサインアップ

[Heroku](https://www.heroku.com/) でアカウントを作成し、Heroku CLI をインストールします。

```bash
# Heroku CLI のインストール
curl https://cli-assets.heroku.com/install.sh | sh

# ログイン
heroku login
```

### 2.2 Heroku アプリの作成

```bash
heroku create charm-survey
```

### 2.3 PostgreSQL アドオンの追加

```bash
heroku addons:create heroku-postgresql:hobby-dev -a charm-survey
```

このコマンドで自動的に `DATABASE_URL` が環境変数に設定されます。

### 2.4 環境変数の設定

```bash
heroku config:set DOMAIN=https://charm-inc.jp -a charm-survey
heroku config:set NODE_ENV=production -a charm-survey
```

### 2.5 デプロイ

```bash
git push heroku main
```

または、GitHub と連携している場合：

```bash
heroku apps:connected-apps
```

### 2.6 データベースの初期化

```bash
heroku run node -e "require('./database.js')" -a charm-survey
```

### 2.7 本番環境の確認

```bash
heroku open -a charm-survey
```

---

## 🔗 カスタムドメインの設定

### 3.1 Heroku でカスタムドメインを設定

```bash
heroku domains:add charm-inc.jp -a charm-survey
heroku domains:add www.charm-inc.jp -a charm-survey
```

### 3.2 DNS 設定

Charm のドメインプロバイダー（GoDaddy、Namecheap など）で以下の CNAME レコードを追加します：

```
charm-inc.jp   CNAME   charm-survey.herokuapp.com
www.charm-inc.jp   CNAME   charm-survey.herokuapp.com
```

DNS が反映されるまで数時間かかります。

### 3.3 SSL/TLS 設定

Heroku は自動的に SSL 証明書（Let's Encrypt）を生成・更新します。

---

## ✅ テストチェックリスト

- [ ] `https://charm-inc.jp/` にアクセスできる
- [ ] 「⚙️ 設定」セクションでドメイン名が表示される
- [ ] 企業を作成できる
- [ ] 回答者用リンクが生成される
- [ ] QR コードが表示される
- [ ] 「📋 プレビュー」をクリックすると回答画面が開く
- [ ] 回答を送信できる
- [ ] 管理画面で回答データが表示される

---

## 🐛 トラブルシューティング

### データベース接続エラー

```
Error: connect ECONNREFUSED
```

**解決策：**
- PostgreSQL が起動しているか確認
- `.env` ファイルの DB 認証情報を確認

### ポート 5432 が既に使用されている

```bash
# 別のポートで PostgreSQL を起動
postgres -D /usr/local/var/postgres -p 5433
```

`.env` で `DB_PORT=5433` に変更してください。

### Heroku デプロイが失敗

```bash
# ログを確認
heroku logs --tail -a charm-survey
```

---

## 📞 サポート

問題が発生した場合は、以下をご確認ください：

1. サーバーログ：`heroku logs --tail`
2. PostgreSQL ログ：`psql -d charm_survey -U charm_user`
3. npm パッケージのバージョン：`npm list`

---

## 🔐 セキュリティ注意事項

- `.env` ファイルを絶対に GitHub にコミットしないでください
- `DB_PASSWORD` は強力なパスワードを使用してください
- 本番環境では `NODE_ENV=production` を設定してください
- HTTPS を使用してください

---

**ステップ2の実装完了！** 🎉

`https://charm-inc.jp/` でクラウドサービスとして利用できるようになりました。
