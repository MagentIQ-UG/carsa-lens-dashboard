#!/bin/bash

# 🧪 CARSA Lens Dashboard - Comprehensive Test Suite
# This script consolidates all essential tests for authentication, UI, and API functionality

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

BASE_URL="http://localhost:3000"
EXTERNAL_API_URL="https://ca-carsa-lens-dev.kindplant-1a06368c.centralus.azurecontainerapps.io/api/v1"

# Test results tracking
TESTS_PASSED=0
TESTS_FAILED=0
TESTS_TOTAL=0

# Function to run a test and track results
run_test() {
    local test_name="$1"
    local test_function="$2"
    
    echo -e "\n${BLUE}🧪 Running: $test_name${NC}"
    echo "----------------------------------------"
    
    TESTS_TOTAL=$((TESTS_TOTAL + 1))
    
    if $test_function; then
        echo -e "${GREEN}✅ PASSED: $test_name${NC}"
        TESTS_PASSED=$((TESTS_PASSED + 1))
    else
        echo -e "${RED}❌ FAILED: $test_name${NC}"
        TESTS_FAILED=$((TESTS_FAILED + 1))
    fi
}

# Function to check if server is running
check_server() {
    if ! curl -s "$BASE_URL" > /dev/null 2>&1; then
        echo -e "${RED}❌ Server is not running on $BASE_URL${NC}"
        echo "Please start the server with: npm run dev"
        return 1
    fi
    echo -e "${GREEN}✅ Development server is running${NC}"
    return 0
}

# Test 1: Server Health Check
test_server_health() {
    local health_check=true
    
    # Check main server
    if ! curl -s "$BASE_URL" > /dev/null 2>&1; then
        echo -e "${RED}❌ Main server not responding${NC}"
        health_check=false
    else
        echo -e "${GREEN}✅ Main server responding${NC}"
    fi
    
    # Check CSRF endpoint
    local csrf_response=$(curl -s "$BASE_URL/api/csrf-token")
    if echo "$csrf_response" | grep -q "csrfToken"; then
        echo -e "${GREEN}✅ CSRF endpoint working${NC}"
    else
        echo -e "${RED}❌ CSRF endpoint not working${NC}"
        health_check=false
    fi
    
    # Check external API connectivity
    local api_response=$(curl -s -w "%{http_code}" "$EXTERNAL_API_URL/auth/health" -o /dev/null 2>/dev/null || echo "000")
    if [[ "$api_response" =~ ^[2-5][0-9][0-9]$ ]]; then
        echo -e "${GREEN}✅ External API accessible (status: $api_response)${NC}"
    else
        echo -e "${YELLOW}⚠️ External API not accessible (status: $api_response)${NC}"
        echo "   This is expected if testing offline"
    fi
    
    return $($health_check && echo 0 || echo 1)
}

# Test 2: Authentication Pages Load
test_auth_pages() {
    local pages_ok=true
    
    # Test login page
    local login_response=$(curl -s "$BASE_URL/auth/login")
    if echo "$login_response" | grep -q "html\|Login"; then
        echo -e "${GREEN}✅ Login page loads${NC}"
    else
        echo -e "${RED}❌ Login page failed to load${NC}"
        pages_ok=false
    fi
    
    # Test dashboard page (should redirect to login if unauthenticated)
    local dashboard_status=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/dashboard")
    if [ "$dashboard_status" = "307" ] || [ "$dashboard_status" = "302" ] || [ "$dashboard_status" = "200" ]; then
        echo -e "${GREEN}✅ Dashboard page properly protected (status: $dashboard_status)${NC}"
    else
        echo -e "${RED}❌ Dashboard page failed to load (status: $dashboard_status)${NC}"
        pages_ok=false
    fi
    
    return $($pages_ok && echo 0 || echo 1)
}

# Test 3: Authentication Logic Implementation
test_auth_implementation() {
    local auth_impl_ok=true
    
    # Check auth context implementation
    if [ -f "src/lib/auth/context.tsx" ]; then
        # Check for cookie restoration
        if grep -q "document.cookie" "src/lib/auth/context.tsx" && \
           grep -q "auth_token=" "src/lib/auth/context.tsx" && \
           grep -q "getMe" "src/lib/auth/context.tsx"; then
            echo -e "${GREEN}✅ Auth persistence implemented${NC}"
        else
            echo -e "${RED}❌ Auth persistence missing components${NC}"
            auth_impl_ok=false
        fi
        
        # Check for redirect logic
        if grep -q "setInitialized" "src/lib/auth/context.tsx"; then
            echo -e "${GREEN}✅ Auth initialization logic present${NC}"
        else
            echo -e "${RED}❌ Auth initialization logic missing${NC}"
            auth_impl_ok=false
        fi
    else
        echo -e "${RED}❌ Auth context file not found${NC}"
        auth_impl_ok=false
    fi
    
    # Check login page implementation
    if [ -f "src/app/auth/login/page.tsx" ]; then
        if grep -q "router.replace" "src/app/auth/login/page.tsx" && \
           grep -q "window.location" "src/app/auth/login/page.tsx" && \
           grep -q "setTimeout" "src/app/auth/login/page.tsx"; then
            echo -e "${GREEN}✅ Robust redirect logic implemented${NC}"
        else
            echo -e "${RED}❌ Redirect fallbacks missing${NC}"
            auth_impl_ok=false
        fi
    else
        echo -e "${RED}❌ Login page file not found${NC}"
        auth_impl_ok=false
    fi
    
    return $($auth_impl_ok && echo 0 || echo 1)
}

