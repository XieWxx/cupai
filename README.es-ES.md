<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://img.shields.io/badge/CupAI-World_Cup_AI_Analysis-2563eb?style=for-the-badge&logo=soccer&logoColor=white">
    <img alt="CupAI Logo" src="https://img.shields.io/badge/CupAI-World_Cup_AI_Analysis-2563eb?style=for-the-badge&logo=soccer&logoColor=white">
  </picture>
</p>

<h1 align="center">🏆 CupAI</h1>
<p align="center">
  <strong>Plataforma de Análisis de Partidos de la Copa del Mundo con IA Personalizada</strong><br>
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
  🌐 README Multilingüe /
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

## Descripción del Proyecto

**CupAI** es una plataforma de análisis de partidos de la Copa del Mundo **basada puramente en datos + IA privada del usuario** para aficionados al fútbol de todo el mundo. La plataforma no incluye capacidades de generación de IA integradas; en su lugar, se posiciona como un "proveedor integral de datos de partidos + soporte de herramientas de análisis". Proporciona datos completos, en tiempo real y precisos de los partidos, mientras los usuarios configuran sus propios LLMs privados, personalizan Prompts, ajustan los pesos de los factores del partido y realizan de forma independiente análisis profundos de los encuentros.

### Diferenciadores Clave

| Característica | Descripción |
|----------------|-------------|
| 🔑 **LLMs Privados del Usuario** | Compatible con Doubao, DeepSeek, GPT, Qwen y más — los usuarios aportan sus propias API Keys, costo cero de IA para la plataforma |
| 🧩 **Mercado de Prompts Personalizados** | Crea, comparte y reutiliza plantillas de Prompt — construyendo la mejor biblioteca de plantillas de análisis futbolístico |
| ⚖️ **Pesos de Factores Ajustables** | 8 categorías de factores de análisis con asignación libre del 0%-100% — construye tu propio modelo de análisis |
| 🤖 **Razonamiento Automatizado con Agente IA** | Impulsado por 5 algoritmos propietarios — análisis de partidos totalmente automatizado sin operación manual |
| 🌍 **Internacionalización en 8 Idiomas** | zh-CN / en-US / es-ES / fr-FR / pt-BR / ar-SA / ja-JP / ko-KR — cubriendo las principales naciones de la Copa del Mundo |
| 🛡️ **Análisis Deportivo Totalmente Conforme** | Sin apuestas, sin juego — revisión táctica pura y razonamiento basado en datos |

---

## Stack Tecnológico

| Capa | Tecnología | Propósito |
|------|-----------|-----------|
| 🖥️ **Frontend** | Vue 3 + Vite + Element Plus | UI responsiva, paneles de datos, clasificaciones |
| ⚡ **Tiempo Real** | Socket.io | Marcadores en vivo, notificaciones push instantáneas |
| 📊 **Gráficos** | ECharts | Tendencias de precisión, distribución de pesos, puntuaciones de sentimiento |
| 🌐 **i18n** | vue-i18n (8 idiomas) | Multiidioma, múltiple zona horaria, adaptación global |
| 🔧 **Backend** | NestJS + TypeORM (TypeScript) | APIs modulares, relay de IA, procesamiento de datos |
| 🗄️ **Base de Datos** | MySQL 8.0 | Datos estructurados: usuarios, plantillas, informes, clasificaciones |
| ⚡ **Caché** | Redis | Caché en tiempo real, limitación de API, datos calientes |
| ⏰ **Programador** | node-schedule | Escaneo automático del Agente, generación de informes, inspección de datos |
| 🐳 **Despliegue** | Docker + Docker Compose + Nginx | Despliegue con un clic, proxy inverso, SSL |

### 5 Algoritmos Propietarios

