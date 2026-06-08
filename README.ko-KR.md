<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://img.shields.io/badge/CupAI-World_Cup_AI_Analysis-2563eb?style=for-the-badge&logo=soccer&logoColor=white">
    <img alt="CupAI Logo" src="https://img.shields.io/badge/CupAI-World_Cup_AI_Analysis-2563eb?style=for-the-badge&logo=soccer&logoColor=white">
  </picture>
</p>

<h1 align="center">🏆 CupAI</h1>
<p align="center">
  <strong>월드컵 커스텀 AI 경기 분석 플랫폼</strong><br>
  <em>世界杯自定义 AI 赛事分析预测平台</em>
</p>

<p align="center">
  <a href="https://github.com/XieWxx/cupai/blob/main/LICENSE"><img src="https://img.shields.io/github/license/XieWxx/cupai?style=flat-square&color=2563eb" alt="License"></a>
  <a href="#"><img src="https://img.shields.io/badge/Vue-3.x-4FC08D?style=flat-square&logo=vuedotjs&logoColor=white" alt="Vue"></a>
  <a href="#"><img src="https://img.shields.io/badge/NestJS-latest-E0234E?style=flat-square&logo=nestjs&logoColor=white" alt="NestJS"></a>
  <a href="#"><img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript"></a>
  <a href="#"><img src="https://img.shields.io/badge/MySQL-8.0-4479A1?style=flat-square&logo=mysql&logoColor=white" alt="MySQL"></a>
  <a href="#"><img src="https://img.shields.io/badge/Redis-latest-DC382D?style=flat-square&logo=redis&logoColor=white" alt="Redis"></a>
  <a href="#"><img src="https://img.shields.io/badge/Docker-Supported-2496ED?style=flat-square&logo=docker&logoColor=white" alt="Docker"></a>
</p>

<p align="center">
  🌐 다국어 README /
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

## 프로젝트 소개

**CupAI**는 전 세계 축구 팬을 위한 **순수 데이터 기반 + 사용자 프라이빗 AI** 월드컵 경기 분석 플랫폼입니다. 플랫폼 자체는 AI 생성 기능을 내장하지 않으며, "종합 경기 데이터 제공자 + 분석 도구 캐리어"로 포지셔닝합니다. 완전하고 실시간이며 정확한 경기 기반 데이터를 출력하고, 사용자가 자신의 프라이빗 LLM을 설정하고, Prompt를 커스터마이즈하고, 경기 팩터 가중치를 조정하여 자율적으로 경기를 심층 분석합니다.

### 핵심 차별화 포인트

| 특징 | 설명 |
|------|------|
| 🔑 **사용자 프라이빗 LLM** | Doubao, DeepSeek, GPT, Qwen 등 지원 — 사용자가 API 키를 직접 제공, 플랫폼 AI 비용 제로 |
| 🧩 **커스텀 Prompt 마켓** | Prompt 템플릿 생성, 공유, 재사용 — 최고의 축구 분석 템플릿 라이브러리 구축 |
| ⚖️ **팩터 가중치 자유 조정** | 8개 분석 팩터 카테고리를 0%-100%로 자유 배분 — 나만의 분석 모델 구축 |
| 🤖 **AI 에이전트 자동 추론** | 5개 자체 알고리즘으로 구동 — 수동 조작 없이 완전 자동화된 경기 분석 |
| 🌍 **8개 언어 국제화** | zh-CN / en-US / es-ES / fr-FR / pt-BR / ar-SA / ja-JP / ko-KR — 월드컵 주요 참가국 커버 |
| 🛡️ **완전 컴플라이언스 스포츠 분석** | 도박 없음, 베팅 없음 — 순수 전술 리뷰와 데이터 기반 추론 |

---

## 기술 스택

| 레이어 | 기술 | 용도 |
|--------|------|------|
| 🖥️ **프론트엔드** | Vue 3 + Vite + Element Plus | 반응형 UI, 데이터 대시보드, 랭킹 |
| ⚡ **실시간** | Socket.io | 라이브 스코어, 즉시 푸시 알림 |
| 📊 **차트** | ECharts | 정확도 트렌드, 가중치 분포, 감성 점수 |
| 🌐 **i18n** | vue-i18n (8개 언어) | 다국어, 멀티 타임존, 글로벌 적응 |
| 🔧 **백엔드** | NestJS + TypeORM (TypeScript) | 모듈형 API, AI 릴레이, 데이터 처리 |
| 🗄️ **데이터베이스** | MySQL 8.0 | 구조화된 데이터: 사용자, 템플릿, 보고서, 랭킹 |
| ⚡ **캐시** | Redis | 실시간 캐시, API 속도 제한, 핫 데이터 |
| ⏰ **스케줄러** | node-schedule | 에이전트 자동 스캔, 보고서 생성, 데이터 검사 |
| 🌐 **데이터 소스** | BSD API | 경기/팀/순위표/배당률 실시간 동기화 |
| 🐳 **배포** | Docker + Docker Compose + Nginx | 원클릭 배포, 리버스 프록시, SSL |