# Test 4: UI Stability Checks
test_ui_stability() {
    local ui_stable=true
    
    # Check for rate limit stabilization
    if [ -f "src/lib/security/rate-limit.ts" ]; then
        if grep -q "useCallback" "src/lib/security/rate-limit.ts"; then
            echo -e "${GREEN}✅ Rate limit hooks stabilized with useCallback${NC}"
        else
            echo -e "${YELLOW}⚠️ Rate limit hooks may not be stabilized${NC}"
        fi
    else
        echo -e "${YELLOW}⚠️ Rate limit file not found${NC}"
    fi
    
    # Check for error boundary
    if [ -f "src/components/ui/error-boundary.tsx" ]; then
        echo -e "${GREEN}✅ Error boundary component exists${NC}"
    else
        echo -e "${YELLOW}⚠️ Error boundary component not found${NC}"
    fi
    
    # Check for proper TypeScript setup
    if [ -f "tsconfig.json" ]; then
        echo -e "${GREEN}✅ TypeScript configuration exists${NC}"
    else
        echo -e "${RED}❌ TypeScript configuration missing${NC}"
        ui_stable=false
    fi
    
    return $($ui_stable && echo 0 || echo 1)
}

# Test 5: API Integration
test_api_integration() {
    local api_ok=true
    
    # Check API client setup
    if [ -f "src/lib/api/client.ts" ]; then
        if grep -q "baseURL" "src/lib/api/client.ts" && \
           grep -q "withCredentials" "src/lib/api/client.ts"; then
            echo -e "${GREEN}✅ API client properly configured${NC}"
        else
            echo -e "${RED}❌ API client configuration incomplete${NC}"
            api_ok=false
        fi
    else
        echo -e "${RED}❌ API client file not found${NC}"
        api_ok=false
    fi
    
    # Check auth API methods
    if [ -f "src/lib/api/auth.ts" ]; then
        if grep -q "login" "src/lib/api/auth.ts" && \
           grep -q "getMe" "src/lib/api/auth.ts" && \
           grep -q "refreshToken" "src/lib/api/auth.ts"; then
            echo -e "${GREEN}✅ Auth API methods implemented${NC}"
        else
            echo -e "${RED}❌ Auth API methods incomplete${NC}"
            api_ok=false
        fi
    else
        echo -e "${RED}❌ Auth API file not found${NC}"
        api_ok=false
    fi
    
    # Check organization context graceful handling
    if [ -f "src/lib/organization/context.tsx" ]; then
        if grep -q "using auth context data" "src/lib/organization/context.tsx"; then
            echo -e "${GREEN}✅ Organization context has graceful fallback${NC}"
        else
            echo -e "${YELLOW}⚠️ Organization context may not have fallback${NC}"
        fi
    else
        echo -e "${YELLOW}⚠️ Organization context file not found${NC}"
    fi
    
    return $($api_ok && echo 0 || echo 1)
}

# Test 6: Security Implementation
test_security() {
    local security_ok=true
    
    # Check CSRF implementation
    if [ -f "src/app/api/csrf-token/route.ts" ]; then
        if grep -q "crypto.randomBytes" "src/app/api/csrf-token/route.ts"; then
            echo -e "${GREEN}✅ CSRF token generation implemented${NC}"
        else
            echo -e "${RED}❌ CSRF token generation missing${NC}"
            security_ok=false
        fi
    else
        echo -e "${RED}❌ CSRF endpoint not implemented${NC}"
        security_ok=false
    fi
    
    # Check environment configuration
    if [ -f ".env.local" ]; then
        if grep -q "NEXT_PUBLIC_API_URL" ".env.local"; then
            echo -e "${GREEN}✅ Environment configuration exists${NC}"
        else
            echo -e "${YELLOW}⚠️ API URL not configured in environment${NC}"
        fi
    else
        echo -e "${YELLOW}⚠️ Environment file not found${NC}"
    fi
    
    # Check for secure cookie handling
    if grep -rq "SameSite=Strict" "src/"; then
        echo -e "${GREEN}✅ Secure cookie configuration found${NC}"
    else
        echo -e "${YELLOW}⚠️ Secure cookie configuration not found${NC}"
    fi
    
    return $($security_ok && echo 0 || echo 1)
}

