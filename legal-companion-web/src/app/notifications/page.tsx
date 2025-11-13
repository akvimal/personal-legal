'use client';

import { useState } from 'react';
import { Sidebar } from '@/components/layout/sidebar';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { mockNotifications } from '@/lib/mock-data';
import { Notification } from '@/types';
import {
  Bell,
  CheckCircle,
  AlertTriangle,
  AlertCircle,
  Info,
  Filter,
  Check,
  X,
  Clock,
  FileText,
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterRead, setFilterRead] = useState<string>('all');

  // Filter notifications
  const filteredNotifications = notifications.filter(notif => {
    if (filterType !== 'all' && notif.type !== filterType) return false;
    if (filterRead === 'unread' && notif.isRead) return false;
    if (filterRead === 'read' && !notif.isRead) return false;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleMarkAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, isRead: true, readAt: new Date() } : n)
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev =>
      prev.map(n => ({ ...n, isRead: true, readAt: new Date() }))
    );
  };

  const handleDismiss = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'critical':
        return <AlertTriangle className="h-5 w-5 text-critical" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-warning" />;
      case 'success':
        return <CheckCircle className="h-5 w-5 text-success" />;
      default:
        return <Info className="h-5 w-5 text-primary" />;
    }
  };

  const getNotificationBadgeVariant = (type: Notification['type']) => {
    switch (type) {
      case 'critical':
        return 'critical' as const;
      case 'warning':
        return 'warning' as const;
      case 'success':
        return 'success' as const;
      default:
        return 'info' as const;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <main className="flex-1 lg:ml-0">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 lg:px-8 py-4 mt-14 lg:mt-0">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                Notifications
                {unreadCount > 0 && (
                  <Badge variant="critical" className="text-sm">
                    {unreadCount} unread
                  </Badge>
                )}
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Stay updated on important legal matters
              </p>
            </div>
            {unreadCount > 0 && (
              <Button variant="outline" size="sm" onClick={handleMarkAllAsRead}>
                <Check className="h-4 w-4 mr-2" />
                Mark all as read
              </Button>
            )}
          </div>
        </header>

        <div className="p-4 lg:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Filters Sidebar */}
            <div className="lg:col-span-1">
              <Card>
                <CardContent className="p-4 space-y-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Filter className="h-4 w-4" />
                      Filters
                    </h3>

                    {/* Type Filter */}
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Type</h4>
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="type"
                            value="all"
                            checked={filterType === 'all'}
                            onChange={(e) => setFilterType(e.target.value)}
                            className="text-primary focus:ring-primary"
                          />
                          <span className="text-sm">All Types</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="type"
                            value="critical"
                            checked={filterType === 'critical'}
                            onChange={(e) => setFilterType(e.target.value)}
                            className="text-primary focus:ring-primary"
                          />
                          <span className="text-sm flex items-center gap-2">
                            <AlertTriangle className="h-3 w-3 text-critical" />
                            Critical
                          </span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="type"
                            value="warning"
                            checked={filterType === 'warning'}
                            onChange={(e) => setFilterType(e.target.value)}
                            className="text-primary focus:ring-primary"
                          />
                          <span className="text-sm flex items-center gap-2">
                            <AlertCircle className="h-3 w-3 text-warning" />
                            Warning
                          </span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="type"
                            value="info"
                            checked={filterType === 'info'}
                            onChange={(e) => setFilterType(e.target.value)}
                            className="text-primary focus:ring-primary"
                          />
                          <span className="text-sm flex items-center gap-2">
                            <Info className="h-3 w-3 text-primary" />
                            Info
                          </span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="type"
                            value="success"
                            checked={filterType === 'success'}
                            onChange={(e) => setFilterType(e.target.value)}
                            className="text-primary focus:ring-primary"
                          />
                          <span className="text-sm flex items-center gap-2">
                            <CheckCircle className="h-3 w-3 text-success" />
                            Success
                          </span>
                        </label>
                      </div>
                    </div>

                    {/* Read Status Filter */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Status</h4>
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="read"
                            value="all"
                            checked={filterRead === 'all'}
                            onChange={(e) => setFilterRead(e.target.value)}
                            className="text-primary focus:ring-primary"
                          />
                          <span className="text-sm">All</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="read"
                            value="unread"
                            checked={filterRead === 'unread'}
                            onChange={(e) => setFilterRead(e.target.value)}
                            className="text-primary focus:ring-primary"
                          />
                          <span className="text-sm">Unread</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="read"
                            value="read"
                            checked={filterRead === 'read'}
                            onChange={(e) => setFilterRead(e.target.value)}
                            className="text-primary focus:ring-primary"
                          />
                          <span className="text-sm">Read</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Notifications List */}
            <div className="lg:col-span-3">
              <div className="space-y-3">
                {filteredNotifications.length > 0 ? (
                  filteredNotifications.map((notification) => (
                    <Card
                      key={notification.id}
                      className={`${!notification.isRead ? 'border-l-4 border-l-primary bg-primary/5' : ''}`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          {/* Icon */}
                          <div className="flex-shrink-0 mt-1">
                            {getNotificationIcon(notification.type)}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-4 mb-2">
                              <div className="flex items-center gap-2 flex-wrap">
                                <Badge variant={getNotificationBadgeVariant(notification.type)}>
                                  {notification.type}
                                </Badge>
                                {!notification.isRead && (
                                  <Badge variant="info" className="text-xs">
                                    NEW
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-1">
                                {!notification.isRead && (
                                  <button
                                    onClick={() => handleMarkAsRead(notification.id)}
                                    className="p-2 hover:bg-gray-100 rounded-md transition-colors"
                                    title="Mark as read"
                                  >
                                    <Check className="h-4 w-4 text-gray-600" />
                                  </button>
                                )}
                                <button
                                  onClick={() => handleDismiss(notification.id)}
                                  className="p-2 hover:bg-gray-100 rounded-md transition-colors"
                                  title="Dismiss"
                                >
                                  <X className="h-4 w-4 text-gray-600" />
                                </button>
                              </div>
                            </div>

                            <h3 className="font-semibold text-gray-900 mb-1">
                              {notification.title}
                            </h3>
                            <p className="text-sm text-gray-700 mb-3">
                              {notification.message}
                            </p>

                            {/* Timestamp */}
                            <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                              <Clock className="h-3 w-3" />
                              <span>{formatDistanceToNow(notification.createdAt, { addSuffix: true })}</span>
                              {notification.isRead && notification.readAt && (
                                <span className="text-gray-400">
                                  • Read {formatDistanceToNow(notification.readAt, { addSuffix: true })}
                                </span>
                              )}
                            </div>

                            {/* Actions */}
                            {notification.actions && notification.actions.length > 0 && (
                              <div className="flex flex-wrap gap-2">
                                {notification.actions.map((action, idx) => (
                                  <Button
                                    key={idx}
                                    size="sm"
                                    variant={action.variant || 'outline'}
                                  >
                                    {action.label}
                                  </Button>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Card>
                    <CardContent className="p-12 text-center">
                      <Bell className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        No notifications
                      </h3>
                      <p className="text-gray-600">
                        {filterType !== 'all' || filterRead !== 'all'
                          ? 'No notifications match your filters'
                          : "You're all caught up!"}
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
