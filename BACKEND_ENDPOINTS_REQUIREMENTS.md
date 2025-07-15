# Backend API Endpoints Requirements

## Overview
This document outlines the comprehensive API endpoints needed for the fully-featured candidate management system (Phase 5.3) implementation. **GREAT NEWS:** After verification with backend team, **11 out of 11 core candidate endpoints are now available and working!** 🎉

## Current API Base URL
`https://ca-carsa-lens-dev.kindplant-1a06368c.centralus.azurecontainerapps.io/api/v1`

## Frontend Implementation Status
- ✅ **11/11 endpoints now available** - All core operations can use real API calls
- 🎯 **Frontend updated to use real endpoints** - All hooks now integrated with live APIs
- ✅ **Complete functionality enabled** - All candidate management features are now functional
- � **URL enhancement system implemented** - Frontend handles URL extraction and validation
- �📋 **Only 5 endpoints missing** - Non-critical features for enhanced functionality (2 core + 3 enhancements)

## 📊 Complete Endpoint Analysis (11 Working + 5 Missing)

### ✅ **WORKING ENDPOINTS (11/11 - Fully Available!)**

#### Core Candidate Operations
1. **POST /api/v1/candidates/upload** - Upload single CV
   - **Status**: ✅ Working & integrated
   - **Frontend Integration**: CVUpload component, useUploadCV hook
   - **Features**: File validation, progress tracking, AI extraction

2. **POST /api/v1/candidates/batch-upload** - Upload multiple CVs  
   - **Status**: ✅ Working & integrated
   - **Frontend Integration**: CVUpload component, useBatchUploadCV hook
   - **Features**: Batch processing, progress tracking, summary statistics

