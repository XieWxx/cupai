<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://img.shields.io/badge/CupAI-World_Cup_AI_Analysis-2563eb?style=for-the-badge&logo=soccer&logoColor=white">
    <img alt="CupAI Logo" src="https://img.shields.io/badge/CupAI-World_Cup_AI_Analysis-2563eb?style=for-the-badge&logo=soccer&logoColor=white">
  </picture>
</p>

<h1 align="center">🏆 CupAI</h1>
<p align="center">
  <strong>Plateforme d'Analyse de Matchs de Coupe du Monde avec IA Personnalisée</strong><br>
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
  🌐 README Multilingue /
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

## Présentation du Projet

**CupAI** est une plateforme d'analyse de matchs de Coupe du Monde **purement basée sur les données + IA privée de l'utilisateur** destinée aux fans de football du monde entier. La plateforme n'inclut pas de capacités de génération d'IA intégrées ; elle se positionne plutôt comme un « fournisseur complet de données de matchs + support d'outils d'analyse ». Elle fournit des données sous-jacentes complètes, en temps réel et précises sur les matchs, tandis que les utilisateurs configurent leurs propres LLMs privés, personnalisent les Prompts, ajustent les pondérations des facteurs de match et réalisent indépendamment des analyses approfondies des rencontres.

### Différenciateurs Clés

| Caractéristique | Description |
|-----------------|-------------|
| 🔑 **LLMs Privés de l'Utilisateur** | Compatible avec Doubao, DeepSeek, GPT, Qwen et plus — les utilisateurs fournissent leurs propres clés API, coût IA nul pour la plateforme |
| 🧩 **Marché de Prompts Personnalisés** | Créez, partagez et réutilisez des modèles de Prompt — constituant la meilleure bibliothèque de modèles d'analyse footballistique |
| ⚖️ **Pondérations de Facteurs Ajustables** | 8 catégories de facteurs d'analyse avec allocation libre de 0%-100% — construisez votre propre modèle d'analyse |
| 🤖 **Raisonnement Automatisé par Agent IA** | Propulsé par 5 algorithmes propriétaires — analyse de match entièrement automatisée sans opération manuelle |
| 🌍 **Internationalisation en 8 Langues** | zh-CN / en-US / es-ES / fr-FR / pt-BR / ar-SA / ja-JP / ko-KR — couvrant les principales nations de la Coupe du Monde |
| 🛡️ **Analyse Sportive Totalement Conforme** | Pas de paris, pas de jeux d'argent — revue tactique pure et raisonnement basé sur les données |

---

## Stack Technique

| Couche | Technologie | Objectif |
|--------|------------|----------|
| 🖥️ **Frontend** | Vue 3 + Vite + Element Plus | UI réactive, tableaux de bord, classements |
| ⚡ **Temps Réel** | Socket.io | Scores en direct, notifications push instantanées |
| 📊 **Graphiques** | ECharts | Tendances de précision, distribution des poids, scores de sentiment |
| 🌐 **i18n** | vue-i18n (8 langues) | Multilingue, multi-fuseau horaire, adaptation mondiale |
| 🔧 **Backend** | NestJS + TypeORM (TypeScript) | APIs modulaires, relais IA, traitement des données |
| 🗄️ **Base de Données** | MySQL 8.0 | Données structurées : utilisateurs, modèles, rapports, classements |
| ⚡ **Cache** | Redis | Cache en temps réel, limitation d'API, données chaudes |
| ⏰ **Planificateur** | node-schedule | Scan automatique de l'Agent, génération de rapports, inspection des données |
| 🐳 **Déploiement** | Docker + Docker Compose + Nginx | Déploiement en un clic, proxy inverse, SSL |

### 5 Algorithmes Propriétaires