| Algoritmo | Función |
|-----------|---------|
| 📐 Normalización Dinámica de Pesos | Normalización automática de punto flotante tras pesos definidos por el usuario — previene desequilibrios de asignación |
| 🎯 Ajuste Adaptativo por Escenario | El Agente identifica automáticamente el nivel del partido / atributos del equipo / características del enfrentamiento — ajusta pesos dinámicamente |
| 🔇 Reducción de Ruido Multidimensional y Confianza | Filtra datos inválidos, gradúa niveles de confianza, elimina valores atípicos |
| 📊 Cuantificación de Sentimiento Social | Puntuación de polaridad de sentimiento (-10~10), índice de presión pública, calificación de enfoque |
| ⚖️ Corrección de Equilibrio Multifactor | Equilibrio mutuo y corrección complementaria multifactor — evita la desorientación por datos únicos |

---

## Inicio Rápido

### Requisitos Previos

- **Node.js** >= 18.x
- **MySQL** >= 8.0
- **Redis** >= 6.x
- **Docker** & **Docker Compose** (opcional)

### Despliegue con Docker en un Clic

```bash
git clone https://github.com/XieWxx/cupai.git
cd cupai
cp .env.example .env
docker compose up -d
```

Visita en el navegador: `http://localhost:3000`

### Desarrollo Local

```bash
pnpm install

# Iniciar backend
cd apps/server && pnpm dev

# Iniciar frontend
cd apps/web && pnpm dev
```

---

## Estructura del Proyecto

```
cupai/
├── apps/
│   ├── web/                   # Frontend (Vue 3 + Vite)
│   │   └── src/
│   │       ├── views/         # Páginas (8 vistas principales)
│   │       ├── stores/        # Gestión de estado con Pinia
│   │       ├── locales/       # i18n en 8 idiomas
│   │       ├── api/           # Capa de solicitudes API + WebSocket
│   │       └── components/    # Componentes compartidos
│   └── server/                # Backend (NestJS)
│       └── src/
│           ├── modules/       # 7 módulos de negocio
│           │   ├── user/      # Módulo de usuarios
│           │   ├── ai/        # Módulo de relay de IA
│           │   ├── match/     # Datos de partidos + clasificaciones
│           │   ├── prompt/    # Mercado de Prompts + validación
│           │   ├── ranking/   # Clasificaciones
│           │   ├── agent/     # Agente + interacción + análisis
│           │   └── risk/      # Control de riesgos + palabras sensibles
│           ├── config/        # Configuración Redis + limitación
│           └── common/        # Guards + filtros
├── packages/
│   ├── types/                 # Definiciones de tipos unificadas
│   ├── constants/             # Constantes de negocio
│   └── utils/                 # 5 algoritmos propietarios
├── docker/                    # Configuración Nginx
├── deploy/                    # Datos semilla init.sql
└── docker-compose.yml
```

---

## Hoja de Ruta de Versiones

### V1.0 — Versión Base ✅

- [x] Estructura de proyecto Monorepo (pnpm workspace)
- [x] Esqueleto frontend y backend (Vue3 + NestJS + TypeScript)
- [x] Registro/inicio de sesión/autenticación JWT de usuarios
- [x] Gestión de configuración de IA (cifrado de API Key multimodelo)
- [x] Gestión de modelos de pesos (8 factores personalizables)
- [x] CRUD de plantillas Prompt + básicos del mercado
- [x] Centro de datos de partidos (equipos/jugadores/historial/entorno)
- [x] Generación manual de análisis + control de acceso público/privado
- [x] Funcionalidades básicas de la plaza de análisis
- [x] Solución de despliegue Docker

### V1.1 — Mejora del Ecosistema ✅

- [x] Caché Redis reemplazando caché en memoria
- [x] Guardia de limitación de API (estrategia de 3 niveles)
- [x] Ciclo completo de análisis IA (ensamblar Prompt → llamar IA → guardar informe)
- [x] Interacción comunitaria de likes/favoritos
- [x] Sistema de clasificaciones (clasificación de usuarios + clasificación de modelos)
- [x] Tareas programadas del Agente con llamadas reales a IA
- [x] Protocolo de autorización del Agente + activación manual
- [x] Mejora de control de riesgos: revisión secundaria de contenido IA + palabras sensibles persistentes
- [x] Tema oscuro del frontend + push en tiempo real WebSocket