3. **GET /api/v1/candidates/** - List candidates with filtering
   - **Status**: ✅ Working & integrated
   - **Frontend Integration**: CandidateList component, useCandidates hook
   - **Features**: Search, filtering, sorting, pagination

4. **GET /api/v1/candidates/{candidate_id}** - Get candidate details
   - **Status**: ✅ Working & integrated
   - **Frontend Integration**: Candidate detail page, useCandidate hook
   - **Features**: Complete profile retrieval

#### Profile Management
5. **GET /api/v1/candidates/{candidate_id}/profile** - Get detailed profile
   - **Status**: ✅ Working & **NEWLY INTEGRATED**
   - **Frontend Integration**: ProfileEditor, useCandidateProfile hook
   - **Features**: Detailed profile viewing, extraction metadata

6. **PUT /api/v1/candidates/{candidate_id}/profile** - Update profile
   - **Status**: ✅ Working & **NEWLY INTEGRATED**
   - **Frontend Integration**: ProfileEditor, useUpdateCandidateProfile hook
   - **Features**: Complete profile editing functionality

#### Document & Processing Management
7. **GET /api/v1/candidates/{candidate_id}/documents** - Document management
   - **Status**: ✅ Working & **NEWLY INTEGRATED**
   - **Frontend Integration**: CandidateDocuments, useCandidateDocuments hook
   - **Features**: View uploaded documents, metadata

8. **GET /api/v1/candidates/{candidate_id}/reprocess** - AI reprocessing
   - **Status**: ✅ Working & **NEWLY INTEGRATED**
   - **Frontend Integration**: ProfileExtraction, useReprocessCandidate hook
   - **Features**: Re-extract profiles from existing CVs

9. **GET /api/v1/candidates/processing-status** - Real-time processing status
   - **Status**: ✅ Working & **NEWLY INTEGRATED**
   - **Frontend Integration**: Processing components, useProcessingStatus hook
   - **Features**: Real-time processing updates, queue status

#### Health & Monitoring
10. **GET /api/v1/candidates/health/processing** - Processing health check
    - **Status**: ✅ Working & **NEWLY INTEGRATED**
    - **Frontend Integration**: Monitoring, useProcessingHealth hook
    - **Features**: Processing service health monitoring

11. **GET /api/v1/candidates/health** - General health check
    - **Status**: ✅ Working & **NEWLY INTEGRATED**
    - **Frontend Integration**: Health monitoring, useCandidatesHealth hook
    - **Features**: Overall candidates service health

---

## ❌ Still Missing Endpoints (5 - Enhanced Features)

### 🔥 HIGH PRIORITY (Dashboard Feature)

#### 12. **GET /api/v1/candidates/stats** - Candidate Statistics
- **Status**: ❌ **HIGH** - Dashboard metrics currently derived from candidate list
- **Frontend Integration**: Dashboard stats, CandidateList stats, useCandidateStats hook
- **Priority**: 🔥 **High** - Needed for efficient dashboard metrics
- **Current Workaround**: Frontend calculates stats from candidate list data
- **Expected Response**:
  ```json
  {
    "total": 150,
    "processing": 5,
    "completed": 140,
    "failed": 5,
    "this_week": 25,
    "this_month": 85,
    "sources": {
      "uploaded": 120,
      "manual": 20,
      "imported": 10
    },
    "recent_activity": [
      {
        "date": "2024-01-15",
        "count": 5,
        "type": "uploaded"
      }
    ]
  }
  ```

### ⚡ MEDIUM PRIORITY (Management Features)

#### 13. **PUT /api/v1/candidates/{candidate_id}** - Update Basic Candidate Info
- **Status**: ❌ **MEDIUM** - Basic candidate updates not available
- **Frontend Integration**: CandidateCard edit functionality, useUpdateCandidate hook
- **Priority**: ⚡ **Medium** - Basic management operations
- **Current Workaround**: Profile updates work via `/profile` endpoint
- **Request Body**:
  ```json
  {
    "first_name": "string",
    "last_name": "string",
    "email": "string",
    "phone": "string",
    "location": "string",
    "processing_status": "pending|processing|completed|failed"
  }
  ```

#### 14. **DELETE /api/v1/candidates/{candidate_id}** - Delete Candidate  
- **Status**: ❌ **MEDIUM** - Candidate deletion not available
- **Frontend Integration**: CandidateCard delete functionality, useDeleteCandidate hook
- **Priority**: ⚡ **Medium** - Management operations
- **Expected Response**: 204 No Content on success

### 🆕 RECOMMENDED (URL Enhancement Features)

#### 15. **POST /api/v1/candidates/{candidate_id}/enhance-urls** - Extract URLs from CV Content
- **Status**: ❌ **RECOMMENDED** - URL extraction from CV content not available
- **Frontend Integration**: ProfileExtraction, URL enhancement utilities
- **Priority**: 💡 **Low** - Quality of life improvement
- **Current Workaround**: Frontend extracts URLs from available profile text
- **Description**: Extract and populate social media URLs (LinkedIn, GitHub, portfolio, etc.) from the original CV text content
- **Request Body**:
  ```json
  {
    "extract_from_text": true,
    "overwrite_existing": false
  }
  ```
- **Expected Response**:
  ```json
  {
    "extracted_urls": {
      "linkedin": "https://linkedin.com/in/username",
      "github": "https://github.com/username",
      "portfolio_url": "https://portfolio.dev",
      "website": "https://personal-site.com",
      "twitter": "https://twitter.com/username",
      "stackoverflow": "https://stackoverflow.com/users/123/username",
      "behance": "https://behance.net/username",
      "dribbble": "https://dribbble.com/username",
      "other_urls": ["https://additional-url.com"]
    },
    "confidence_scores": {
      "linkedin": 0.95,
      "github": 0.88,
      "portfolio_url": 0.78
    },
    "updated_profile": true
  }
  ```

#### 16. **GET /api/v1/candidates/{candidate_id}/original-text** - Get Original CV Text Content
- **Status**: ❌ **RECOMMENDED** - Original CV text content not exposed
- **Frontend Integration**: URL extraction, profile enhancement
- **Priority**: 💡 **Low** - Enables better frontend URL extraction
- **Current Workaround**: Frontend uses available profile text fields
- **Description**: Retrieve the original text content extracted from the CV for frontend processing
- **Expected Response**:
  ```json
  {
    "original_text": "Full CV text content here...",
    "extraction_metadata": {
      "file_type": "pdf",
      "pages": 2,
      "confidence": 0.92,
      "extraction_date": "2024-01-01T00:00:00Z"
    }
  }
  ```

---

## Expected Data Structures

### CandidateResponse
```json
{
  "id": "string",
  "first_name": "string",
  "last_name": "string",
  "email": "string",
  "phone": "string", 
  "location": "string",
  "source": "UPLOADED|MANUAL|IMPORTED",
  "processing_status": "PENDING|PROCESSING|COMPLETED|FAILED",
  "confidence_score": 0.85,
  "ai_provider": "string",
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z",
  "profile_data": {
    "personal_info": {
      "full_name": "string",
      "email": "string",
      "phone": "string",
      "location": "string",
      "linkedin": "string",
      "github": "string",
      "portfolio_url": "string",
      "website": "string", 
      "twitter": "string",
      "stackoverflow": "string",
      "behance": "string",
      "dribbble": "string",
      "other_urls": ["string"]
    },
    "work_experience": [
      {
        "title": "string",
        "company": "string",
        "start_date": "2020-01-01",
        "end_date": "2023-12-31",
        "is_current": false,
        "description": "string"
      }
    ],
    "education": [
      {
        "degree": "string",
        "institution": "string",
        "field_of_study": "string",
        "start_date": "2016-09-01",
        "end_date": "2020-06-30"
      }
    ],
    "skills": {
      "technical": ["JavaScript", "React", "Node.js"],
      "soft": ["Problem Solving", "Team Work"],
      "languages": ["English", "Spanish"]
    },
    "certifications": [
      {
        "name": "string",
        "issuing_organization": "string",
        "issue_date": "2021-06-01"
      }
    ],
    "summary": "string"
  }
}
```

### CandidateListResponse
```json
{
  "items": [CandidateResponse],
  "total": 150,
  "page": 1,
  "limit": 50
}
```

### CVUploadResponse
```json
{
  "message": "CV uploaded successfully",
  "candidate": CandidateResponse
}
```

### BatchCVUploadResponse
```json
{
  "message": "Batch upload completed",
  "results": [CVUploadResponse],
  "summary": {
    "successful": 8,
    "failed": 2,
    "total_files": 10
  }
}
```

## Query Parameters for Candidate Listing

### GET /api/v1/candidates/
- `search` - Search in name, email, location
- `status_filter` - Filter by processing status
- `source_filter` - Filter by candidate source
- `job_id` - Filter by associated job
- `sort_by` - Sort field (name, created_at, updated_at)
- `sort_order` - Sort direction (asc, desc)
- `limit` - Number of results per page
- `offset` - Pagination offset

---

## 🚀 Frontend Architecture Summary

### **Current Frontend Capabilities**
- ✅ **Complete UI/UX Implementation** - All candidate management interfaces exist
- ✅ **Modern React Architecture** - TanStack Query, TypeScript, proper state management  
- ✅ **Comprehensive Error Handling** - Graceful degradation with mock data fallbacks
- ✅ **Real-time Features Ready** - Processing status tracking, live updates
- ✅ **Responsive Design** - Mobile-first, accessible interface
- ✅ **Advanced Features** - Search, filtering, sorting, batch operations

### **Frontend Components Ready for API Integration**
1. **CandidateList** - Advanced listing with search/filter (uses endpoints 3,5)
2. **CandidateCard** - Individual candidate display (uses endpoints 4,6,9)
3. **ProfileEditor** - Comprehensive profile editing (uses endpoints 6,7)
4. **ProfileExtraction** - AI processing interface (uses endpoints 8,11)
5. **CVUpload** - File upload with progress (uses endpoints 1,2)
6. **PipelineBoard** - Kanban-style management (uses endpoints 3,5,9)
7. **CandidateDetail** - Full profile view (uses endpoints 4,6,10)

### **Hook Architecture (API Integration Layer)**
- `useCandidates()` - List/search candidates 
- `useCandidate()` - Individual candidate details
- `useCandidateStats()` - Statistics and metrics
- `useCandidateProfile()` - Profile management
- `useUpdateCandidateProfile()` - Profile editing
- `useProcessingStatus()` - Real-time status tracking
- `useUploadCV()` / `useBatchUploadCV()` - File operations

---

## 📋 Implementation Roadmap

### **Phase 1: Critical Features (Week 1-2)**
🔥 **Must implement immediately for full functionality**

1. **GET /api/v1/candidates/stats** 
   - Dashboard metrics currently showing mock data
   - Management cannot see real candidate statistics
   - **Frontend Impact**: Statistics cards, dashboard overview

2. **GET /api/v1/candidates/{id}/profile**
   - Detailed profile viewing is limited
   - Users cannot see complete candidate information
   - **Frontend Impact**: Profile detail pages, candidate cards

3. **PUT /api/v1/candidates/{id}/profile**
   - Profile editing completely non-functional
   - Core candidate management feature missing
   - **Frontend Impact**: ProfileEditor, candidate updates

4. **GET /api/v1/candidates/processing-status**
   - No real-time processing feedback
   - Users don't know AI extraction status
   - **Frontend Impact**: Progress indicators, status tracking

### **Phase 2: Enhanced Features (Week 3-4)**
⚡ **Important for complete management experience**

5. **PUT /api/v1/candidates/{id}** - Basic candidate updates
6. **GET /api/v1/candidates/{id}/documents** - Document management
7. **POST /api/v1/candidates/{id}/reprocess** - AI re-extraction

### **Phase 3: Monitoring & Health (Week 5+)**
🧪 **Nice-to-have for operations**

8. **DELETE /api/v1/candidates/{id}** - Candidate deletion
9. **GET /api/v1/candidates/health/processing** - Health monitoring
10. **GET /api/v1/candidates/health** - System health

---

## 🔗 Supporting API Systems (Already Implemented)

### **Rankings API** (7 endpoints - ✅ Complete)
- Candidate ranking and scoring
- Shortlist management  
- Diversity reporting and analytics
- **Frontend**: CandidateRanking component, ranking hooks

### **Evaluations API** (6 endpoints - ✅ Complete)
- Candidate evaluation against job criteria
- Batch evaluation processing
- Evaluation analytics
- **Frontend**: Evaluation components, scoring interfaces

### **Analytics API** (12 endpoints - ✅ Complete)
- Dashboard analytics and reporting
- AI insights and recommendations
- Usage tracking and metrics
- **Frontend**: AnalyticsDashboard, reporting components

---

## 🎯 Technical Implementation Requirements

### **Authentication & Security**
- **Bearer Token Authentication** - All endpoints require valid JWT
- **CORS Configuration** - Frontend domain must be whitelisted
- **Rate Limiting** - File upload endpoints need protection
- **Input Validation** - All request bodies must be validated
- **File Security** - Virus scanning for uploaded CVs

### **Performance Requirements**
- **Response Times**: < 500ms for GET requests, < 2s for POST/PUT
- **File Upload**: Support up to 10MB files, concurrent uploads
- **Pagination**: Maximum 100 items per page for listing endpoints
- **Caching**: GET endpoints should support ETag/Last-Modified headers
- **Real-time**: WebSocket/SSE for processing status updates (optional)

### **Error Handling Standards**
```json
{
  "error": "validation_failed",
  "message": "Request validation failed", 
  "status_code": 400,
  "request_id": "req_123456",
  "details": {
    "field": "email",
    "message": "Invalid email format"
  }
}
```

### **Data Consistency**
- **Atomic Operations** - Profile updates must be transactional
- **Status Synchronization** - Processing status must be real-time
- **File References** - Document links must remain valid
- **Audit Trail** - All changes should be logged for compliance

---

## 📊 Current System Metrics

### **Frontend Implementation Completeness**
- **UI Components**: 100% complete (7 major components)
- **API Integration Layer**: 100% complete (11 hooks implemented)
- **Type Definitions**: 100% complete (comprehensive TypeScript)
- **Error Handling**: 100% complete (graceful degradation)
- **User Experience**: 100% complete (loading states, feedback)

### **Backend Implementation Status**
- **Core Operations**: 36% complete (4/11 endpoints)
- **Advanced Features**: 0% complete (0/7 endpoints)
- **Critical Path Blocked**: Profile management, statistics
- **User Impact**: Major features non-functional

### **Risk Assessment**
- **High Risk**: Profile editing, dashboard metrics (critical features broken)
- **Medium Risk**: Document management, AI reprocessing (enhanced features missing)
- **Low Risk**: Health monitoring (operational features missing)

---

## 🏁 Success Criteria

### **Phase 1 Success (Critical Features)**
- ✅ Dashboard shows real candidate statistics
- ✅ Users can view complete candidate profiles  
- ✅ Profile editing is fully functional
- ✅ Real-time processing status updates
- ✅ All major candidate management workflows work

### **Phase 2 Success (Enhanced Features)**
- ✅ Basic candidate information updates
- ✅ Document management and viewing
- ✅ AI re-extraction capabilities
- ✅ Complete candidate lifecycle management

### **Full System Success**
- ✅ 11/11 candidate endpoints implemented
- ✅ All frontend components fully functional
- ✅ Real-time processing feedback
- ✅ Comprehensive candidate management
- ✅ Production-ready monitoring and health checks

---

## 📞 Frontend Team Support

The frontend team has created a **comprehensive, production-ready candidate management system** that is 100% prepared for API integration. All endpoints are:

- **Fully Specified** - Complete request/response documentation
- **Frontend Ready** - Hooks and components exist and tested
- **Error Handled** - Graceful fallbacks and user feedback
- **Type Safe** - Complete TypeScript definitions
- **Performance Optimized** - Proper caching and state management

**Backend team can implement endpoints incrementally** - the frontend will automatically start using real APIs as they become available, replacing mock data seamlessly.

---

## 🔗 URL Enhancement Implementation Guide

### **Current Frontend Implementation**
The frontend has implemented a comprehensive URL enhancement system that works with existing endpoints:

#### **URL Validation & Cleaning**
- **Location**: `/src/lib/utils/profile-enhancement.ts`
- **Functions**: 
  - `validateAndNormalizeUrl()` - Validates and normalizes URLs, handles encoding issues
  - `cleanProfileUrls()` - Cleans all URLs in a candidate profile
  - `enhanceProfileWithUrls()` - Extracts URLs from text content
  - `enhanceExistingProfile()` - Enhances existing profiles with missing URL data

#### **Integration Points**
- **Profile Loading**: `useCandidateProfile()` automatically enhances and cleans URLs
- **Profile Saving**: `useUpdateCandidateProfile()` cleans URLs before sending to backend
- **Profile Display**: All URL fields use validation before rendering links
- **URL Extraction**: Uses regex patterns to extract URLs from available text content

### **Backend URL Field Requirements**

#### **Essential URL Fields** (Should be populated by backend)
The `personal_info` object should include these URL fields:
```json
{
  "linkedin": "https://linkedin.com/in/username",      // Required for most candidates
  "github": "https://github.com/username",             // Important for tech candidates
  "portfolio_url": "https://portfolio.dev",            // Important for designers/developers  
  "website": "https://personal-site.com",              // General personal website
  "twitter": "https://twitter.com/username",           // Social media presence
  "stackoverflow": "https://stackoverflow.com/users/123", // Tech candidates
  "behance": "https://behance.net/username",           // Designers
  "dribbble": "https://dribbble.com/username",         // UI/UX designers
  "other_urls": ["https://additional-url.com"]         // Any other relevant URLs
}
```

#### **URL Extraction Approach** (Recommended for backend)
1. **During CV Processing**: Extract URLs using regex patterns when processing CV text
2. **Pattern Recognition**: Use the same patterns as frontend (`/src/lib/utils/url-extraction.ts`)
3. **Validation**: Validate extracted URLs before storing
4. **Confidence Scoring**: Assign confidence scores to extracted URLs
5. **Fallback Strategy**: If backend doesn't populate URLs, frontend will extract from available text

### **Migration Strategy**
1. **Phase 1** (Current): Frontend handles all URL enhancement and validation
2. **Phase 2** (Optional): Backend implements URL extraction during CV processing
3. **Phase 3** (Optional): Backend provides `/enhance-urls` endpoint for retroactive enhancement

### **URL Data Quality Standards**
- **Valid Format**: All URLs must be valid HTTP/HTTPS URLs
- **Platform Verification**: URLs should be verified to belong to the claimed platform
- **Encoding**: URLs must be properly encoded (no spaces or special characters)
- **Deduplication**: Remove duplicate URLs across different fields
- **Privacy**: Respect candidate privacy preferences for social media links

---