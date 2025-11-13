'use client';

import { useState } from 'react';
import { Sidebar } from '@/components/layout/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  User,
  Mail,
  MapPin,
  Bell,
  Calendar,
  Cloud,
  Shield,
  Database,
  Folder,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Trash2,
  ExternalLink,
} from 'lucide-react';
import { format } from 'date-fns';

// Mock data for Google Drive connection
const mockDriveConnection = {
  id: '1',
  userId: '1',
  googleAccountEmail: 'user@gmail.com',
  status: 'connected' as const,
  folderId: 'folder123',
  folderName: 'Legal Documents',
  folderPath: 'My Drive > Documents > Legal Documents',
  autoSync: true,
  syncFrequency: 'hourly' as const,
  lastSync: new Date('2025-11-05T05:00:00'),
  nextSync: new Date('2025-11-05T07:00:00'),
  fileTypes: ['pdf', 'docx', 'jpg', 'png'],
  includeSubfolders: true,
  totalFiles: 47,
  syncedFiles: 45,
  failedFiles: 2,
  connectedAt: new Date('2025-11-01'),
  updatedAt: new Date('2025-11-05'),
};

export default function SettingsPage() {
  const [driveConnected, setDriveConnected] = useState(true);
  const [autoSync, setAutoSync] = useState(mockDriveConnection.autoSync);
  const [includeSubfolders, setIncludeSubfolders] = useState(mockDriveConnection.includeSubfolders);
  const [syncFrequency, setSyncFrequency] = useState(mockDriveConnection.syncFrequency);

  const handleConnectDrive = () => {
    // In real implementation, this would initiate OAuth flow
    console.log('Initiating Google OAuth...');
    // window.location.href = '/api/auth/google/signin';
  };

  const handleDisconnectDrive = () => {
    if (confirm('Are you sure you want to disconnect Google Drive? Your existing documents will be kept.')) {
      setDriveConnected(false);
    }
  };

  const handleSyncNow = () => {
    console.log('Starting manual sync...');
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <main className="flex-1 lg:ml-0">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 lg:px-8 py-4 mt-14 lg:mt-0">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
            <p className="text-sm text-gray-600 mt-1">
              Manage your account and preferences
            </p>
          </div>
        </header>

        <div className="p-4 lg:p-8 max-w-5xl">
          <div className="space-y-6">
            {/* Profile Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Profile Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <Input defaultValue="Rajesh Kumar" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <Input defaultValue="rajesh.kumar@email.com" type="email" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone
                    </label>
                    <Input defaultValue="+91 9876543210" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <MapPin className="h-4 w-4 inline mr-1" />
                      Location
                    </label>
                    <Input defaultValue="Chennai, Tamil Nadu, India" />
                  </div>
                </div>
                <Button>Save Changes</Button>
              </CardContent>
            </Card>

            {/* Google Drive Integration */}
            <Card className={driveConnected ? 'border-success/30' : ''}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Cloud className="h-5 w-5" />
                    Google Drive Integration
                  </CardTitle>
                  {driveConnected ? (
                    <Badge variant="success" className="flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" />
                      Connected
                    </Badge>
                  ) : (
                    <Badge variant="outline">Not Connected</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {!driveConnected ? (
                  /* Not Connected State */
                  <div className="text-center py-8">
                    <Cloud className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Connect Google Drive
                    </h3>
                    <p className="text-sm text-gray-600 mb-6 max-w-md mx-auto">
                      Automatically sync your legal documents from Google Drive. No more manual uploads!
                    </p>
                    <div className="space-y-3 text-left max-w-sm mx-auto mb-6">
                      <div className="flex items-start gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                        <span>Auto-sync new documents</span>
                      </div>
                      <div className="flex items-start gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                        <span>Keep documents in your Drive</span>
                      </div>
                      <div className="flex items-start gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                        <span>Read-only access</span>
                      </div>
                      <div className="flex items-start gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                        <span>You control which folder to sync</span>
                      </div>
                    </div>
                    <Button onClick={handleConnectDrive} className="gap-2">
                      <Cloud className="h-4 w-4" />
                      Sign in with Google
                    </Button>
                    <p className="text-xs text-gray-500 mt-4">
                      🔒 We only access the folder you choose
                    </p>
                  </div>
                ) : (
                  /* Connected State */
                  <div className="space-y-6">
                    {/* Account Info */}
                    <div className="flex items-center gap-3 p-4 bg-success/5 rounded-lg border border-success/20">
                      <div className="w-12 h-12 rounded-full bg-success flex items-center justify-center">
                        <Mail className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {mockDriveConnection.googleAccountEmail}
                        </p>
                        <p className="text-xs text-gray-600">
                          Connected on {format(mockDriveConnection.connectedAt, 'MMM d, yyyy')}
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        Switch Account
                      </Button>
                    </div>

                    {/* Synced Folder */}
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <Folder className="h-4 w-4" />
                        Synced Folder
                      </h4>
                      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">
                              {mockDriveConnection.folderName}
                            </p>
                            <p className="text-sm text-gray-600 mt-1">
                              {mockDriveConnection.folderPath}
                            </p>
                          </div>
                          <Button variant="outline" size="sm">
                            Change Folder
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Sync Settings */}
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 mb-3">Sync Settings</h4>
                      <div className="space-y-4">
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={autoSync}
                            onChange={(e) => setAutoSync(e.target.checked)}
                            className="rounded border-gray-300 text-primary focus:ring-primary"
                          />
                          <div>
                            <p className="font-medium text-sm text-gray-900">Auto-sync new files</p>
                            <p className="text-xs text-gray-600">
                              Automatically sync new documents added to the folder
                            </p>
                          </div>
                        </label>

                        <label className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={includeSubfolders}
                            onChange={(e) => setIncludeSubfolders(e.target.checked)}
                            className="rounded border-gray-300 text-primary focus:ring-primary"
                          />
                          <div>
                            <p className="font-medium text-sm text-gray-900">Include subfolders</p>
                            <p className="text-xs text-gray-600">
                              Sync files from subfolders within the selected folder
                            </p>
                          </div>
                        </label>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Sync Frequency
                          </label>
                          <select
                            value={syncFrequency}
                            onChange={(e) => setSyncFrequency(e.target.value as any)}
                            className="w-full md:w-auto rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                          >
                            <option value="realtime">Real-time (with webhooks)</option>
                            <option value="hourly">Every hour</option>
                            <option value="daily">Daily</option>
                            <option value="manual">Manual only</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            File Types
                          </label>
                          <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm">
                              <input type="checkbox" defaultChecked className="rounded border-gray-300" />
                              PDF documents
                            </label>
                            <label className="flex items-center gap-2 text-sm">
                              <input type="checkbox" defaultChecked className="rounded border-gray-300" />
                              Word documents (.docx)
                            </label>
                            <label className="flex items-center gap-2 text-sm">
                              <input type="checkbox" defaultChecked className="rounded border-gray-300" />
                              Images (for OCR)
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Sync Statistics */}
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 mb-3">Sync Statistics</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 bg-primary/5 rounded-lg">
                          <p className="text-sm text-gray-600">Total Files</p>
                          <p className="text-2xl font-bold text-primary">
                            {mockDriveConnection.totalFiles}
                          </p>
                        </div>
                        <div className="p-4 bg-success/5 rounded-lg">
                          <p className="text-sm text-gray-600">Synced</p>
                          <p className="text-2xl font-bold text-success">
                            {mockDriveConnection.syncedFiles}
                          </p>
                        </div>
                        <div className="p-4 bg-critical/5 rounded-lg">
                          <p className="text-sm text-gray-600">Failed</p>
                          <p className="text-2xl font-bold text-critical">
                            {mockDriveConnection.failedFiles}
                          </p>
                        </div>
                      </div>
                      <div className="mt-4 p-3 bg-gray-50 rounded border border-gray-200 text-sm">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-gray-600">Last sync:</span>
                          <span className="font-medium">
                            {format(mockDriveConnection.lastSync, 'MMM d, h:mm a')}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Next sync:</span>
                          <span className="font-medium">
                            {format(mockDriveConnection.nextSync!, 'MMM d, h:mm a')}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-3">
                      <Button onClick={handleSyncNow} className="gap-2">
                        <RefreshCw className="h-4 w-4" />
                        Sync Now
                      </Button>
                      <Button variant="outline" className="gap-2">
                        <ExternalLink className="h-4 w-4" />
                        Open in Drive
                      </Button>
                      <Button variant="outline">
                        {autoSync ? 'Pause Auto-Sync' : 'Resume Auto-Sync'}
                      </Button>
                    </div>

                    {/* Danger Zone */}
                    <div className="pt-6 border-t border-gray-200">
                      <h4 className="text-sm font-semibold text-critical mb-3 flex items-center gap-2">
                        <AlertCircle className="h-4 w-4" />
                        Danger Zone
                      </h4>
                      <p className="text-sm text-gray-600 mb-3">
                        Disconnecting will stop syncing new files. Your existing documents will be kept in the library.
                      </p>
                      <Button variant="danger" onClick={handleDisconnectDrive} className="gap-2">
                        <Trash2 className="h-4 w-4" />
                        Disconnect Google Drive
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Notifications */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notifications
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <p className="font-medium text-sm">Email Notifications</p>
                    <p className="text-xs text-gray-600">Receive email updates for important events</p>
                  </div>
                  <input type="checkbox" defaultChecked className="rounded border-gray-300" />
                </label>
                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <p className="font-medium text-sm">Push Notifications</p>
                    <p className="text-xs text-gray-600">Browser notifications for urgent matters</p>
                  </div>
                  <input type="checkbox" defaultChecked className="rounded border-gray-300" />
                </label>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quiet Hours
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-gray-600">From</label>
                      <Input type="time" defaultValue="22:00" />
                    </div>
                    <div>
                      <label className="text-xs text-gray-600">To</label>
                      <Input type="time" defaultValue="08:00" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Security */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Security
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Button variant="outline">Change Password</Button>
                </div>
                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <p className="font-medium text-sm">Two-Factor Authentication</p>
                    <p className="text-xs text-gray-600">Add an extra layer of security</p>
                  </div>
                  <Badge variant="outline">Not Enabled</Badge>
                </label>
              </CardContent>
            </Card>

            {/* Data & Storage */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Data & Storage
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Storage Used</p>
                    <p className="text-xs text-gray-600">2.4 GB of 100 GB</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary">2.4%</p>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full" style={{ width: '2.4%' }}></div>
                </div>
                <div className="pt-4 space-y-2">
                  <Button variant="outline" className="w-full">Export All Data</Button>
                  <Button variant="outline" className="w-full text-critical">Delete Account</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
