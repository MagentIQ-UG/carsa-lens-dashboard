# 🔗 CARSA Lens Agent - Frontend-Backend Integration Context

**Document Version:** 1.0  
**Date:** January 2025  
**Purpose:** Complete context for frontend development and LLM assistance  
**Backend Repository:** `carsa-lens-agent` (FastAPI + PostgreSQL)  
**Frontend Repository:** `carsa-lens-dashboard` (Next.js + React)  

---

## 📋 **Project Overview**

CARSA Lens Agent is an **enterprise-grade AI-powered recruitment platform** designed for corporate hiring teams in Uganda & East Africa. The system uses a **microservices architecture** with separate frontend and backend repositories for optimal scalability and team collaboration.

### **Architecture Summary**
- **Backend**: FastAPI with PostgreSQL, deployed on Azure Container Apps
- **Frontend**: Next.js 14 + React 18, recommended deployment on Vercel
- **Authentication**: JWT-based with refresh tokens
- **AI Integration**: Multi-provider (Azure OpenAI, OpenAI, Gemini)
- **File Storage**: MinIO S3-compatible object storage
- **Multi-tenancy**: Row-Level Security (RLS) with organization isolation

---

## 🏗️ **Backend API Architecture**

### **Base URLs by Environment**
```typescript
const API_ENDPOINTS = {
  development: "https://ca-carsa-lens-dev.kindplant-1a06368c.centralus.azurecontainerapps.io/api/v1",
  staging: "https://ca-carsa-lens-staging.kindplant-1a06368c.centralus.azurecontainerapps.io/api/v1",
  production: "https://ca-carsa-lens-prod.kindplant-1a06368c.centralus.azurecontainerapps.io/api/v1"
};
```

### **OpenAPI Documentation**
- **Interactive Docs**: `{BASE_URL}/docs` (Swagger UI)
- **ReDoc**: `{BASE_URL}/redoc`
- **OpenAPI Spec**: `{BASE_URL}/openapi.json`
- **Health Check**: `{BASE_URL}/health`

---

## 🔐 **Authentication System**

