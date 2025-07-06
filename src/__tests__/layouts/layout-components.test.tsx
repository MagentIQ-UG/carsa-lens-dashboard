/**
 * Layout Components Tests
 * Testing the layout components for Task 4.3
 */

import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';

import { PageHeader, HeaderActions } from '@/components/layouts/page-header';

// Mock Next.js navigation hooks
jest.mock('next/navigation', () => ({
  usePathname: () => '/dashboard',
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
  }),
}));

describe('Layout Components', () => {
  describe('PageHeader', () => {
    it('renders with title and subtitle', () => {
      render(
        <PageHeader 
          title="Test Page" 
          subtitle="This is a test page description"
        />
      );

      expect(screen.getByText('Test Page')).toBeInTheDocument();
      expect(screen.getByText('This is a test page description')).toBeInTheDocument();
    });

    it('renders breadcrumbs when provided', () => {
      const breadcrumbs = [
        { label: 'Projects', href: '/projects' },
        { label: 'Analytics', href: '/analytics' },
      ];

      render(
        <PageHeader 
          title="Test Reports Page" 
          breadcrumbs={breadcrumbs}
        />
      );

      expect(screen.getByText('Projects')).toBeInTheDocument();
      expect(screen.getByText('Analytics')).toBeInTheDocument();
      expect(screen.getByText('Test Reports Page')).toBeInTheDocument();
    });

    it('renders custom actions', () => {
      const actions = (
        <button>Custom Action</button>
      );

      render(
        <PageHeader 
          title="Test Page"
          actions={actions}
        />
      );

      expect(screen.getByText('Custom Action')).toBeInTheDocument();
    });

    it('renders additional content', () => {
      render(
        <PageHeader title="Test Page">
          <div>Additional Content</div>
        </PageHeader>
      );

      expect(screen.getByText('Additional Content')).toBeInTheDocument();
    });
  });

  describe('HeaderActions', () => {
    it('renders primary action', () => {
      const primaryAction = {
        label: 'Save',
        onClick: jest.fn(),
      };

      render(
        <HeaderActions primaryAction={primaryAction} />
      );

      expect(screen.getByText('Save')).toBeInTheDocument();
    });

    it('renders secondary actions', () => {
      const secondaryActions = [
        { label: 'Cancel', onClick: jest.fn() },
        { label: 'Reset', onClick: jest.fn() },
      ];

      render(
        <HeaderActions secondaryActions={secondaryActions} />
      );

      expect(screen.getByText('Cancel')).toBeInTheDocument();
      expect(screen.getByText('Reset')).toBeInTheDocument();
    });

    it('renders both primary and secondary actions', () => {
      const primaryAction = {
        label: 'Save',
        onClick: jest.fn(),
      };

      const secondaryActions = [
        { label: 'Cancel', onClick: jest.fn() },
      ];

      render(
        <HeaderActions 
          primaryAction={primaryAction}
          secondaryActions={secondaryActions}
        />
      );

      expect(screen.getByText('Save')).toBeInTheDocument();
      expect(screen.getByText('Cancel')).toBeInTheDocument();
    });

    it('shows loading state for primary action', () => {
      const primaryAction = {
        label: 'Save',
        onClick: jest.fn(),
        loading: true,
      };

      render(
        <HeaderActions primaryAction={primaryAction} />
      );

      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });
  });
});