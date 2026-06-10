<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://img.shields.io/badge/CupAI-World_Cup_AI_Analysis-2563eb?style=for-the-badge&logo=soccer&logoColor=white">
    <img alt="CupAI Logo" src="https://img.shields.io/badge/CupAI-World_Cup_AI_Analysis-2563eb?style=for-the-badge&logo=soccer&logoColor=white">
  </picture>
</p>

<h1 align="center">🏆 CupAI</h1>
<p align="center">
  <strong>ワールドカップ カスタムAI 試合分析プラットフォーム</strong><br>
  <em>世界杯自定义 AI 赛事分析预测平台</em>
</p>

<p align="center">
  <a href="https://cupai.asia/"><img src="https://img.shields.io/badge/Live_Demo-cupai.asia-2563eb?style=flat-square&logo=globe&logoColor=white" alt="Live Demo"></a>
  <a href="https://github.com/XieWxx/cupai/blob/main/LICENSE"><img src="https://img.shields.io/github/license/XieWxx/cupai?style=flat-square&color=2563eb" alt="License"></a>
  <a href="#"><img src="https://img.shields.io/badge/Vue-3.x-4FC08D?style=flat-square&logo=vuedotjs&logoColor=white" alt="Vue"></a>
  <a href="#"><img src="https://img.shields.io/badge/NestJS-latest-E0234E?style=flat-square&logo=nestjs&logoColor=white" alt="NestJS"></a>
  <a href="#"><img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript"></a>
  <a href="#"><img src="https://img.shields.io/badge/MySQL-8.0-4479A1?style=flat-square&logo=mysql&logoColor=white" alt="MySQL"></a>
  <a href="#"><img src="https://img.shields.io/badge/Redis-latest-DC382D?style=flat-square&logo=redis&logoColor=white" alt="Redis"></a>
  <a href="#"><img src="https://img.shields.io/badge/Docker-Supported-2496ED?style=flat-square&logo=docker&logoColor=white" alt="Docker"></a>
</p>

<p align="center">
  🌐 多言語 README /
  <a href="./README.zh-CN.md">🇨🇳 中文</a> ·
  <a href="./README.en-US.md">🇬🇧 English</a> ·
  <a href="./README.es-ES.md">🇪🇸 Español</a> ·
  <a href="./README.fr-FR.md">🇫🇷 Français</a> ·
  <a href="./README.pt-BR.md">🇧🇷 Português</a> ·
  <a href="./README.ar-SA.md">🇸🇦 العربية</a> ·
  <a href="./README.ja-JP.md">🇯🇵 日本語</a> ·
  <a href="./README.ko-KR.md">🇰🇷 한국어</a>
</p>

---

## プロジェクト概要

**CupAI** は、世界中のサッカーファン向けの**純データ駆動 + ユーザープライベートAI** ワールドカップ試合分析プラットフォームです。プラットフォーム自体はAI生成機能を内蔵せず、「包括的な試合データプロバイダー + 分析ツールキャリア」として位置づけています。完全でリアルタイムかつ正確な試合の基礎データを出力し、ユーザーが独自のプライベートLLMを設定し、Promptをカスタマイズし、試合ファクターの重みを調整して、自律的に試合の深い分析を行います。

### 主要な差別化ポイント

| 特徴 | 説明 |
|------|------|
| 🔑 **ユーザープライベートLLM** | Doubao、DeepSeek、GPT、Qwenなどに対応 — ユーザーがAPIキーを持ち込み、プラットフォームのAIコストはゼロ |
| 🧩 **カスタムPromptマーケット** | Promptテンプレートの作成・共有・再利用 — 最高のサッカー分析テンプレートライブラリを構築 |
| ⚖️ **ファクター重みの自由調整** | 8つの分析ファクターカテゴリを0%-100%で自由に配分 — 独自の分析モデルを構築 |
| 🤖 **AIエージェント自動推論** | 5つの独自アルゴリズムで駆動 — 手動操作なしで完全自動の試合分析 |
| 🌍 **8言語インターナショナライゼーション** | zh-CN / en-US / es-ES / fr-FR / pt-BR / ar-SA / ja-JP / ko-KR — ワールドカップ主要参加国をカバー |
| 🛡️ **完全コンプライアンスのスポーツ分析** | ギャンブルなし、賭けなし — 純粋な戦術レビューとデータ駆動の推論 |

---

## 技術スタック