---

## 빠른 시작

### 사전 요구 사항

- **Node.js** >= 18.x
- **MySQL** >= 8.0
- **Redis** >= 6.x
- **Docker** & **Docker Compose** (선택 사항)

### Docker 원클릭 배포

```bash
git clone https://github.com/XieWxx/cupai.git
cd cupai
cp .env.example .env
docker compose up -d
```

브라우저에서 접속: `http://localhost:3000`

### 로컬 개발

```bash
pnpm install
pnpm dev:server   # 백엔드 시작 (포트 3002)
pnpm dev:web      # 프론트엔드 시작 (포트 5173)
```

> 첫 실행 시 `apps/server/.env` 설정이 필요합니다 (`.env.example` 참조), MySQL과 Redis가 실행 중인지 확인하세요

---

## 프로젝트 구조

```
cupai/
├── apps/
│   ├── web/                   # 프론트엔드 (Vue 3 + Vite)
│   │   └── src/
│   │       ├── views/         # 페이지 (12개 핵심 뷰)
│   │       ├── stores/        # Pinia 상태 관리
│   │       ├── locales/       # 8개 언어 i18n
│   │       ├── api/           # API 요청 레이어 + WebSocket
│   │       └── components/    # 공유 컴포넌트
│   └── server/                # 백엔드 (NestJS)
│       └── src/
│           ├── modules/       # 8개 비즈니스 모듈
│           │   ├── user/      # 사용자 모듈
│           │   ├── ai/        # AI 릴레이 모듈
│           │   ├── match/     # 경기 데이터 + 순위표 + 감성
│           │   ├── prompt/    # Prompt 마켓 + 검증
│           │   ├── ranking/   # 랭킹
│           │   ├── agent/     # 에이전트 + 인터랙션 + 분석
│           │   ├── bsd/       # BSD 데이터 소스 동기화
│           │   └── risk/      # 리스크 관리 + 민감 단어
│           ├── config/        # Redis + 속도 제한 설정
│           └── common/        # 가드 + 필터
├── packages/
│   ├── types/                 # 통합 타입 정의
│   ├── constants/             # 비즈니스 상수
│   └── utils/                 # 공통 유틸리티 함수
├── docs/                      # API 문서 + 데이터 소스 솔루션
├── docker/                    # Nginx 설정
├── deploy/                    # init.sql 시드 데이터
└── docker-compose.yml
```

---

## 버전 로드맵

### V1.0 — 기반 버전 ✅

- [x] Monorepo 프로젝트 구조 (pnpm workspace)
- [x] 프론트엔드/백엔드 스켈레톤 (Vue3 + NestJS + TypeScript)
- [x] 사용자 등록/로그인/JWT 인증
- [x] AI 설정 관리 (멀티 모델 API 키 암호화)
- [x] 가중치 모델 관리 (8 팩터 커스터마이징)
- [x] Prompt 템플릿 CRUD + 마켓 기반
- [x] 경기 데이터 센터 (팀/선수/히스토리/환경)
- [x] 수동 분석 생성 + 공개/비공개 접근 제어
- [x] 분석 광장 기본 기능
- [x] Docker 배포 솔루션

### V1.1 — 생태계 강화 버전 ✅

- [x] Redis 캐시로 인메모리 캐시 교체
- [x] API 속도 제한 가드 (3단계 전략)
- [x] AI 분석 풀 루프 (Prompt 조립 → AI 호출 → 보고서 저장)
- [x] 커뮤니티 좋아요/즐겨찾기 인터랙션
- [x] 랭킹 시스템 (사용자 랭킹 + 모델 랭킹)
- [x] 에이전트 스케줄 작업으로 실제 AI 호출
- [x] 에이전트 인가 프로토콜 + 수동 트리거
- [x] 리스크 관리 강화: AI 콘텐츠 2차 리뷰 + 민감 단어 영속화
- [x] 프론트엔드 다크 테마 + WebSocket 실시간 푸시

### V1.2 — 경험 심화 버전 ✅

- [x] 경기 상세 페이지 강화 (스코어보드 + 8 팩터 데이터 + 데이터 소스 추적)
- [x] Prompt 템플릿 검증 (변수 감지 + 미리보기 + 생성 시 검증)
- [x] 순위표 기능 (조별 승점 + 진출 시나리오 분석)
- [x] 사용자 즐겨찾기 관리
- [x] 분석 광장 Markdown 렌더링 + 가중치 스냅샷 추적
- [x] i18n 8개 언어 확장 (zh/en/es/fr/pt/ar/ja/ko)
- [x] 다국어 README 파일

