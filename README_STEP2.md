# 📊 CharmSurvey - ステップ2 実装完了

ステップ2が完了しました！以下のファイルが作成されています。

---

## 📁 ファイル一覧

### **サーバーファイル**
- `server.js` - Express メインサーバー
- `database.js` - PostgreSQL 接続・初期化
- `package.json` - npm 依存パッケージ
- `.env.example` - 環境変数テンプレート

### **フロントエンド**
- `charm_survey_v6.html` - 管理画面 + 回答画面（v7）

### **ドキュメント**
- `SETUP_GUIDE.md` - デプロイ手順書（このファイルを読んでください）
- `README_STEP2.md` - このファイル

---

## 🚀 クイックスタート

### **ローカルで試す（開発用）**

```bash
# 1. 依存パッケージをインストール
npm install

# 2. .env ファイルを作成（.env.example をコピー）
cp .env.example .env

# 3. PostgreSQL データベースを作成
psql -U postgres -c "CREATE DATABASE charm_survey;"

# 4. サーバーを起動
npm start

# 5. ブラウザで http://localhost:3000 を開く
```

### **本番環境にデプロイ（Heroku）**

詳しくは `SETUP_GUIDE.md` をご覧ください。

```bash
heroku create charm-survey
heroku addons:create heroku-postgresql:hobby-dev
git push heroku main
heroku open
```

---

## 🎯 機能一覧

### **管理画面**
- ✅ ⚙️ 設定：ドメイン名を入力
- ✅ 企業管理：企業の作成・選択
- ✅ 回答者管理：回答者用リンク生成、QRコード
- ✅ 質問管理：質問の編集
- ✅ レポート：6スライド形式のレポート

### **回答者画面**
- ✅ 回答者情報入力
- ✅ Q1～Q5 の質問に回答
- ✅ テキスト回答 + 5段階評価
- ✅ 回答送信

### **API エンドポイント**
- `GET /api/companies` - 企業一覧
- `POST /api/companies` - 企業作成
- `GET /api/companies/:companyId/responders` - 回答者一覧
- `POST /api/survey/submit` - 回答送信
- `GET /api/reports/:companyId` - レポート統計

---

## 📝 次のステップ

1. **SETUP_GUIDE.md を読む** - デプロイ手順の詳細
2. **ローカルでテストする** - 機能確認
3. **本番環境にデプロイ** - `https://charm-inc.jp/` で公開

---

## 🔧 カスタマイズ（オプション）

### **新しい質問を追加**
`database.js` の `insertDefaultQuestions()` 関数を編集してください。

### **データベースをリセット**
```bash
npm run reset-db
```

### **ドメイン名を変更**
`.env` ファイルの `DOMAIN` を変更してください。

---

## ⚠️ 重要な注意事項

- `.env` ファイルを GitHub にコミットしないでください
- `DB_PASSWORD` は強力なパスワードを設定してください
- 本番環境では `NODE_ENV=production` を設定してください

---

## ✅ 動作確認チェックリスト

以下が完了すれば、クラウドサービスとして利用可能です：

- [ ] ローカルで `npm start` が成功
- [ ] 管理画面が `http://localhost:3000` で表示される
- [ ] ドメイン名を入力できる
- [ ] 回答者用リンクが生成される
- [ ] リンクをクリックして回答画面が開く
- [ ] 回答を送信できる
- [ ] 管理画面で回答が表示される
- [ ] 本番環境（Heroku）へのデプロイが成功
- [ ] `https://charm-inc.jp/` でアクセス可能

---

**すべてが完了したら、CharmSurvey のクラウドサービスが完成です！** 🎉

ご質問やトラブルがあれば、お知らせください。
