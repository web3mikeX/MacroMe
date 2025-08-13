# MacroMe

An AI-powered Next.js application that auto-creates weekly, macro-perfect meal plans from your pantry ingredients and guides you through batch-prep cooking.

## ✨ Features

### 🎯 Core Functionality
- **AI-Enhanced Macro Tetris**: Intelligent meal planning powered by Kimi K2 AI that optimizes recipes to hit exact macro targets
- **Smart Recipe Adaptation**: AI automatically modifies recipes based on available pantry ingredients
- **Personalized Meal Suggestions**: AI learns your preferences and generates custom meal recommendations
- **Smart Pantry Management**: Track ingredients with full CRUD operations and AI-powered shopping optimization
- **Drag & Drop Planning**: Intuitive 7-day meal grid with real-time macro calculations
- **Guided Batch Cooking**: Step-by-step cooking with parallel timers and notifications
- **AI Shopping Lists**: Intelligent grocery lists with cost optimization and bulk buying suggestions

### 🔧 Technical Features
- **Enhanced Timer System**: Multiple simultaneous timers with browser notifications
- **Real-time Macro Tracking**: Color-coded accuracy indicators (±5% green, ±15% yellow, >15% red)
- **Responsive Design**: Mobile-first approach with shadcn/ui components
- **Type-Safe Database**: Full TypeScript integration with Supabase

## 🛠 Tech Stack

- **Framework**: Next.js 15 with App Router & Turbopack
- **AI Engine**: Kimi K2 LLM for recipe adaptation and meal planning
- **Language**: TypeScript with strict mode
- **Database**: Supabase (PostgreSQL with Row Level Security)
- **Authentication**: Supabase Auth with middleware protection
- **Styling**: Tailwind CSS v4 + shadcn/ui components
- **Drag & Drop**: @dnd-kit/core with sortable utilities
- **Notifications**: Sonner for toast notifications
- **Testing**: Playwright for E2E smoke tests
- **CI/CD**: GitHub Actions with comprehensive pipeline
- **Package Manager**: pnpm with strict peer dependencies

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- pnpm 8+
- Docker (for local Supabase)

### Option 1: Local Development with Docker
```bash
# Clone and install
git clone <repo-url>
cd meal-prep-app
pnpm install

# Set up environment
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# Start local Supabase stack
docker-compose up -d

# Run database migrations and seed
pnpm db:seed

# Start development server
pnpm dev
```

### Option 2: Cloud Supabase
```bash
# Install dependencies
pnpm install

# Set up Supabase project
# 1. Create project at https://supabase.com
# 2. Copy URL and anon key to .env.local
# 3. Run migrations in Supabase SQL editor:
#    - supabase/migrations/20240808000001_initial_schema.sql
#    - supabase/migrations/20240808000002_seed_data.sql

# Seed database with sample data
pnpm seed

# Start development
pnpm dev
```

Visit http://localhost:3000 and create your account or use demo credentials:
- **Email**: demo@macrome.app
- **Password**: MacroMe2024!

## 📱 Application Flow

### 1. Landing Page (`/`)
- Value proposition and feature highlights
- Authentication (Sign In/Sign Up) with Supabase
- Responsive design showcasing app benefits

### 2. Dashboard (`/dashboard`)
- **Macro Targets**: Set and edit daily calorie and macro percentages
- **Pantry Management**: Full CRUD for ingredient inventory
- **Plan Generation**: Trigger Macro Tetris algorithm
- **Quick Stats**: Visual macro targets and pantry status

### 3. Meal Plan (`/plan/[week]`)
- **7-Day Grid**: Drag-and-drop meal assignment
- **Macro Tracking**: Real-time daily and weekly totals
- **Accuracy Indicators**: Color-coded macro target compliance
- **Grocery Export**: CSV download of needed ingredients

### 4. Guided Cooking (`/cook/[planId]`)
- **Timeline Mode**: Optimized step sequence for batch prep
- **Step-by-Step Mode**: Focused individual step progression  
- **Multi-Timer System**: Parallel cooking with notifications
- **Progress Tracking**: Mark steps complete as you cook

## 🧠 Macro Tetris Algorithm

The core intelligence behind meal plan generation:

1. **Greedy Protein Fill**: Sort recipes by protein density, fill daily protein targets first
2. **Macro Balancing**: Add carb-rich and fat-rich recipes to meet remaining targets
3. **Fine-tuning**: Scale servings (±10g adjustments) to hit all macros within ±5%
4. **Pantry Optimization**: Only suggest recipes possible with available ingredients
5. **Missing Ingredients**: Generate shopping list for any shortfalls

**Algorithm Location**: `src/lib/macroTetris.ts`

## 🗄 Database Schema