### V1.3 — 데이터 기반 버전 ✅

- [x] BSD 데이터 소스 통합 (경기/팀/순위표/배당률 실시간 동기화)
- [x] 감성 분석 모듈 (감성 개요 + 타임라인 + 다차원 집계)
- [x] 프론트엔드의 백엔드 실제 API 완전 연결 (Mock 기본 사용 제거)
- [x] API 문서 표준화 (api-spec.md v1.5)
- [x] 경기 상세 페이지의 백엔드 전체 데이터 (AI 예측 + 감성 + 차원 보고서 + 선수 라인업)

### V1.4 — 글로벌 완전 버전 (계획 중)

- [ ] 해외 감성 정밀 식별
- [ ] 크로스보더 컴플라이언스 체계 정비
- [ ] 데이터 모니터링 및 알림, 이상 자동 복구

---

## 기여하기

커뮤니티의 기여를 환영합니다! 코드, 문서, 번역, 버그 리포트 등 모든 기여가 소중합니다.

### 기여 방법

1. 이 저장소를 **Fork** 합니다
2. 기능 브랜치를 생성합니다: `git checkout -b feat/amazing-feature`
3. 변경 사항을 커밋합니다: `git commit -m 'feat: add amazing feature'`
4. 브랜치를 푸시합니다: `git push origin feat/amazing-feature`
5. **Pull Request**를 제출합니다

> 자세한 기여 가이드라인은 [CONTRIBUTING.md](./CONTRIBUTING.md)를 참조하세요
> 기여하기 전에 [행동 강령](./CODE_OF_CONDUCT.md)을 읽어주세요

### 기여 분야

| 분야 | 설명 |
|------|------|
| 💻 **코드 개발** | 프론트엔드/백엔드 기능 개발, 알고리즘 최적화, 버그 수정 |
| 🎨 **UI/UX 디자인** | 페이지 디자인 개선, 인터랙션 경험 향상 |
| 🌍 **국제화** | 8개 언어 번역 및 교정 |
| 📝 **문서화** | 개발 가이드, 사용 튜토리얼 |
| 🧪 **테스트** | 유닛 테스트, E2E 테스트, 성능 테스트 |
| 🐛 **버그 리포트** | Issue 제출, 문제 재현 |
| 📣 **커뮤니티** | Prompt 템플릿 기여, 커뮤니티 콘텐츠 공유 |

### 기여자

<a href="https://github.com/XieWxx/cupai/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=XieWxx/cupai" />
</a>

---

## 컴플라이언스 성명

본 플랫폼의 모든 AI 분석 결과는 **스포츠 데이터 엔터테인먼트 분석 및 전술적 참고 자료로만 사용**되며, 어떠한 베팅, 도박 또는 경기 결과 예측 조언도 구성하지 않습니다. 플랫폼은 도박 관련 용어와 기능을 완전히 차단합니다. 모든 사용자 생성 콘텐츠는 리스크 관리에 의해 자동 검토되며, 중국 법률 규정 및 GDPR 개인정보 보호 컴플라이언스 요구사항을 완전히 준수합니다.

---

## 💖 후원 / 기부

CupAI가 도움이 되셨다면 지속적인 개발을 위해 소액 기부를 고려해 주세요 ☕
모든 기부는 BSD 데이터 API 갱신, 서버 유지보수 및 커뮤니티 운영에 사용됩니다.

| WeChat Pay | Alipay |
| :---: | :---: |
| ![WeChat Pay](./weixin.JPG) | ![Alipay](./zhifubao.JPG) |

> ⚠️ 기부는 순전히 자발적이며 추가적인 권한이나 상업적 약속을 제공하지 않습니다.
> 플랫폼은 **베팅 제로, 도박 제로** 정책을 견지합니다.

---

## 라이선스

이 프로젝트는 [Apache License 2.0](./LICENSE)에 따라 라이선스가 부여됩니다.

CupAI © 2024-2026 — CupAI 커뮤니티와 기여자들이 ❤️로 만들었습니다.

---

<p align="center">
  <sub>이 프로젝트가 도움이 되셨다면 ⭐ Star를 부탁드립니다!</sub>
  <br><br>
  <a href="https://star-history.com/#XieWxx/cupai&Date">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/svg?repos=XieWxx/cupai&type=Date&theme=dark" />
      <img width="500" alt="Star History Chart" src="https://api.star-history.com/svg?repos=XieWxx/cupai&type=Date" />
    </picture>
  </a>
</p>