### V1.2 — Experiencia Profunda ✅

- [x] Mejora de la página de detalles del partido (marcador + datos de 8 factores + trazabilidad de fuente de datos)
- [x] Validación de plantillas Prompt (detección de variables + vista previa + validación al crear)
- [x] Funcionalidad de clasificaciones (puntos de grupo + análisis de escenarios de clasificación)
- [x] Gestión de favoritos del usuario
- [x] Renderizado Markdown en la plaza de análisis + trazabilidad de instantáneas de pesos
- [x] Expansión i18n a 8 idiomas (zh/en/es/fr/pt/ar/ja/ko)
- [x] Archivos README multilingües

### V1.3 — Edición Global Completa (Planificado)

- [ ] Identificación precisa de sentimiento internacional
- [ ] Perfeccionamiento del sistema de cumplimiento transfronterizo
- [ ] Monitoreo de datos y alertas, recuperación automática de anomalías
- [ ] Provisionamiento de funciones comerciales

---

## Contribuir

¡Damos la bienvenida a las contribuciones de la comunidad! Ya sea código, documentación, traducciones o informes de errores — cada contribución es valiosa.

### Cómo Contribuir

1. Haz **Fork** de este repositorio
2. Crea una rama de característica: `git checkout -b feat/amazing-feature`
3. Confirma tus cambios: `git commit -m 'feat: add amazing feature'`
4. Empuja la rama: `git push origin feat/amazing-feature`
5. Envía un **Pull Request**

> Para guías detalladas de contribución, consulta [CONTRIBUTING.md](./CONTRIBUTING.md)
> Por favor lee el [Código de Conducta](./CODE_OF_CONDUCT.md) antes de contribuir

### Áreas de Contribución

| Área | Descripción |
|------|-------------|
| 💻 **Desarrollo de Código** | Desarrollo de funciones frontend/backend, optimización de algoritmos, corrección de errores |
| 🎨 **Diseño UI/UX** | Mejoras en diseño de páginas, mejoras en experiencia de interacción |
| 🌍 **Internacionalización** | Traducción y corrección para 8 idiomas |
| 📝 **Documentación** | Guías de desarrollo, tutoriales de uso |
| 🧪 **Testing** | Tests unitarios, tests E2E, tests de rendimiento |
| 🐛 **Informes de Errores** | Envío de issues, reproducción de problemas |
| 📣 **Comunidad** | Contribuciones de plantillas Prompt, compartir contenido comunitario |

### Contribuidores

<a href="https://github.com/XieWxx/cupai/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=XieWxx/cupai" />
</a>

---

## Declaración de Cumplimiento

Todos los resultados de análisis de IA en esta plataforma son **exclusivamente para análisis de entretenimiento de datos deportivos y referencia táctica**, y no constituyen ningún consejo de apuestas, juegos de azar o predicción de resultados. La plataforma bloquea completamente términos y funciones relacionadas con apuestas. Todo el contenido generado por usuarios se revisa automáticamente por control de riesgos, cumpliendo plenamente con las leyes y regulaciones chinas así como con los requisitos de cumplimiento de privacidad del RGPD.

---

## Licencia

Este proyecto está licenciado bajo la [Apache License 2.0](./LICENSE).

CupAI © 2024-2026 — Hecho con ❤️ por la comunidad y contribuidores de CupAI.

---

<p align="center">
  <sub>Si este proyecto te ayuda, ¡danos una ⭐ Star!</sub>
  <br><br>
  <a href="https://star-history.com/#XieWxx/cupai&Date">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/svg?repos=XieWxx/cupai&type=Date&theme=dark" />
      <img width="500" alt="Star History Chart" src="https://api.star-history.com/svg?repos=XieWxx/cupai&type=Date" />
    </picture>
  </a>
</p>