| Algorithme | Fonction |
|-----------|----------|
| 📐 Normalisation Dynamique des Poids | Normalisation automatique en virgule flottante après pondérations définies par l'utilisateur — prévient les déséquilibres d'allocation |
| 🎯 Réglage Adaptatif par Scénario | L'Agent identifie automatiquement le niveau du match / attributs de l'équipe / caractéristiques de la confrontation — ajuste les poids dynamiquement |
| 🔇 Débruitage Multidimensionnel et Confiance | Filtre les données invalides, gradue les niveaux de confiance, élimine les valeurs aberrantes |
| 📊 Quantification du Sentiment Social | Score de polarité de sentiment (-10~10), indice de pression publique, notation de concentration |
| ⚖️ Correction d'Équilibre Multifactoriel | Équilibre mutuel et correction complémentaire multifactoriel — évite la mauvaise orientation par donnée unique |

---

## Démarrage Rapide

### Prérequis

- **Node.js** >= 18.x
- **MySQL** >= 8.0
- **Redis** >= 6.x
- **Docker** & **Docker Compose** (facultatif)

### Déploiement Docker en un Clic

```bash
git clone https://github.com/XieWxx/cupai.git
cd cupai
cp .env.example .env
docker compose up -d
```

Visitez dans le navigateur : `http://localhost:3000`

### Développement Local

```bash
pnpm install

# Démarrer le backend
cd apps/server && pnpm dev

# Démarrer le frontend
cd apps/web && pnpm dev
```

---

## Structure du Projet

```
cupai/
├── apps/
│   ├── web/                   # Frontend (Vue 3 + Vite)
│   │   └── src/
│   │       ├── views/         # Pages (8 vues principales)
│   │       ├── stores/        # Gestion d'état Pinia
│   │       ├── locales/       # i18n en 8 langues
│   │       ├── api/           # Couche de requêtes API + WebSocket
│   │       └── components/    # Composants partagés
│   └── server/                # Backend (NestJS)
│       └── src/
│           ├── modules/       # 7 modules métier
│           │   ├── user/      # Module utilisateurs
│           │   ├── ai/        # Module relais IA
│           │   ├── match/     # Données de matchs + classements
│           │   ├── prompt/    # Marché de Prompts + validation
│           │   ├── ranking/   # Classements
│           │   ├── agent/     # Agent + interaction + analyse
│           │   └── risk/      # Contrôle des risques + mots sensibles
│           ├── config/        # Configuration Redis + limitation
│           └── common/        # Guards + filtres
├── packages/
│   ├── types/                 # Définitions de types unifiées
│   ├── constants/             # Constantes métier
│   └── utils/                 # 5 algorithmes propriétaires
├── docker/                    # Configuration Nginx
├── deploy/                    # Données initiales init.sql
└── docker-compose.yml
```

---

## Feuille de Route des Versions

### V1.0 — Version Fondamentale ✅

- [x] Structure de projet Monorepo (pnpm workspace)
- [x] Skeleton frontend et backend (Vue3 + NestJS + TypeScript)
- [x] Inscription/connexion/authentification JWT des utilisateurs
- [x] Gestion de configuration IA (chiffrement de clés API multi-modèles)
- [x] Gestion des modèles de pondération (8 facteurs personnalisables)
- [x] CRUD de modèles Prompt + bases du marché
- [x] Centre de données de matchs (équipes/joueurs/historique/environnement)
- [x] Génération manuelle d'analyses + contrôle d'accès public/privé
- [x] Fonctionnalités de base de la place d'analyse
- [x] Solution de déploiement Docker

### V1.1 — Amélioration de l'Écosystème ✅

- [x] Cache Redis remplaçant le cache en mémoire
- [x] Garde de limitation d'API (stratégie à 3 niveaux)
- [x] Boucle complète d'analyse IA (assembler Prompt → appeler IA → sauvegarder rapport)
- [x] Interaction communautaire likes/favoris
- [x] Système de classements (classement utilisateurs + classement modèles)
- [x] Tâches planifiées de l'Agent avec appels réels à l'IA
- [x] Protocole d'autorisation de l'Agent + déclenchement manuel
- [x] Amélioration du contrôle des risques : revue secondaire du contenu IA + mots sensibles persistants
- [x] Thème sombre du frontend + push en temps réel WebSocket

