# CARSA Lens Dashboard

**Enterprise-grade AI-powered recruitment dashboard** built with Next.js 15, React 19, and TypeScript.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Development Setup
```bash
# Clone and install dependencies
git clone <repository-url>
cd carsa-lens-dashboard
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your configuration

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 🛠️ Tech Stack

### Frontend
- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS
- **State Management:** Zustand + TanStack Query
- **Forms:** React Hook Form + Zod validation
- **UI Components:** Custom components with Tailwind
- **Icons:** Lucide React
- **Rich Text:** Tiptap editor

### Development
- **Testing:** Jest + React Testing Library + Playwright
- **Linting:** ESLint + Prettier
- **Git Hooks:** Husky + lint-staged
- **API Types:** OpenAPI Generator

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
├── components/            # Reusable UI components
├── hooks/                 # Custom React hooks
├── lib/                   # Utilities and configurations
├── stores/               # Zustand stores
└── types/                # TypeScript type definitions
```

## 🔧 Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server  
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript compiler
- `npm run test` - Run Jest tests
- `npm run test:e2e` - Run Playwright E2E tests
- `npm run generate-api-types` - Generate API types from OpenAPI spec

## 🧪 Testing

- **Unit Tests:** Jest with React Testing Library
- **E2E Tests:** Playwright
- **Comprehensive Test Suite:** `./test_comprehensive.sh`
- **API Verification:** `./verify_api_endpoints.sh`

## 📖 Documentation

- **[TODO.md](./TODO.md)** - Development roadmap and current tasks
- **[docs/](./docs/)** - Detailed documentation and design specs
- **API Integration Guides** - See `*_SUMMARY.md` files

## 🔒 Security

- Content Security Policy (CSP) headers
- XSS protection
- CSRF protection
- Secure authentication flow

## 🚀 Deployment

The application is optimized for deployment on Vercel:

```bash
npm run build
npm run start
```

For other platforms, ensure Node.js 18+ environment with the above commands.

## 🤝 Contributing

1. Follow the established code style (ESLint + Prettier)
2. Write tests for new features
3. Update documentation as needed
4. Use conventional commit messages