### **JWT Token Structure**
The backend uses a **dual-token system** following [secure auth practices](https://dev.to/00rvn00/secure-auth-token-handling-in-the-frontend-when-your-client-needs-the-token-1knn):

#### **Token Types**
```typescript
interface TokenResponse {
  access_token: string;      // Short-lived (30 minutes)
  refresh_token: string;     // Long-lived (30 days)
  token_type: "bearer";
  expires_in: number;        // Seconds until expiration
}
```

#### **Token Storage Strategy**
Following [secure frontend auth patterns](https://dev.to/00rvn00/secure-auth-token-handling-in-the-frontend-when-your-client-needs-the-token-1knn):
- **Access Token**: Store in memory only (React state/context)
- **Refresh Token**: Store in HttpOnly, Secure, SameSite=Strict cookie
- **Never use localStorage** for sensitive tokens

#### **Authentication Flow**
```typescript
// 1. Registration
POST /api/v1/auth/register
{
  organization_name: string;
  organization_slug: string;
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  phone?: string;
}

// 2. Login
POST /api/v1/auth/login
{
  email: string;
  password: string;
  remember_me?: boolean;
}

// 3. Token Refresh
POST /api/v1/auth/refresh
{
  refresh_token: string;
}

// 4. Current User
GET /api/v1/auth/me
Headers: { Authorization: "Bearer {access_token}" }
```

### **Multi-Tenant Security**
- Every API request requires organization context
- Database uses Row-Level Security (RLS) for data isolation
- User permissions are role-based (Owner, Admin, HR, User)

---

## 📊 **Core API Modules**

### **1. Jobs Management (`/jobs`)**

#### **Job Creation & Management**
```typescript
// Job Model
interface Job {
  id: string;
  title: string;
  description?: string;
  department?: string;
  location?: string;
  job_type: "full_time" | "part_time" | "contract" | "temporary" | "internship" | "freelance";
  job_mode: "on_site" | "remote" | "hybrid";
  seniority_level: "entry" | "junior" | "mid" | "senior" | "lead" | "principal" | "executive";
  salary_min?: number;
  salary_max?: number;
  salary_currency: string;
  status: "draft" | "active" | "paused" | "closed";
  organization_id: string;
  created_by_id: string;
  created_at: string;
  updated_at: string;
}

// Key Endpoints
POST   /api/v1/jobs/                           # Create job
GET    /api/v1/jobs/                           # List jobs (with filters)
GET    /api/v1/jobs/{job_id}                   # Get specific job
PUT    /api/v1/jobs/{job_id}                   # Update job
DELETE /api/v1/jobs/{job_id}                   # Delete job
```

#### **Job Description Processing**
```typescript
// Upload & Process Job Description
POST /api/v1/jobs/{job_id}/upload-description
Content-Type: multipart/form-data
Body: { file: File }  // PDF, DOCX, DOC supported

// Generate JD from Scratch
POST /api/v1/jobs/{job_id}/generate-description
{
  title: string;
  department: string;
  requirements: string[];
  responsibilities: string[];
  // ... other fields
}

// Enhance Existing JD
POST /api/v1/jobs/{job_id}/descriptions/{jd_id}/enhance
{
  enhancement_types: ("clarity" | "bias_detection" | "keywords")[];
  custom_instructions?: string;
}

// Generate Evaluation Scorecard
POST /api/v1/jobs/{job_id}/descriptions/{jd_id}/generate-scorecard
{
  custom_instructions?: string;
}
```

### **2. Candidates Management (`/candidates`)**

#### **Candidate Model**
```typescript
interface Candidate {
  id: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  location?: string;
  source: "uploaded" | "manual" | "imported";
  processing_status: "pending" | "processing" | "completed" | "failed";
  ai_provider?: string;
  confidence_score?: number;
  profile_data: CandidateProfileData;
  organization_id: string;
  created_at: string;
}

interface CandidateProfileData {
  personal_info: {
    full_name: string;
    email?: string;
    phone?: string;
    location?: string;
  };
  work_experience: WorkExperience[];
  education: Education[];
  skills: {
    technical: string[];
    soft: string[];
    languages: string[];
  };
  certifications: Certification[];
  summary?: string;
}
```

#### **CV Processing Endpoints**
```typescript
// Single CV Upload
POST /api/v1/candidates/upload
Content-Type: multipart/form-data
Body: { 
  file: File;
  extract_profile: boolean = true;
}

// Batch CV Upload
POST /api/v1/candidates/batch-upload
Content-Type: multipart/form-data
Body: { 
  files: File[];
  extract_profile: boolean = true;
}

// Get Candidate Profile
GET /api/v1/candidates/{candidate_id}/profile

// Update Profile
PUT /api/v1/candidates/{candidate_id}/profile
{
  profile_updates: Partial<CandidateProfileData>;
}
```

### **3. Evaluation Engine (`/evaluations`)**

#### **Evaluation Model**
```typescript
interface Evaluation {
  id: string;
  candidate_id: string;
  job_id: string;
  scorecard_id: string;
  overall_score?: number;
  qualification_tier?: "highly_qualified" | "qualified" | "partially_qualified" | "not_qualified";
  scores: Record<string, CriterionScore>;
  strengths: string[];
  gaps: string[];
  interview_focus_areas: string[];
  recommendations: string;
  confidence_level: number;
  ai_model: string;
  created_at: string;
}

interface CriterionScore {
  score: number;
  max_score: number;
  percentage: number;
  confidence: number;
  evidence: string[];
  justification: string;
}
```

#### **Evaluation Endpoints**
```typescript
// Single Candidate Evaluation
POST /api/v1/evaluations/evaluate
{
  candidate_id: string;
  job_id: string;
  scorecard_id?: string;
  custom_instructions?: string;
}

// Batch Evaluation
POST /api/v1/evaluations/batch
{
  candidate_ids: string[];
  job_id: string;
  scorecard_id?: string;
  concurrency?: number;
}

// Get Evaluation Results
GET /api/v1/evaluations/{evaluation_id}

// List Evaluations
GET /api/v1/evaluations?job_id={job_id}&candidate_id={candidate_id}
```

### **4. Rankings & Analytics (`/rankings`, `/analytics`)**

#### **Rankings System**
```typescript
// Get Job Rankings
GET /api/v1/rankings/job/{job_id}

// Update Hiring Decision
PUT /api/v1/rankings/{ranking_id}/decision
{
  decision: "hire" | "reject" | "interview" | "hold";
  reason?: string;
}
```

#### **Analytics Dashboard**
```typescript
// Dashboard Metrics
GET /api/v1/analytics/dashboard

// Hiring Funnel
GET /api/v1/analytics/funnel?job_id={job_id}

// Diversity Insights
GET /api/v1/analytics/diversity
```

---

## 🔄 **File Upload Handling**

### **Supported File Types**
- **Documents**: PDF, DOCX, DOC
- **Maximum Size**: 50MB per file
- **Batch Limit**: 50 files per batch upload

### **Upload Response Pattern**
```typescript
interface FileUploadResponse {
  message: string;
  [entity_name]: EntityResponse;  // job_description, candidate, etc.
  storage_info: {
    storage_path: string;
    file_size: number;
    content_type: string;
  };
  processing_info: {
    extraction_errors: string[];
    confidence_score?: number;
    processing_method: string;
  };
}
```

### **File Upload Implementation**
```typescript
// Use FormData for file uploads
const formData = new FormData();
formData.append('file', file);
formData.append('extract_profile', 'true');

const response = await fetch('/api/v1/candidates/upload', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    // Don't set Content-Type - let browser set it with boundary
  },
  body: formData,
});
```

---

## ⚡ **Real-time Processing & Status**

### **Async Processing Pattern**
Many operations (CV processing, evaluations) are asynchronous:

```typescript
// 1. Initial Response
{
  id: string;
  status: "pending" | "processing" | "completed" | "failed";
  estimated_completion?: string;
}

// 2. Polling for Status
GET /api/v1/candidates/{id}  // Check processing_status
GET /api/v1/evaluations/{id} // Check completion

// 3. Real-time Updates (if WebSocket implemented)
// WebSocket endpoint: wss://{BASE_URL}/ws/{user_id}
```

### **Error Handling Pattern**
```typescript
interface APIError {
  error: string;
  message: string;
  status_code: number;
  request_id: string;
  details?: any;
}

// Validation Errors
{
  error: "Validation Error";
  message: "Request validation failed";
  details: [
    {
      field: "email";
      message: "Invalid email format";
    }
  ];
}
```

---

## 🎯 **AI Integration Context**

### **AI Provider Configuration**
The backend uses multiple AI providers with automatic failover:
- **Primary**: Azure OpenAI (gpt-4.1-mini)
- **Fallbacks**: OpenAI, Google Gemini, Mistral
- **Token Limits**: 16,000 tokens for comprehensive processing

### **AI Processing Confidence**
All AI operations return confidence scores:
- **>90%**: High confidence, no review needed
- **80-90%**: Good confidence, minimal review
- **70-80%**: Medium confidence, review recommended
- **<70%**: Low confidence, manual review required

### **Evidence-Based Evaluation**
The evaluation system provides specific evidence:
```typescript
{
  criterion: "Technical Skills - Python",
  score: 85,
  evidence: [
    "Resume line 23: '5 years Python development experience'",
    "Resume line 45: 'Led Python-based microservices architecture'"
  ],
  justification: "Strong evidence of extensive Python experience..."
}
```

---

## 🔒 **Security Considerations**

### **API Security Headers**
```typescript
// Required headers for all requests
{
  "Authorization": "Bearer {access_token}",
  "Content-Type": "application/json", // or multipart/form-data for uploads
  "X-Tenant-ID": "organization_id"    // Auto-added by auth
}
```

### **CORS Configuration**
Backend accepts requests from:
- `http://localhost:3000` (Next.js dev)
- `http://localhost:5173` (Vite dev)
- `https://carsa-dashboard.vercel.app` (Staging)
- `https://dashboard.carsalens.com` (Production)

### **Rate Limiting**
- **API Calls**: 100 requests/minute per user
- **File Uploads**: 10 uploads/minute per user
- **AI Processing**: Limited by token quotas

---

## 📱 **Frontend Integration Guidelines**

### **Recommended Libraries**
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
  "icons": "Lucide React"
}
```

### **API Client Setup**
```typescript
// Use Axios with interceptors for auth and error handling
import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 30000,
});

