# 🎨 CARSA Lens Agent - Frontend Dashboard

**Version:** 1.0  
**Framework:** Next.js 14 + React 18 + TypeScript  
**Design System:** Enterprise-grade recruitment platform UI  
**Backend Integration:** FastAPI REST API with JWT authentication  

---

## 📋 **Quick Start**

```bash
# Clone and setup
git clone https://github.com/MagentIQ-UG/carsa-lens-dashboard.git
cd carsa-lens-dashboard
npm install

# Environment setup
cp .env.example .env.local
# Edit .env.local with your API endpoints

# Start development server
npm run dev

# Generate API types from backend
npm run generate-api-types

# Access dashboard
open http://localhost:3000
```

---

## 🏗️ **Project Context**

### **Backend API Repository**
- **Repository**: `carsa-lens-agent` (FastAPI + PostgreSQL)
- **Development API**: `https://ca-carsa-lens-dev.kindplant-1a06368c.centralus.azurecontainerapps.io/api/v1`
- **Documentation**: Backend `/docs` folder
- **Integration Guide**: See `docs/FRONTEND_BACKEND_INTEGRATION_CONTEXT.md`

### **Architecture Overview**
```
┌─────────────────┐    HTTP/REST    ┌──────────────────┐
│  Frontend       │ ───────────────▶│  Backend API     │
│  Next.js 14     │                 │  FastAPI         │
│  React 18       │ ◀─────────────── │  PostgreSQL      │
│  TypeScript     │    JSON + JWT   │  Azure OpenAI    │
└─────────────────┘                 └──────────────────┘
```

### **Key Features**
- 🔐 **JWT Authentication** with secure token handling
- 👥 **Multi-tenant** organization isolation
- 🤖 **AI-powered** job description enhancement and candidate evaluation
- 📊 **Real-time** CV processing and evaluation workflows
- 📱 **Responsive** design for desktop, tablet, and mobile
- ♿ **Accessible** WCAG 2.1 AA compliant interface

---

## 🎯 **User Interface Modules**

### **Core Dashboard Pages**
```
🏠 Dashboard         - Executive overview and quick actions
💼 Jobs              - Job creation, JD upload, scorecard generation  
👥 Candidates        - CV upload, profile extraction, pipeline management
📊 Evaluations       - AI-powered candidate assessment and ranking
📈 Analytics         - Hiring metrics, diversity insights, ROI reports
⚙️ Settings          - Organization settings and user management
```

### **Component Architecture**
```
src/
├── app/                 # Next.js App Router pages
│   ├── (auth)/         # Authentication flow
│   ├── dashboard/      # Main dashboard
│   ├── jobs/           # Job management
│   ├── candidates/     # Candidate pipeline
│   └── evaluations/    # Assessment center
├── components/         # Reusable UI components
│   ├── ui/            # Design system components
│   ├── forms/         # Form components
│   └── charts/        # Data visualization
├── lib/               # API client and utilities
├── hooks/             # React Query API hooks
└── types/             # TypeScript definitions
```

---

## 🔧 **Development Setup**

### **Required Environment Variables**
```bash
# API Configuration
NEXT_PUBLIC_API_URL=https://ca-carsa-lens-dev.kindplant-1a06368c.centralus.azurecontainerapps.io/api/v1
NEXT_PUBLIC_ENVIRONMENT=development

# Authentication
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000

# Optional: Analytics
NEXT_PUBLIC_ANALYTICS_ID=your-analytics-id
```

### **Key Scripts**
```json
{
  "dev": "next dev",
  "build": "next build", 
  "start": "next start",
  "lint": "next lint",
  "type-check": "tsc --noEmit",
  "generate-api-types": "openapi-generator-cli generate -i $NEXT_PUBLIC_API_URL/../openapi.json -g typescript-axios -o src/api/generated"
}
```

### **Tech Stack**
```json
{
  "framework": "Next.js 14",
  "runtime": "React 18", 
  "language": "TypeScript",
  "styling": "Tailwind CSS",
  "state": "Zustand",
  "api": "TanStack Query",
  "forms": "React Hook Form",
  "validation": "Zod",
  "charts": "Recharts", 
  "icons": "Lucide React",
  "testing": "Jest + Testing Library"
}
```

---

## 🔐 **Authentication & Security**