### V1.2 — Expérience Approfondie ✅

- [x] Amélioration de la page de détails du match (tableau des scores + données 8 facteurs + traçabilité de la source)
- [x] Validation des modèles Prompt (détection de variables + aperçu + validation à la création)
- [x] Fonctionnalité de classements (points de groupe + analyse des scénarios de qualification)
- [x] Gestion des favoris utilisateur
- [x] Rendu Markdown sur la place d'analyse + traçabilité des instantanés de poids
- [x] Expansion i18n à 8 langues (zh/en/es/fr/pt/ar/ja/ko)
- [x] Fichiers README multilingues

### V1.3 — Édition Globale Complète (Planifié)

- [ ] Identification précise du sentiment international
- [ ] Perfectionnement du système de conformité transfrontalière
- [ ] Surveillance des données et alertes, récupération automatique des anomalies
- [ ] Provisionnement des fonctionnalités commerciales

---

## Contribuer

Nous accueillons chaleureusement les contributions de la communauté ! Que ce soit du code, de la documentation, des traductions ou des rapports de bugs — chaque contribution compte.

### Comment Contribuer

1. **Forkez** ce dépôt
2. Créez une branche de fonctionnalité : `git checkout -b feat/amazing-feature`
3. Validez vos modifications : `git commit -m 'feat: add amazing feature'`
4. Poussez la branche : `git push origin feat/amazing-feature`
5. Soumettez une **Pull Request**

> Pour des directives de contribution détaillées, consultez [CONTRIBUTING.md](./CONTRIBUTING.md)
> Veuillez lire le [Code de Conduite](./CODE_OF_CONDUCT.md) avant de contribuer

### Domaines de Contribution

| Domaine | Description |
|---------|-------------|
| 💻 **Développement Code** | Développement de fonctionnalités frontend/backend, optimisation d'algorithmes, corrections de bugs |
| 🎨 **Design UI/UX** | Améliorations de design de pages, améliorations d'expérience d'interaction |
| 🌍 **Internationalisation** | Traduction et relecture pour 8 langues |
| 📝 **Documentation** | Guides de développement, tutoriels d'utilisation |
| 🧪 **Tests** | Tests unitaires, tests E2E, tests de performance |
| 🐛 **Rapports de Bugs** | Soumission d'issues, reproduction de problèmes |
| 📣 **Communauté** | Contributions de modèles Prompt, partage de contenu communautaire |

### Contributeurs

<a href="https://github.com/XieWxx/cupai/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=XieWxx/cupai" />
</a>

---

## Déclaration de Conformité

Tous les résultats d'analyse IA sur cette plateforme sont **uniquement destinés à l'analyse de divertissement de données sportives et à la référence tactique**, et ne constituent aucun conseil de paris, de jeux d'argent ou de prédiction de résultats. La plateforme bloque entièrement les termes et fonctionnalités liés aux paris. Tout le contenu généré par les utilisateurs est automatiquement examiné par le contrôle des risques, en pleine conformité avec les lois et réglementations chinoises ainsi qu'avec les exigences de conformité RGPD.

---

## Licence

Ce projet est sous licence [Apache License 2.0](./LICENSE).

CupAI © 2024-2026 — Fait avec ❤️ par la communauté CupAI et ses contributeurs.

---

<p align="center">
  <sub>Si ce projet vous est utile, merci de nous donner une ⭐ Star !</sub>
  <br><br>
  <a href="https://star-history.com/#XieWxx/cupai&Date">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/svg?repos=XieWxx/cupai&type=Date&theme=dark" />
      <img width="500" alt="Star History Chart" src="https://api.star-history.com/svg?repos=XieWxx/cupai&type=Date" />
    </picture>
  </a>
</p>