| レイヤー | 技術 | 用途 |
|----------|------|------|
| 🖥️ **フロントエンド** | Vue 3 + Vite + Element Plus | レスポンシブUI、データダッシュボード、ランキング |
| ⚡ **リアルタイム** | Socket.io | ライブスコア、即時プッシュ通知 |
| 📊 **チャート** | ECharts | 精度トレンド、重み分布、センチメントスコア |
| 🌐 **i18n** | vue-i18n (8言語) | 多言語、マルチタイムゾーン、グローバル適応 |
| 🔧 **バックエンド** | NestJS + TypeORM (TypeScript) | モジュラーAPI、AIリレー、データ処理 |
| 🗄️ **データベース** | MySQL 8.0 | 構造化データ：ユーザー、テンプレート、レポート、ランキング |
| ⚡ **キャッシュ** | Redis | リアルタイムキャッシュ、APIレート制限、ホットデータ |
| ⏰ **スケジューラ** | node-schedule | エージェント自動スキャン、レポート生成、データ検査 |
| 🌐 **データソース** | BSD API | 試合/チーム/順位表/オッズのリアルタイム同期 |
| 🐳 **デプロイ** | Docker + Docker Compose + Nginx | ワンクリックデプロイ、リバースプロキシ、SSL |

---

## クイックスタート

### 前提条件

- **Node.js** >= 18.x
- **MySQL** >= 8.0
- **Redis** >= 6.x
- **Docker** & **Docker Compose** (オプション)

### Docker ワンクリックデプロイ

```bash
git clone https://github.com/XieWxx/cupai.git
cd cupai
cp .env.example .env
docker compose up -d
```

ブラウザでアクセス: `http://localhost:3000`

### ローカル開発

```bash
pnpm install
pnpm dev:server   # バックエンド起動（ポート 3002）
pnpm dev:web      # フロントエンド起動（ポート 5173）
```

> 初回起動時は `apps/server/.env` の設定が必要です（`.env.example` を参照）。MySQL と Redis が実行中であることを確認してください

---

## プロジェクト構成

```
cupai/
├── apps/
│   ├── web/                   # フロントエンド (Vue 3 + Vite)
│   │   └── src/
│   │       ├── views/         # ページ (12のコアビュー)
│   │       ├── stores/        # Pinia ステート管理
│   │       ├── locales/       # 8言語i18n
│   │       ├── api/           # APIリクエスト層 + WebSocket
│   │       └── components/    # 共通コンポーネント
│   └── server/                # バックエンド (NestJS)
│       └── src/
│           ├── modules/       # 8つのビジネスモジュール
│           │   ├── user/      # ユーザーモジュール
│           │   ├── ai/        # AIリレーモジュール
│           │   ├── match/     # 試合データ + 順位表 + センチメント
│           │   ├── prompt/    # Promptマーケット + バリデーション
│           │   ├── ranking/   # ランキング
│           │   ├── agent/     # エージェント + インタラクション + 分析
│           │   ├── bsd/       # BSDデータソース同期
│           │   └── risk/      # リスク管理 + 機密語句
│           ├── config/        # Redis + レート制限設定
│           └── common/        # ガード + フィルター
├── packages/
│   ├── types/                 # 統一型定義
│   ├── constants/             # ビジネス定数
│   └── utils/                 # 共通ユーティリティ関数
├── docs/                      # APIドキュメント + データソースソリューション
├── docker/                    # Nginx設定
├── deploy/                    # init.sql シードデータ
└── docker-compose.yml
```

---

## バージョンロードマップ

### V1.0 — 基盤版 ✅

- [x] Monorepoプロジェクト構造 (pnpm workspace)
- [x] フロントエンド・バックエンドスケルトン (Vue3 + NestJS + TypeScript)
- [x] ユーザー登録/ログイン/JWT認証
- [x] AI設定管理 (マルチモデルAPIキー暗号化)
- [x] 重みモデル管理 (8ファクターカスタマイズ)
- [x] PromptテンプレートCRUD + マーケット基盤
- [x] 試合データセンター (チーム/選手/履歴/環境)
- [x] 手動分析生成 + パブリック/プライベートアクセス制御
- [x] 分析スクエア基本機能
- [x] Dockerデプロイソリューション

### V1.1 — エコシステム強化版 ✅

- [x] Redisキャッシュによるインメモリキャッシュ置き換え
- [x] APIレート制限ガード (3段階戦略)
- [x] AI分析フルループ (Prompt組み立て → AI呼び出し → レポート保存)
- [x] コミュニティいいね/お気に入りインタラクション
- [x] ランキングシステム (ユーザーランキング + モデルランキング)
- [x] エージェントスケジュールタスクによる実際のAI呼び出し
- [x] エージェント認可プロトコル + 手動トリガー
- [x] リスク管理強化: AIコンテンツ二次レビュー + 機密語句の永続化
- [x] フロントエンドダークテーマ + WebSocketリアルタイムプッシュ