### **Token Management**
Following [secure frontend auth patterns](https://dev.to/00rvn00/secure-auth-token-handling-in-the-frontend-when-your-client-needs-the-token-1knn):
- **Access Token**: Stored in memory only (React Context)
- **Refresh Token**: HttpOnly cookie (handled by backend)
- **Auto-refresh**: Automatic token renewal on expiry
- **Secure Storage**: No sensitive data in localStorage

### **API Integration**
```typescript
// Automatic auth header injection
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 30000,
});

// Auto-refresh on 401 responses
apiClient.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 401) {
      await refreshToken();
      return apiClient(error.config);
    }
    return Promise.reject(error);
  }
);
```

---

## 📊 **Data Flow & State Management**

### **API State with TanStack Query**
```typescript
// Jobs API integration
export const useJobs = (filters?: JobFilters) => {
  return useQuery({
    queryKey: ['jobs', filters],
    queryFn: () => apiClient.get<Job[]>('/jobs', { params: filters }),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// File upload with progress
export const useJobDescriptionUpload = () => {
  return useMutation({
    mutationFn: ({ jobId, file }: { jobId: string; file: File }) => {
      const formData = new FormData();
      formData.append('file', file);
      return apiClient.post(`/jobs/${jobId}/upload-description`, formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['jobs']);
    },
  });
};
```

### **Global State with Zustand**
```typescript
interface AppState {
  user: User | null;
  organization: Organization | null;
  theme: 'light' | 'dark';
  sidebar: 'expanded' | 'collapsed';
}

export const useAppStore = create<AppState>((set) => ({
  user: null,
  organization: null,
  theme: 'light',
  sidebar: 'expanded',
  // ... actions
}));
```

---

## 🎨 **Design System**

### **Color Palette**
```css
/* Primary Colors - Enterprise Blue */
--primary-500: #0066CC;
--primary-400: #338FE6; 
--primary-600: #0052A3;

/* Neutrals - Professional Gray */
--neutral-50: #F9FAFB;
--neutral-900: #111827;

/* Semantic Colors */
--success-500: #059669;
--warning-500: #D97706;
--error-500: #DC2626;
```

### **Component Usage**
```typescript
// Professional data table
<DataTable
  data={candidates}
  columns={candidateColumns}
  sortable
  filterable
  pagination
/>

// Metrics dashboard
<MetricCard
  title="Active Jobs"
  value={activeJobs}
  trend="+12%"
  icon="briefcase"
/>

// File upload with progress
<FileUpload
  accept=".pdf,.docx,.doc"
  onUpload={handleCVUpload}
  maxSize="50MB"
  multiple
/>
```

---

## 🧪 **Testing Strategy**

### **Unit & Integration Tests**
```bash
# Run tests
npm test

# Coverage report
npm run test:coverage

# E2E tests with Playwright
npm run test:e2e
```

### **Mock API for Development**
```typescript
// MSW handlers for offline development
export const handlers = [
  rest.get('/api/v1/jobs', (req, res, ctx) => {
    return res(ctx.json(mockJobs));
  }),
  rest.post('/api/v1/candidates/upload', (req, res, ctx) => {
    return res(ctx.json(mockCandidateUpload));
  }),
];
```

---

## 🚀 **Deployment**

### **Environment Strategy**
```
dev-ui branch    → Development (Vercel Preview)
main-dev branch  → Staging (Vercel Production)  
main branch      → Production (Custom Domain)
```

### **Performance Targets**
- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s  
- **Time to Interactive**: < 3.5s
- **Cumulative Layout Shift**: < 0.1

### **Build Optimization**
```typescript
// Automatic code splitting
const LazyDashboard = lazy(() => import('./Dashboard'));
const LazyJobs = lazy(() => import('./Jobs'));

// Route-based chunks
export default {
  '/dashboard': LazyDashboard,
  '/jobs': LazyJobs,
  '/candidates': lazy(() => import('./Candidates')),
  '/evaluations': lazy(() => import('./Evaluations')),
};
```

---

## 📚 **Documentation & References**

### **Backend Integration**
- **Complete API Context**: `docs/FRONTEND_BACKEND_INTEGRATION_CONTEXT.md`
- **Backend Repository**: `carsa-lens-agent`
- **API Documentation**: Live at `/docs` endpoint
- **OpenAPI Spec**: Auto-generated TypeScript types

### **Design & UX**
- **UI/UX Strategy**: `docs/FRONTEND_UI_UX_DESIGN_STRATEGY.md`
- **Component Library**: Storybook documentation
- **Accessibility**: WCAG 2.1 AA compliance guide
- **User Testing**: Usability testing reports

### **Development**
- **Contributing**: Development guidelines and code standards
- **Security**: Auth patterns and security best practices  
- **Performance**: Optimization techniques and monitoring
- **Deployment**: CI/CD pipeline and environment setup

---

## 🛠️ **Development Workflow**

### **Getting Started**
1. **Backend Context**: Read `docs/FRONTEND_BACKEND_INTEGRATION_CONTEXT.md`
2. **UI/UX Guidelines**: Review `docs/FRONTEND_UI_UX_DESIGN_STRATEGY.md`  
3. **Setup Environment**: Configure API endpoints and auth
4. **Generate Types**: Run `npm run generate-api-types`
5. **Start Development**: `npm run dev`

### **Feature Development**
1. **Design Review**: Check Figma designs and component specs
2. **API Integration**: Use generated types and TanStack Query
3. **Testing**: Write unit tests and update E2E scenarios
4. **Accessibility**: Ensure WCAG compliance with testing tools
5. **Performance**: Monitor Core Web Vitals and optimize

### **Deployment Process**
1. **Branch Strategy**: `dev-ui` → `main-dev` → `main`
2. **Automated Deployment**: Vercel integration with GitHub
3. **Environment Variables**: Configured per environment
4. **Health Checks**: Automated testing and monitoring

---

**🎯 Ready to build enterprise-grade recruitment experiences!**

For complete backend context and API integration details, see the **Frontend-Backend Integration Context** document in the `docs/` folder. 