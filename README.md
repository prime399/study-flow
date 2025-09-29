# StudyMate AI 🎓

> An intelligent study management platform with AI-powered personalized assistance

StudyMate AI helps students track, optimize, and transform their study habits through real-time analytics, collaborative features, and MentorMind - an AI assistant that learns from your unique learning patterns.

## ✨ Features

- **🕒 Smart Study Timer** - Customizable Pomodoro sessions with progress tracking
- **🤖 MentorMind AI Assistant** - Personalized study advice using RAG-like architecture
- **📈 Performance Analytics** - Visual progress tracking and insights
- **👥 Study Groups** - Collaborative spaces with real-time messaging
- **✅ Task Management** - Drag-and-drop todo board with priorities
- **🏆 Leaderboards** - Global and group-specific study rankings
- **📅 Calendar Integration** - Study session scheduling and planning

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ and **pnpm**
- **Convex account** ([convex.dev](https://convex.dev))
- **Vercel account** (for deployment)
- **Heroku Inference API** access for AI features

### 1. Clone & Install

```bash
git clone https://github.com/prime399/study-mate.git
cd study-mate
pnpm install
```

### 2. Environment Setup

Create `.env.local` for Next.js:

```bash
# Convex
CONVEX_DEPLOYMENT=your-deployment-name
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud

# AI Models - Heroku Inference (at least one required)
HEROKU_INFERENCE_URL=https://api.heroku.com/ai
HEROKU_INFERENCE_MODEL_ID=gpt-oss-120b,nova-lite,claude-3-5-haiku,nova-pro
HEROKU_INFERENCE_KEY_OSS=your-oss-key
HEROKU_INFERENCE_KEY_CLAUDE=your-claude-key
HEROKU_INFERENCE_KEY_NOVA_LITE=your-nova-lite-key
HEROKU_INFERENCE_KEY_NOVA_PRO=your-nova-pro-key

# Analytics (optional)
VERCEL_ANALYTICS_ID=your-analytics-id
```

### 3. Convex Setup

```bash
# Initialize Convex
npx convex dev

# Set up authentication providers (optional)
npx convex env set AUTH_GITHUB_ID your-github-client-id
npx convex env set AUTH_GITHUB_SECRET your-github-secret
npx convex env set AUTH_GOOGLE_ID your-google-client-id
npx convex env set AUTH_GOOGLE_SECRET your-google-secret
```

### 4. Run Development Server

```bash
pnpm dev
```

Visit [http://localhost:3000](http://localhost:3000) to see your app!

## 📁 Project Structure

```
StudyMate/
├── app/                    # Next.js app directory
│   ├── (protected)/       # Protected routes (dashboard, groups, etc.)
│   │   └── dashboard/
│   │       ├── ai-helper/  # MentorMind AI assistant
│   │       ├── study/      # Study timer and analytics
│   │       ├── todos/      # Task management board
│   │       ├── groups/     # Study groups and messaging
│   │       └── calendar/   # Study session planning
│   ├── api/               # API routes
│   │   └── ai-helper/     # AI assistant endpoints
│   └── signin/            # Authentication pages
├── components/            # Reusable UI components
│   ├── ui/               # Base UI components (shadcn/ui)
│   └── ...               # Feature-specific components
├── convex/               # Backend functions and schema
│   ├── _generated/       # Generated Convex types
│   ├── schema.ts         # Database schema definition
│   ├── auth.ts           # Authentication functions
│   ├── study.ts          # Study session management
│   ├── groups.ts         # Group management
│   ├── todos.ts          # Task management
│   └── ...               # Other backend functions
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions and shared logic
├── store/                # State management
├── types/                # TypeScript type definitions
└── public/              # Static assets and favicons
```

## 🏗️ Architecture

### Frontend
- **Next.js 14** with App Router and TypeScript
- **Shadcn/ui** components with Tailwind CSS
- **Real-time state** via Convex React hooks
- **Optimistic updates** for seamless UX

### Backend  
- **Convex** for real-time database and functions
- **Convex Auth** for secure authentication
- **Multi-model AI** integration via Heroku Inference

### MentorMind (RAG-like Architecture)
- **Context Retrieval**: Fetches user study data from Convex
- **Multi-Model Support**: GPT-OSS, Nova Lite/Pro, Claude 3.5 Haiku
- **Contextual Generation**: Personalized responses using user data
- **Real-time Integration**: Live study stats and group information

## 🚢 Deployment

### Vercel (Frontend)

1. **Connect your repository** to Vercel
2. **Set environment variables** in Vercel dashboard:
   ```bash
   CONVEX_DEPLOYMENT=your-deployment-name
   NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
   HEROKU_INFERENCE_URL=https://api.heroku.com/ai
   HEROKU_INFERENCE_KEY_OSS=your-oss-key
   # ... other AI model keys
   ```
3. **Deploy** - Vercel will automatically build and deploy

### Convex (Backend)

```bash
# Deploy to production
npx convex deploy

# Set production environment variables
npx convex env set AUTH_GITHUB_ID your-github-id --prod
npx convex env set AUTH_GITHUB_SECRET your-github-secret --prod
# ... repeat for other variables
```

## 🛠️ Development

### Available Scripts

```bash
pnpm dev          # Start development (frontend + backend)
pnpm dev:frontend # Start only Next.js dev server
pnpm dev:backend  # Start only Convex dev server
pnpm build        # Build for production
pnpm lint         # Run ESLint
```

### Database Schema

The app uses Convex with the following main tables:
- **users** - User profiles and authentication
- **studySessions** - Study session tracking
- **studySettings** - User preferences and goals
- **groups** - Study group information
- **groupMembers** - Group membership and roles
- **messages** - Group chat messages
- **todos** - Task management with status and priority

## 🔧 Configuration

### AI Models

Configure at least one AI model for MentorMind to work:

| Model | Environment Variable | Description |
|-------|---------------------|-------------|
| GPT-OSS 120B | `HEROKU_INFERENCE_KEY_OSS` | Recommended general-purpose model |
| Nova Lite | `HEROKU_INFERENCE_KEY_NOVA_LITE` | Fast responses |
| Nova Pro | `HEROKU_INFERENCE_KEY_NOVA_PRO` | Balanced performance |
| Claude 3.5 Haiku | `HEROKU_INFERENCE_KEY_CLAUDE` | Advanced reasoning |

### Authentication Providers

Set up OAuth providers in your Convex dashboard:

- **GitHub OAuth**: [Create OAuth App](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/creating-an-oauth-app)
- **Google OAuth**: [Google Cloud Console](https://console.cloud.google.com/apis/credentials)

Callback URLs: `https://your-deployment.convex.site/api/auth/callback/{provider}`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- **Live Demo**: [study-mate.tech](https://www.study-mate.tech)
- **Documentation**: [Convex Docs](https://docs.convex.dev)
- **Support**: [GitHub Issues](https://github.com/prime399/study-mate/issues)

---

Built with ❤️ for students worldwide. Transform your study habits with StudyMate AI! 