### Core Tables
- **`users`**: Profiles with macro targets (kcal, protein %, carb %, fat %)
- **`ingredients`**: Nutrition database (protein, carbs, fat, kcal per 100g)
- **`pantry_items`**: User inventory with quantities and units
- **`recipes`**: Step-by-step instructions with cooking times
- **`recipe_ingredients`**: Many-to-many recipe-ingredient relationships
- **`meal_plans`**: Weekly plans with calculated totals
- **`meals`**: Individual meal assignments (recipe + servings + day + slot)

### Security Features
- Row Level Security (RLS) on all user data
- Authenticated API routes with Supabase middleware
- Service-level data validation and sanitization

## 🎛 Enhanced Timer System

Custom `useTimer` hook with advanced features:

```typescript
const {
  timers,
  createTimer,
  startTimer,
  pauseTimer,
  resetTimer,
  removeTimer,
  formatTime,
  getActiveCount,
  getCompletedCount
} = useTimer({
  showBrowserNotification: true,
  playSound: false
})
```

**Features**:
- Multiple simultaneous timers
- Browser notifications on completion
- Persistent state during cooking
- Audio alerts (configurable)
- Preset timers for common cooking tasks

## 🧪 Testing Strategy

### E2E Smoke Tests
```bash
pnpm dlx playwright test --config=playwright.config.ci.ts
```

**Test Coverage**:
- Landing page loads and renders correctly
- Authentication forms are functional
- Responsive design works across viewports
- Core routes are accessible
- Performance benchmarks (sub-5s load times)
- Basic accessibility compliance

### CI/CD Pipeline
GitHub Actions workflow with:
1. **Lint & Format**: ESLint + Prettier validation
2. **Type Check**: Full TypeScript compilation
3. **Build**: Next.js production build
4. **E2E Test**: Playwright smoke tests
5. **Security Audit**: Dependency vulnerability scanning
6. **Bundle Analysis**: Size monitoring and reporting

## 🐳 Local Development with Docker

Full Supabase stack included:
- **PostgreSQL**: Database with extensions
- **PostgREST**: Auto-generated REST API
- **GoTrue**: Authentication service
- **Realtime**: WebSocket subscriptions
- **Storage**: File upload handling
- **Edge Functions**: Serverless runtime
- **Studio**: Database management UI

```bash
# Start full stack
docker-compose up -d

# Access services
# - App: http://localhost:3000
# - Supabase Studio: http://localhost:3001
# - Database: localhost:5432
# - API: http://localhost:8000
```

## 📦 Package Management

Fully configured for **pnpm** with:
- Strict peer dependencies
- Engine requirements (Node 18+, pnpm 8+)
- Frozen lockfiles for reproducible builds
- Security audit configuration

## 🔮 Future Enhancements

### Phase 2: Advanced AI Features ✅ COMPLETED
- **LLM Recipe Adaptation**: AI-powered ingredient substitutions using Kimi K2
- **Intelligent Meal Planning**: Enhanced Macro Tetris with AI optimization
- **Smart Suggestions**: Personalized recipe recommendations
- **AI Shopping Lists**: Cost-optimized grocery planning

### Phase 3: Advanced Optimization
- **Genetic Algorithm**: Multi-constraint meal plan optimization
- **Cost Optimization**: Budget-aware ingredient selection
- **Seasonal Planning**: Ingredient availability and pricing
- **Waste Reduction**: Shelf-life and portion optimization

### Phase 4: Social Features
- **Recipe Sharing**: Community-generated content
- **Meal Plan Templates**: Shareable optimized plans
- **Cooking Sessions**: Multi-user synchronized cooking
- **Progress Analytics**: Personal cooking improvement tracking

## 📋 Scripts Reference

```bash
# Development
pnpm dev                # Start dev server with Turbopack
pnpm build              # Production build
pnpm start              # Start production server

# Code Quality  
pnpm lint               # Run ESLint
pnpm lint:fix           # Auto-fix ESLint issues
pnpm format             # Format with Prettier
pnpm format:check       # Check Prettier formatting

# Database
pnpm seed               # Run seed script
pnpm db:seed            # Alias for seed script

# Testing
pnpm dlx playwright test # Run E2E tests
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

**Code Standards**:
- TypeScript strict mode required
- ESLint + Prettier enforced via pre-commit hooks
- Test coverage for new features
- Comprehensive TODO comments for future work

## 📄 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

- **Next.js Team**: For the incredible App Router and Turbopack
- **Supabase**: For the complete backend-as-a-service platform  
- **shadcn/ui**: For the beautiful, accessible component library
- **Tailwind CSS**: For utility-first styling that just works

---

**🥘 Ready to optimize your macros?** Start with `pnpm i && pnpm dev`

Built with ❤️ using Next.js 15, Supabase, Kimi K2 AI, and the power of intelligent meal planning.