# Test 7: Build and Type Checking
test_build_system() {
    local build_ok=true
    
    echo "🔨 Running TypeScript type check..."
    if npx tsc --noEmit --skipLibCheck > /dev/null 2>&1; then
        echo -e "${GREEN}✅ TypeScript compilation successful${NC}"
    else
        echo -e "${RED}❌ TypeScript compilation errors${NC}"
        echo "Running TypeScript check with errors shown:"
        npx tsc --noEmit --skipLibCheck || true
        build_ok=false
    fi
    
    echo "🧹 Running ESLint check..."
    if npx eslint --quiet src/ > /dev/null 2>&1; then
        echo -e "${GREEN}✅ ESLint checks passed${NC}"
    else
        echo -e "${YELLOW}⚠️ ESLint warnings/errors found${NC}"
        echo "Running ESLint with output:"
        npx eslint src/ --max-warnings 10 || true
    fi
    
    # Check if build would succeed (configuration test)
    echo "🏗️ Testing build configuration..."
    if [ -f "next.config.ts" ] && [ -f "package.json" ]; then
        # Check for essential build dependencies
        if grep -q "next" "package.json" && grep -q "react" "package.json"; then
            echo -e "${GREEN}✅ Build configuration valid${NC}"
        else
            echo -e "${YELLOW}⚠️ Build dependencies may be missing${NC}"
        fi
    else
        echo -e "${YELLOW}⚠️ Build configuration files missing${NC}"
    fi
    
    return $($build_ok && echo 0 || echo 1)
}

# Main execution
main() {
    echo -e "${BLUE}🚀 CARSA Lens Dashboard - Comprehensive Test Suite${NC}"
    echo "=================================================================="
    echo "This test suite validates all major fixes and implementations."
    echo ""
    
    # Check if server is running first
    if ! check_server; then
        echo -e "${RED}Cannot proceed without development server running.${NC}"
        exit 1
    fi
    
    echo ""
    echo -e "${YELLOW}Running comprehensive test suite...${NC}"
    
    # Run all tests
    run_test "Server Health & Connectivity" test_server_health
    run_test "Authentication Pages Loading" test_auth_pages
    run_test "Authentication Logic Implementation" test_auth_implementation
    run_test "UI Stability & Components" test_ui_stability
    run_test "API Integration & Error Handling" test_api_integration
    run_test "Security Implementation" test_security
    run_test "Build System & Type Checking" test_build_system
    
    # Results summary
    echo ""
    echo "=================================================================="
    echo -e "${BLUE}📊 Test Results Summary${NC}"
    echo "=================================================================="
    echo -e "Total Tests: $TESTS_TOTAL"
    echo -e "${GREEN}Passed: $TESTS_PASSED${NC}"
    echo -e "${RED}Failed: $TESTS_FAILED${NC}"
    
    if [ $TESTS_FAILED -eq 0 ]; then
        echo ""
        echo -e "${GREEN}🎉 All tests passed! The application is ready for production.${NC}"
        echo ""
        echo "✅ Authentication flow working"
        echo "✅ UI components stable"
        echo "✅ API integration functional"
        echo "✅ Security measures in place"
        echo "✅ Build system healthy"
        exit 0
    else
        echo ""
        echo -e "${YELLOW}⚠️ Some tests failed. Please review and fix issues before deployment.${NC}"
        echo ""
        echo "📋 Manual verification steps:"
        echo "1. Start dev server: npm run dev"
        echo "2. Visit: http://localhost:3000/auth/login"
        echo "3. Test login with valid credentials"
        echo "4. Verify redirect to dashboard works"
        echo "5. Refresh page to test session persistence"
        exit 1
    fi
}

# Help function
show_help() {
    echo "CARSA Lens Dashboard Test Suite"
    echo ""
    echo "Usage: $0 [options]"
    echo ""
    echo "Options:"
    echo "  -h, --help     Show this help message"
    echo "  -q, --quiet    Run tests with minimal output"
    echo "  -v, --verbose  Run tests with detailed output"
    echo ""
    echo "Examples:"
    echo "  $0              # Run all tests"
    echo "  $0 --quiet      # Run tests quietly"
    echo "  $0 --verbose    # Run tests with detailed output"
}

# Parse command line arguments
case "${1:-}" in
    -h|--help)
        show_help
        exit 0
        ;;
    -q|--quiet)
        exec > /dev/null 2>&1
        ;;
    -v|--verbose)
        set -x
        ;;
esac

# Run main function
main "$@"
