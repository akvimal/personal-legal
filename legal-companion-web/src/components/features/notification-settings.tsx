'use client';

/**
 * Notification Settings Component
 * Allows users to configure notification preferences
 */

import { useState, useEffect } from 'react';
import { Bell, Mail, Smartphone, Clock, Save, Loader2 } from 'lucide-react';

interface NotificationPreferences {
  emailNotifications: boolean;
  pushNotifications: boolean;
  smsNotifications: boolean;
  quietHoursStart?: string;
  quietHoursEnd?: string;
}

export function NotificationSettings() {
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    quietHoursStart: '',
    quietHoursEnd: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/notifications/preferences');
      if (response.ok) {
        const data = await response.json();
        setPreferences({
          emailNotifications: data.data.preferences.emailNotifications,
          pushNotifications: data.data.preferences.pushNotifications,
          smsNotifications: data.data.preferences.smsNotifications,
          quietHoursStart: data.data.preferences.quietHoursStart || '',
          quietHoursEnd: data.data.preferences.quietHoursEnd || '',
        });
      }
    } catch (error) {
      console.error('Failed to fetch preferences:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const savePreferences = async () => {
    try {
      setIsSaving(true);
      setMessage('');

      const response = await fetch('/api/notifications/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preferences),
      });

      if (response.ok) {
        setMessage('Preferences saved successfully!');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('Failed to save preferences');
      }
    } catch (error) {
      console.error('Failed to save preferences:', error);
      setMessage('Failed to save preferences');
    } finally {
      setIsSaving(false);
    }
  };

  const requestBrowserNotifications = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        setPreferences((prev) => ({ ...prev, pushNotifications: true }));
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-6">
        <Bell className="w-6 h-6 text-gray-700" />
        <h2 className="text-xl font-semibold text-gray-900">Notification Settings</h2>
      </div>

      <div className="space-y-6">
        {/* Notification Channels */}
        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-3">Notification Channels</h3>
          <div className="space-y-3">
            {/* Email Notifications */}
            <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-gray-600" />
                <div>
                  <div className="text-sm font-medium text-gray-900">Email Notifications</div>
                  <div className="text-xs text-gray-500">Receive notifications via email</div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={preferences.emailNotifications}
                onChange={(e) =>
                  setPreferences((prev) => ({
                    ...prev,
                    emailNotifications: e.target.checked,
                  }))
                }
                className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            </label>

            {/* Push Notifications */}
            <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-gray-600" />
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    Browser Push Notifications
                  </div>
                  <div className="text-xs text-gray-500">
                    Receive real-time push notifications
                  </div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={preferences.pushNotifications}
                onChange={(e) => {
                  if (e.target.checked && Notification.permission === 'default') {
                    requestBrowserNotifications();
                  } else {
                    setPreferences((prev) => ({
                      ...prev,
                      pushNotifications: e.target.checked,
                    }));
                  }
                }}
                className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            </label>

            {/* SMS Notifications */}
            <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer opacity-50">
              <div className="flex items-center gap-3">
                <Smartphone className="w-5 h-5 text-gray-600" />
                <div>
                  <div className="text-sm font-medium text-gray-900">SMS Notifications</div>
                  <div className="text-xs text-gray-500">Coming soon</div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={preferences.smsNotifications}
                disabled
                className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            </label>
          </div>
        </div>

        {/* Quiet Hours */}
        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Quiet Hours (Optional)
          </h3>
          <p className="text-xs text-gray-600 mb-3">
            Set a time range when you don't want to receive notifications
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Start Time</label>
              <input
                type="time"
                value={preferences.quietHoursStart || ''}
                onChange={(e) =>
                  setPreferences((prev) => ({
                    ...prev,
                    quietHoursStart: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">End Time</label>
              <input
                type="time"
                value={preferences.quietHoursEnd || ''}
                onChange={(e) =>
                  setPreferences((prev) => ({
                    ...prev,
                    quietHoursEnd: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          {message && (
            <p
              className={`text-sm ${
                message.includes('success') ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {message}
            </p>
          )}
          <div className="ml-auto">
            <button
              onClick={savePreferences}
              disabled={isSaving}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Preferences
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
