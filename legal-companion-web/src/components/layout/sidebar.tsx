'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  FileText,
  MessageSquare,
  Calendar,
  Bell,
  FileEdit,
  Settings,
  Menu,
  X,
  Lightbulb,
  Shield,
  CheckSquare
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Documents', href: '/documents', icon: FileText },
  { name: 'Insurance', href: '/insurance', icon: Shield },
  { name: 'Tasks', href: '/tasks', icon: CheckSquare },
  { name: 'Document Q&A', href: '/assistant', icon: MessageSquare },
  { name: 'Legal Guidance', href: '/legal-help', icon: Lightbulb },
  { name: 'Calendar', href: '/calendar', icon: Calendar },
  { name: 'Notifications', href: '/notifications', icon: Bell },
  { name: 'Templates', href: '/templates', icon: FileEdit },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <span className="font-semibold text-lg">Legal Companion</span>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-md hover:bg-gray-100"
        >
          {isMobileMenuOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>
      </div>

      {/* Sidebar for desktop and mobile menu */}
      <aside
        className={cn(
          "fixed lg:sticky top-0 left-0 z-40 h-screen w-64 border-r border-gray-200 bg-white transition-transform lg:translate-x-0",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="hidden lg:flex items-center gap-2 border-b border-gray-200 px-6 py-4">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold text-lg">Legal Companion</span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-3 py-4 mt-14 lg:mt-0">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* User info */}
          <div className="border-t border-gray-200 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-sm font-semibold text-primary">RK</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  Rajesh Kumar
                </p>
                <p className="text-xs text-gray-500 truncate">
                  Tamil Nadu, India
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  );
}
