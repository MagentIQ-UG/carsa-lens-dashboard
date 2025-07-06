/**
 * Landing Page
 * Public landing page for CARSA Lens Dashboard
 */

'use client';

// Force dynamic rendering for this page since it may use context
export const dynamic = 'force-dynamic';

import { Building2, Users, BarChart3, Zap } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="relative bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-2">
              <Building2 className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">CARSA Lens</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/login">
                <Button variant="outline">Sign In</Button>
              </Link>
              <Link href="/login">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Enterprise-Grade
            <span className="text-blue-600 block">Recruitment Dashboard</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Streamline your hiring process with AI-powered candidate evaluation, 
            comprehensive analytics, and seamless team collaboration.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link href="/login">
              <Button size="lg" className="w-full sm:w-auto">
                Start Free Trial
              </Button>
            </Link>
            <Link href="#features">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                Learn More
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Section */}
        <div id="features" className="grid md:grid-cols-3 gap-8 mt-24">
          <div className="bg-white rounded-lg p-8 shadow-lg text-center">
            <div className="bg-blue-100 rounded-full p-4 w-16 h-16 mx-auto mb-4">
              <Users className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Multi-Tenant Organizations
            </h3>
            <p className="text-gray-600">
              Complete organization management with role-based access control, 
              member management, and invitation systems.
            </p>
          </div>

          <div className="bg-white rounded-lg p-8 shadow-lg text-center">
            <div className="bg-green-100 rounded-full p-4 w-16 h-16 mx-auto mb-4">
              <Zap className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              AI-Powered Evaluations
            </h3>
            <p className="text-gray-600">
              Leverage artificial intelligence to evaluate candidates objectively 
              and make data-driven hiring decisions.
            </p>
          </div>

          <div className="bg-white rounded-lg p-8 shadow-lg text-center">
            <div className="bg-purple-100 rounded-full p-4 w-16 h-16 mx-auto mb-4">
              <BarChart3 className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Advanced Analytics
            </h3>
            <p className="text-gray-600">
              Track hiring metrics, diversity insights, and performance analytics 
              to optimize your recruitment process.
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-24 bg-white rounded-2xl p-12 shadow-lg">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to Transform Your Hiring?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Join leading companies using CARSA Lens for their recruitment needs.
          </p>
          <Link href="/login">
            <Button size="lg">
              Get Started Today
            </Button>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Building2 className="h-6 w-6 text-blue-600" />
              <span className="text-lg font-semibold text-gray-900">CARSA Lens</span>
            </div>
            <div className="text-sm text-gray-500">
              © 2025 CARSA Lens. Built with Next.js 15 & React 19.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}