// Auto-attach auth tokens
apiClient.interceptors.request.use((config) => {
  const token = getAccessToken(); // From memory/context
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token refresh on 401
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await refreshToken();
      // Retry original request
    }
    return Promise.reject(error);
  }
);
```

### **Type Generation**
```bash
# Auto-generate TypeScript types from OpenAPI spec
npx openapi-generator-cli generate \
  -i https://ca-carsa-lens-dev.kindplant-1a06368c.centralus.azurecontainerapps.io/openapi.json \
  -g typescript-axios \
  -o src/api/generated
```

---

## 🧪 **Testing & Development**

### **API Testing**
```bash
# Health check
curl https://ca-carsa-lens-dev.kindplant-1a06368c.centralus.azurecontainerapps.io/health

# Test authentication
curl -X POST https://ca-carsa-lens-dev.kindplant-1a06368c.centralus.azurecontainerapps.io/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'
```

### **Mock Data for Development**
```typescript
// Use MSW (Mock Service Worker) for offline development
import { rest } from 'msw';

const handlers = [
  rest.get('/api/v1/jobs', (req, res, ctx) => {
    return res(ctx.json(mockJobs));
  }),
  rest.post('/api/v1/candidates/upload', (req, res, ctx) => {
    return res(ctx.json(mockCandidateUpload));
  }),
];
```

---

## 📚 **Reference Links**

### **Backend Repository Context**
- **Repository**: `carsa-lens-agent`
- **Main Branch**: `dev-api` (development), `main` (production)
- **Documentation**: `/docs` folder in backend repo
- **API Tests**: `test_e2e_pipeline.py` (comprehensive end-to-end examples)

### **Key Documentation Files**
- **API Documentation**: `docs/API-DOCUMENTATION.md`
- **API Quick Reference**: `docs/API-QUICK-REFERENCE.md`
- **Azure Deployment**: `CARSA_AZURE_DEPLOYMENT_STRATEGY.md`
- **Local Development**: `LOCAL_DEVELOPMENT_GUIDE.md`

### **External References**
- [Secure Frontend Auth Patterns](https://dev.to/00rvn00/secure-auth-token-handling-in-the-frontend-when-your-client-needs-the-token-1knn)
- [API Key Security Best Practices](https://www.freecodecamp.org/news/private-api-keys)
- [Next.js Documentation](https://nextjs.org/docs)
- [TanStack Query Documentation](https://tanstack.com/query)

---

## 🚀 **Quick Start Commands**

### **Backend Health Check**
```bash
curl https://ca-carsa-lens-dev.kindplant-1a06368c.centralus.azurecontainerapps.io/health
```

### **Get OpenAPI Spec**
```bash
curl https://ca-carsa-lens-dev.kindplant-1a06368c.centralus.azurecontainerapps.io/openapi.json > openapi.json
```

### **Test Full Workflow**
```bash
# See test_e2e_pipeline.py in backend repo for complete examples
python test_e2e_pipeline.py
```

---

## 🔧 **Development Workflow**

### **Branch Strategy**
- **Backend**: `dev-api` → `main-dev` → `main`
- **Frontend**: `dev-ui` → `main-dev` → `main`
- **Deployment**: Auto-deploy on push to respective branches

### **Environment Variables Required**
```bash
# Frontend .env.local
NEXT_PUBLIC_API_URL=https://ca-carsa-lens-dev.kindplant-1a06368c.centralus.azurecontainerapps.io/api/v1
NEXT_PUBLIC_ENVIRONMENT=development
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000
```

### **CORS Setup for Local Development**
Ensure backend allows `http://localhost:3000` and `http://localhost:5173` in CORS origins.

---

This document provides complete context for frontend development and LLM assistance. Keep it updated as the backend API evolves, and reference the actual backend repository for the most current implementation details. 