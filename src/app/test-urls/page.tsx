'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Mock profile data to test URLs
const mockProfile = {
  personal_info: {
    full_name: 'Mock Candidate',
    email: 'mock.candidate@verylongcompanyname.com',
    phone: '+1234567890',
    location: 'New York, NY',
    linkedin: 'https://linkedin.com/in/mockcandidate',
    github: 'https://github.com/mockcandidate',
    portfolio_url: 'https://mockcandidate.dev',
    website: 'https://mockcandidate.com',
    twitter: 'https://twitter.com/mockcandidate',
    stackoverflow: 'https://stackoverflow.com/users/123456/mockcandidate',
    behance: 'https://behance.net/mockcandidate',
    dribbble: 'https://dribbble.com/mockcandidate',
  }
};

export default function TestUrlsPage() {
  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-bold">URL Test Page</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Personal Information with URLs</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {mockProfile.personal_info?.email && (
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium">Email:</span>
              <span className="text-sm">{mockProfile.personal_info.email}</span>
            </div>
          )}
          
          <div className="pt-3 border-t border-gray-100">
            <div className="text-xs font-medium text-gray-500 mb-2">Online Profiles</div>
            <div className="space-y-2">
              {mockProfile.personal_info.linkedin && (
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-600 rounded flex items-center justify-center">
                    <span className="text-white text-[8px] font-bold">in</span>
                  </div>
                  <a 
                    href={mockProfile.personal_info.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:text-blue-800 underline"
                  >
                    LinkedIn: {mockProfile.personal_info.linkedin}
                  </a>
                </div>
              )}
              {mockProfile.personal_info.github && (
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-gray-700 rounded flex items-center justify-center">
                    <span className="text-white text-[8px] font-bold">GH</span>
                  </div>
                  <a 
                    href={mockProfile.personal_info.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:text-blue-800 underline"
                  >
                    GitHub: {mockProfile.personal_info.github}
                  </a>
                </div>
              )}
              {mockProfile.personal_info.portfolio_url && (
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-purple-600 rounded flex items-center justify-center">
                    <span className="text-white text-[8px] font-bold">P</span>
                  </div>
                  <a 
                    href={mockProfile.personal_info.portfolio_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:text-blue-800 underline"
                  >
                    Portfolio: {mockProfile.personal_info.portfolio_url}
                  </a>
                </div>
              )}
              {mockProfile.personal_info.website && (
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-600 rounded flex items-center justify-center">
                    <span className="text-white text-[8px] font-bold">W</span>
                  </div>
                  <a 
                    href={mockProfile.personal_info.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:text-blue-800 underline"
                  >
                    Website: {mockProfile.personal_info.website}
                  </a>
                </div>
              )}
              {mockProfile.personal_info.twitter && (
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-400 rounded flex items-center justify-center">
                    <span className="text-white text-[8px] font-bold">T</span>
                  </div>
                  <a 
                    href={mockProfile.personal_info.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:text-blue-800 underline"
                  >
                    Twitter: {mockProfile.personal_info.twitter}
                  </a>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Debug Information</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="text-xs bg-gray-100 p-4 rounded">
            {JSON.stringify(mockProfile.personal_info, null, 2)}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}
