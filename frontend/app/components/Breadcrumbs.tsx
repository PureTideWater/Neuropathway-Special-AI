'use client';

/**
 * Breadcrumb Navigation Component
 * Shows current location and allows easy navigation back
 */

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRightIcon, HomeIcon } from '@heroicons/react/24/outline';

interface BreadcrumbItem {
  label: string;
  href: string;
}

const routeLabels: Record<string, string> = {
  dashboard: 'Dashboard',
  iep: 'IEP',
  create: 'Create',
  edit: 'Edit',
  observations: 'Observations',
  goals: 'Goals',
  predictions: 'Predictions',
  meetings: 'Meetings',
  prep: 'Meeting Prep',
  parents: 'Parent Portal',
  integrations: 'Integrations',
  'google-classroom': 'Google Classroom',
  accommodations: 'Accommodations',
  recommend: 'Recommendations',
  compliance: 'Compliance',
  reports: 'Reports',
  requirements: 'Requirements',
  analytics: 'Analytics',
  roi: 'ROI Dashboard',
  marketplace: 'Marketplace',
  translations: 'Translations',
  mobile: 'Mobile',
  collect: 'Data Collection',
};

export function Breadcrumbs() {
  const pathname = usePathname();

  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    if (pathname === '/' || pathname === '/dashboard') {
      return [{ label: 'Dashboard', href: '/dashboard' }];
    }

    const paths = pathname.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [
      { label: 'Dashboard', href: '/dashboard' },
    ];

    let currentPath = '';
    paths.forEach((path, index) => {
      currentPath += `/${path}`;

      // Skip UUIDs and dynamic segments
      if (
        path.match(/^[a-f0-9-]{36}$/i) || // UUID
        path.startsWith('iep-') ||
        path.startsWith('student-') ||
        path.startsWith('district-')
      ) {
        // Use the previous label with "Details" or skip
        return;
      }

      const label = routeLabels[path] || path.charAt(0).toUpperCase() + path.slice(1);
      breadcrumbs.push({
        label,
        href: currentPath,
      });
    });

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  if (breadcrumbs.length <= 1) {
    return null; // Don't show breadcrumbs on dashboard
  }

  return (
    <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
      <Link
        href="/dashboard"
        className="flex items-center hover:text-gray-900 transition-colors"
      >
        <HomeIcon className="h-4 w-4" />
      </Link>

      {breadcrumbs.slice(1).map((crumb, index) => {
        const isLast = index === breadcrumbs.length - 2;
        return (
          <div key={crumb.href} className="flex items-center space-x-2">
            <ChevronRightIcon className="h-4 w-4 text-gray-400" />
            {isLast ? (
              <span className="font-medium text-gray-900">{crumb.label}</span>
            ) : (
              <Link
                href={crumb.href}
                className="hover:text-gray-900 transition-colors"
              >
                {crumb.label}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
}
