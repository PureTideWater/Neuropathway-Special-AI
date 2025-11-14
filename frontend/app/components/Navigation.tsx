'use client';

/**
 * Main Navigation Component
 * Persistent sidebar navigation for all PathWise features
 */

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  HomeIcon,
  DocumentTextIcon,
  MicrophoneIcon,
  CalendarIcon,
  UserGroupIcon,
  UsersIcon,
  ChartBarIcon,
  SparklesIcon,
  AcademicCapIcon,
  LightBulbIcon,
  ShieldCheckIcon,
  ChatBubbleLeftRightIcon,
  DevicePhoneMobileIcon,
  ShoppingBagIcon,
  CurrencyDollarIcon,
  Bars3Icon,
  XMarkIcon,
  ChevronDownIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';

interface NavItem {
  name: string;
  href: string;
  icon: any;
  badge?: string;
  children?: NavItem[];
}

const navigation: NavItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Create IEP', href: '/iep/create', icon: DocumentTextIcon },
  {
    name: 'Data Collection',
    href: '#',
    icon: MicrophoneIcon,
    children: [
      { name: 'Voice Observations', href: '/observations', icon: MicrophoneIcon },
      { name: 'Mobile Data', href: '/mobile/collect', icon: DevicePhoneMobileIcon },
    ],
  },
  {
    name: 'AI Features',
    href: '#',
    icon: SparklesIcon,
    badge: 'AI',
    children: [
      { name: 'Goal Predictions', href: '/goals/predictions', icon: SparklesIcon },
      { name: 'Goal Generator', href: '/goals/generate', icon: DocumentTextIcon, badge: 'NEW' },
      { name: 'Similar Students', href: '/students/student-123/similar-insights', icon: UsersIcon, badge: 'PREMIUM' },
      { name: 'Meeting Prep', href: '/meetings/prep/iep-123', icon: CalendarIcon },
      { name: 'Accommodations', href: '/accommodations/recommend/student-123', icon: LightBulbIcon },
    ],
  },
  {
    name: 'Collaboration',
    href: '#',
    icon: ChatBubbleLeftRightIcon,
    children: [
      { name: 'IEP Editor', href: '/iep/edit/iep-123', icon: DocumentTextIcon },
      { name: 'Comments', href: '/iep/edit/iep-123#comments', icon: ChatBubbleLeftRightIcon },
    ],
  },
  {
    name: 'Parents',
    href: '#',
    icon: UserGroupIcon,
    children: [
      { name: 'Parent Portal', href: '/parents/student-123', icon: UserGroupIcon },
      { name: 'Translations', href: '/translations', icon: ChatBubbleLeftRightIcon },
    ],
  },
  {
    name: 'Integrations',
    href: '#',
    icon: AcademicCapIcon,
    children: [
      { name: 'Google Classroom', href: '/integrations/google-classroom', icon: AcademicCapIcon },
    ],
  },
  {
    name: 'Compliance',
    href: '#',
    icon: ShieldCheckIcon,
    badge: 'Premium',
    children: [
      { name: 'Compliance Reports', href: '/compliance/reports', icon: ShieldCheckIcon },
      { name: 'State Requirements', href: '/compliance/requirements', icon: DocumentTextIcon },
    ],
  },
  {
    name: 'Analytics',
    href: '#',
    icon: ChartBarIcon,
    children: [
      { name: 'Progress Analytics', href: '/analytics', icon: ChartBarIcon },
      { name: 'District Dashboard', href: '/admin/district-dashboard', icon: UsersIcon, badge: 'Enterprise' },
      { name: 'ROI Dashboard', href: '/roi/district-123', icon: CurrencyDollarIcon },
    ],
  },
  { name: 'Marketplace', href: '/marketplace', icon: ShoppingBagIcon, badge: 'New' },
];

export function Navigation() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<string[]>(['AI Features', 'Compliance']);

  const toggleSection = (sectionName: string) => {
    setExpandedSections((prev) =>
      prev.includes(sectionName)
        ? prev.filter((name) => name !== sectionName)
        : [...prev, sectionName]
    );
  };

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href) && href !== '#';
  };

  const NavLink = ({ item, nested = false }: { item: NavItem; nested?: boolean }) => {
    const active = isActive(item.href);
    const Icon = item.icon;
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedSections.includes(item.name);

    if (hasChildren) {
      return (
        <div>
          <button
            onClick={() => toggleSection(item.name)}
            className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
              nested ? 'pl-10' : ''
            } ${
              active
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center">
              <Icon className="h-5 w-5 mr-3" />
              <span>{item.name}</span>
              {item.badge && (
                <span className="ml-2 px-2 py-0.5 text-xs font-semibold bg-blue-100 text-blue-700 rounded-full">
                  {item.badge}
                </span>
              )}
            </div>
            {isExpanded ? (
              <ChevronDownIcon className="h-4 w-4" />
            ) : (
              <ChevronRightIcon className="h-4 w-4" />
            )}
          </button>
          {isExpanded && (
            <div className="mt-1 space-y-1">
              {item.children.map((child) => (
                <NavLink key={child.name} item={child} nested={true} />
              ))}
            </div>
          )}
        </div>
      );
    }

    return (
      <Link
        href={item.href}
        onClick={() => setMobileMenuOpen(false)}
        className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
          nested ? 'pl-10' : ''
        } ${
          active
            ? 'bg-blue-50 text-blue-700'
            : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
        }`}
      >
        <Icon className="h-5 w-5 mr-3" />
        <span>{item.name}</span>
        {item.badge && (
          <span className="ml-2 px-2 py-0.5 text-xs font-semibold bg-blue-100 text-blue-700 rounded-full">
            {item.badge}
          </span>
        )}
      </Link>
    );
  };

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 bg-white rounded-lg shadow-lg border border-gray-200 hover:bg-gray-50"
        >
          {mobileMenuOpen ? (
            <XMarkIcon className="h-6 w-6 text-gray-700" />
          ) : (
            <Bars3Icon className="h-6 w-6 text-gray-700" />
          )}
        </button>
      </div>

      {/* Sidebar - Desktop */}
      <aside className="hidden lg:block fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200 overflow-y-auto">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center h-16 px-6 border-b border-gray-200">
            <Link href="/dashboard" className="flex items-center space-x-2">
              <SparklesIcon className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">PathWise</span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1">
            {navigation.map((item) => (
              <NavLink key={item.name} item={item} />
            ))}
          </nav>

          {/* User section */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                SJ
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">Sarah Johnson</p>
                <p className="text-xs text-gray-500">Teacher</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Sidebar - Mobile */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-gray-900 bg-opacity-50"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Sidebar */}
          <aside className="fixed inset-y-0 left-0 w-80 bg-white shadow-xl overflow-y-auto">
            <div className="flex flex-col h-full">
              {/* Logo */}
              <div className="flex items-center h-16 px-6 border-b border-gray-200">
                <Link href="/dashboard" className="flex items-center space-x-2">
                  <SparklesIcon className="h-8 w-8 text-blue-600" />
                  <span className="text-xl font-bold text-gray-900">PathWise</span>
                </Link>
              </div>

              {/* Navigation */}
              <nav className="flex-1 px-3 py-4 space-y-1">
                {navigation.map((item) => (
                  <NavLink key={item.name} item={item} />
                ))}
              </nav>

              {/* User section */}
              <div className="p-4 border-t border-gray-200">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                    SJ
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">Sarah Johnson</p>
                    <p className="text-xs text-gray-500">Teacher</p>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
