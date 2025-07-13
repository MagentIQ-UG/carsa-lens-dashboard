/**
 * UI Components Tests
 * Testing the new UI components for Task 4.2
 */

import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Container } from '@/components/ui/container';
import { MetricsCard } from '@/components/ui/metrics-card';
import { Skeleton } from '@/components/ui/skeleton';

describe('UI Components', () => {
  describe('Badge Component', () => {
    it('renders default badge correctly', () => {
      render(<Badge>Test Badge</Badge>);
      expect(screen.getByText('Test Badge')).toBeInTheDocument();
    });

    it('applies variant classes correctly', () => {
      render(<Badge variant="success">Success</Badge>);
      const badge = screen.getByText('Success');
      expect(badge).toHaveClass('bg-green-100', 'text-green-800');
    });
  });

  describe('Card Component', () => {
    it('renders card with content', () => {
      render(
        <Card>
          <CardHeader>Header</CardHeader>
          <CardContent>Content</CardContent>
        </Card>
      );
      
      expect(screen.getByText('Header')).toBeInTheDocument();
      expect(screen.getByText('Content')).toBeInTheDocument();
    });

    it('applies variant classes correctly', () => {
      render(<Card variant="elevated">Elevated Card</Card>);
      const cardContainer = screen.getByText('Elevated Card').closest('[class*="shadow-elevation"]');
      expect(cardContainer).toHaveClass('shadow-elevation-4');
    });
  });

  describe('Container Component', () => {
    it('renders with default props', () => {
      render(<Container>Test Content</Container>);
      const container = screen.getByText('Test Content');
      expect(container).toHaveClass('max-w-7xl', 'mx-auto');
    });

    it('applies size variant correctly', () => {
      render(<Container size="sm">Small Container</Container>);
      const container = screen.getByText('Small Container');
      expect(container).toHaveClass('max-w-2xl');
    });
  });

  describe('Skeleton Component', () => {
    it('renders with default props', () => {
      render(<Skeleton data-testid="skeleton" />);
      const skeleton = screen.getByTestId('skeleton');
      expect(skeleton).toHaveClass('bg-gray-200', 'animate-pulse');
    });

    it('renders text variant correctly', () => {
      render(<Skeleton variant="text" data-testid="text-skeleton" />);
      const skeleton = screen.getByTestId('text-skeleton');
      expect(skeleton).toHaveClass('h-4', 'rounded-sm');
    });

    it('renders multiple lines for text variant', () => {
      const { container } = render(<Skeleton variant="text" lines={3} />);
      const skeletons = container.querySelectorAll('.bg-gray-200');
      expect(skeletons).toHaveLength(3);
    });
  });

  describe('MetricsCard Component', () => {
    it('renders with basic props', () => {
      render(
        <MetricsCard
          title="Test Metric"
          value={1234}
          subtitle="Test subtitle"
        />
      );
      
      expect(screen.getByText('Test Metric')).toBeInTheDocument();
      expect(screen.getByText('1,234')).toBeInTheDocument();
      expect(screen.getByText('Test subtitle')).toBeInTheDocument();
    });

    it('renders trend information correctly', () => {
      render(
        <MetricsCard
          title="Revenue"
          value={5000}
          trend={{ value: 12.5, direction: 'up', label: 'vs last month' }}
        />
      );
      
      expect(screen.getByText('+12.5%')).toBeInTheDocument();
      expect(screen.getByText('vs last month')).toBeInTheDocument();
    });

    it('renders loading state', () => {
      render(
        <MetricsCard
          title="Loading Metric"
          value={0}
          loading={true}
        />
      );
      
      // Should show loading animation instead of content
      expect(screen.queryByText('Loading Metric')).not.toBeInTheDocument();
    });
  });
});