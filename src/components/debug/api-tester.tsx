/**
 * API Endpoint Tester
 * Debug component to test candidate API endpoints
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { apiClient } from '@/lib/api/client';

export function APITester() {
  const [candidateId, setCandidateId] = useState('');
  const [results, setResults] = useState<any>({});
  const [loading, setLoading] = useState<string | null>(null);

  const testEndpoint = async (name: string, url: string) => {
    if (!candidateId) {
      alert('Please enter a candidate ID');
      return;
    }

    setLoading(name);
    try {
      const response = await apiClient.get(url.replace('{candidate_id}', candidateId));
      setResults((prev: any) => ({
        ...prev,
        [name]: {
          status: 'success',
          data: response.data,
          headers: response.headers
        }
      }));
      console.warn(`✅ ${name} Response:`, response.data);
    } catch (error: any) {
      setResults((prev: any) => ({
        ...prev,
        [name]: {
          status: 'error',
          error: error.message,
          response: error.response?.data
        }
      }));
      console.error(`❌ ${name} Error:`, error);
    }
    setLoading(null);
  };

  const endpoints = [
    { name: 'Get Candidate', url: '/candidates/{candidate_id}' },
    { name: 'Get Profile', url: '/candidates/{candidate_id}/profile' },
    { name: 'Get Documents', url: '/candidates/{candidate_id}/documents' },
  ];

  return (
    <Card className="w-full max-w-4xl mx-auto mt-8">
      <CardHeader>
        <CardTitle>API Endpoint Tester</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Enter candidate ID"
            value={candidateId}
            onChange={(e) => setCandidateId(e.target.value)}
            className="flex-1"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {endpoints.map(endpoint => (
            <Button
              key={endpoint.name}
              onClick={() => testEndpoint(endpoint.name, endpoint.url)}
              disabled={loading === endpoint.name}
              variant="outline"
            >
              {loading === endpoint.name ? 'Testing...' : `Test ${endpoint.name}`}
            </Button>
          ))}
        </div>

        {Object.keys(results).length > 0 && (
          <div className="space-y-4">
            <h3 className="font-semibold">Results:</h3>
            {Object.entries(results).map(([name, result]: [string, any]) => (
              <div key={name} className="border rounded p-4">
                <h4 className="font-medium mb-2">{name}</h4>
                <div className="text-sm">
                  <div className={`mb-2 ${result.status === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                    Status: {result.status}
                  </div>
                  <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto max-h-40">
                    {JSON.stringify(result.status === 'success' ? result.data : result.error, null, 2)}
                  </pre>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}