### V1.2 — 体験深化版 ✅

- [x] 試合詳細ページ強化 (スコアボード + 8ファクターデータ + データソーストレーサビリティ)
- [x] Promptテンプレートバリデーション (変数検出 + プレビュー + 作成時検証)
- [x] 順位表機能 (グループポイント + 決勝進出シナリオ分析)
- [x] ユーザーお気に入り管理
- [x] 分析スクエアMarkdownレンダリング + 重みスナップショットトレーサビリティ
- [x] i18n 8言語拡張 (zh/en/es/fr/pt/ar/ja/ko)
- [x] 多言語READMEファイル

### V1.3 — データ駆動版 ✅

- [x] BSDデータソース統合（試合/チーム/順位表/オッズのリアルタイム同期）
- [x] センチメント分析モジュール（センチメント概要 + タイムライン + 多次元集約）
- [x] フロントエンドのバックエンドリアルAPIへの完全接続（Mockをデフォルトから削除）
- [x] APIドキュメントの標準化（api-spec.md v1.5）
- [x] 試合詳細ページのバックエンド完全データ（AI予測 + センチメント + 次元レポート + 選手スタメン）

### V1.4 — グローバル完全版 (計画中)

- [ ] 海外センチメントの精密識別
- [ ] クロスボーダーコンプライアンス体制の整備
- [ ] データ監視・アラート、異常自動復旧

---

## コントリビューション

コミュニティからの貢献を歓迎します！コード、ドキュメント、翻訳、バグレポートなど、すべての貢献が貴重です。

### 貢献方法

1. このリポジトリを **Fork** する
2. フィーチャーブランチを作成: `git checkout -b feat/amazing-feature`
3. 変更をコミット: `git commit -m 'feat: add amazing feature'`
4. ブランチをプッシュ: `git push origin feat/amazing-feature`
5. **Pull Request** を提出

> 詳細な貢献ガイドラインは [CONTRIBUTING.md](./CONTRIBUTING.md) を参照
> 貢献前に [行動規範](./CODE_OF_CONDUCT.md) をお読みください

### 貢献分野

| 分野 | 説明 |
|------|------|
| 💻 **コード開発** | フロントエンド/バックエンド機能開発、アルゴリズム最適化、バグ修正 |
| 🎨 **UI/UXデザイン** | ページデザインの改善、インタラクション体験の向上 |
| 🌍 **インターナショナライゼーション** | 8言語の翻訳と校正 |
| 📝 **ドキュメント** | 開発ガイド、使用チュートリアル |
| 🧪 **テスト** | ユニットテスト、E2Eテスト、パフォーマンステスト |
| 🐛 **バグレポート** | Issueの提出、問題の再現 |
| 📣 **コミュニティ** | Promptテンプレートの貢献、コミュニティコンテンツの共有 |

### コントリビューター

<a href="https://github.com/XieWxx/cupai/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=XieWxx/cupai" />
</a>

---

## コンプライアンス声明

本プラットフォームのすべてのAI分析結果は**スポーツデータのエンターテインメント分析と戦術的参考のみを目的**としており、賭け、ギャンブル、または試合結果予測の助言を構成するものではありません。プラットフォームはギャンブル関連の用語と機能を完全にブロックしています。ユーザー生成コンテンツはすべてリスク管理により自動レビューされ、中国の法律規制およびGDPRプライバシーコンプライアンス要件に完全に準拠しています。

---

## 💖 スポンサー / 寄付

CupAI がお役に立ちましたら、継続的な開発のために少額の寄付をご検討ください ☕
ご寄付はすべて、BSD データ API の更新、サーバー維持、コミュニティ運営に充てられます。

| WeChat Pay | Alipay |
| :---: | :---: |
| ![WeChat Pay](./weixin.JPG) | ![Alipay](./zhifubao.JPG) |

> ⚠️ 寄付は完全に任意であり、追加の権利や商業的コミットメントを伴うものではありません。
> プラットフォームは **賭けなし・ギャンブルなし** のポリシーを堅持しています。

---

## ライセンス

このプロジェクトは [Apache License 2.0](./LICENSE) の下でライセンスされています。

CupAI © 2024-2026 — CupAIコミュニティとコントリビューターによって ❤️ で作られました。

---

<p align="center">
  <sub>このプロジェクトが役に立ったら、⭐ Star をお願いします！</sub>
  <br><br>
  <a href="https://star-history.com/#XieWxx/cupai&Date">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/svg?repos=XieWxx/cupai&type=Date&theme=dark" />
      <img width="500" alt="Star History Chart" src="https://api.star-history.com/svg?repos=XieWxx/cupai&type=Date" />
    </picture>
  </a>
</p>
