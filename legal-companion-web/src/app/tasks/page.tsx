'use client';

import { useState } from 'react';
import { Sidebar } from '@/components/layout/sidebar';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { mockTasks, mockDocuments, mockInsuranceDocuments } from '@/lib/mock-data';
import { Task, Priority } from '@/types';
import {
  CheckCircle,
  Circle,
  Clock,
  AlertCircle,
  Filter,
  Plus,
  Calendar,
  FileText,
  MoreVertical,
  Trash2,
  Edit3,
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import Link from 'next/link';

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');

  const allDocuments = [...mockDocuments, ...mockInsuranceDocuments];

  // Filter tasks
  const filteredTasks = tasks.filter(task => {
    if (filterStatus !== 'all' && task.status !== filterStatus) return false;
    if (filterPriority !== 'all' && task.priority !== filterPriority) return false;
    return true;
  });

  // Group tasks by status
  const pendingTasks = filteredTasks.filter(t => t.status === 'pending');
  const inProgressTasks = filteredTasks.filter(t => t.status === 'in_progress');
  const completedTasks = filteredTasks.filter(t => t.status === 'completed');

  const handleToggleComplete = (taskId: string) => {
    setTasks(prev =>
      prev.map(task =>
        task.id === taskId
          ? {
              ...task,
              status: task.status === 'completed' ? 'pending' : 'completed',
              completedAt: task.status === 'completed' ? undefined : new Date(),
            }
          : task
      )
    );
  };

  const handleDeleteTask = (taskId: string) => {
    if (confirm('Are you sure you want to delete this task?')) {
      setTasks(prev => prev.filter(t => t.id !== taskId));
    }
  };

  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case 'critical':
        return 'critical';
      case 'high':
        return 'warning';
      case 'medium':
        return 'info';
      default:
        return 'outline';
    }
  };

  const getPriorityIcon = (priority: Priority) => {
    switch (priority) {
      case 'critical':
      case 'high':
        return AlertCircle;
      default:
        return Clock;
    }
  };

  const TaskCard = ({ task }: { task: Task }) => {
    const PriorityIcon = getPriorityIcon(task.priority);
    const document = task.documentId
      ? allDocuments.find(d => d.id === task.documentId)
      : null;

    const isOverdue = task.dueDate && task.status !== 'completed' && new Date(task.dueDate) < new Date();

    return (
      <Card className={`${task.status === 'completed' ? 'opacity-60' : ''}`}>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            {/* Checkbox */}
            <button
              onClick={() => handleToggleComplete(task.id)}
              className="mt-1 flex-shrink-0"
            >
              {task.status === 'completed' ? (
                <CheckCircle className="h-5 w-5 text-success" />
              ) : (
                <Circle className="h-5 w-5 text-gray-400 hover:text-primary transition-colors" />
              )}
            </button>

            {/* Task Details */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3
                  className={`font-medium text-gray-900 ${
                    task.status === 'completed' ? 'line-through' : ''
                  }`}
                >
                  {task.title}
                </h3>
                <button className="p-1 hover:bg-gray-100 rounded flex-shrink-0">
                  <MoreVertical className="h-4 w-4 text-gray-400" />
                </button>
              </div>

              {task.description && (
                <p className="text-sm text-gray-600 mb-3">{task.description}</p>
              )}

              <div className="flex flex-wrap items-center gap-2">
                {/* Priority Badge */}
                <Badge variant={getPriorityColor(task.priority)} className="flex items-center gap-1">
                  <PriorityIcon className="h-3 w-3" />
                  {task.priority}
                </Badge>

                {/* Status Badge */}
                {task.status === 'in_progress' && (
                  <Badge variant="info">In Progress</Badge>
                )}

                {/* Due Date */}
                {task.dueDate && (
                  <div className={`flex items-center gap-1 text-xs ${
                    isOverdue ? 'text-critical' : 'text-gray-600'
                  }`}>
                    <Calendar className="h-3 w-3" />
                    {format(task.dueDate, 'MMM d, yyyy')}
                    {!task.completedAt && (
                      <span className="ml-1">
                        ({formatDistanceToNow(task.dueDate, { addSuffix: true })})
                      </span>
                    )}
                  </div>
                )}

                {/* Related Document */}
                {document && (
                  <Link href={`/documents/${document.id}`}>
                    <div className="flex items-center gap-1 text-xs text-gray-600 hover:text-primary transition-colors cursor-pointer">
                      <FileText className="h-3 w-3" />
                      <span className="truncate max-w-[200px]">{document.title}</span>
                    </div>
                  </Link>
                )}

                {/* Completed Date */}
                {task.completedAt && (
                  <div className="flex items-center gap-1 text-xs text-success">
                    <CheckCircle className="h-3 w-3" />
                    Completed {formatDistanceToNow(task.completedAt, { addSuffix: true })}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2 mt-3">
                <Button size="sm" variant="outline">
                  <Edit3 className="h-3 w-3 mr-1" />
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDeleteTask(task.id)}
                  className="text-critical hover:bg-critical/10"
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  Delete
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <main className="flex-1 lg:ml-0">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 lg:px-8 py-4 mt-14 lg:mt-0">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
              <p className="text-sm text-gray-600 mt-1">
                Manage your legal tasks and to-dos
              </p>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Task
            </Button>
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

                    {/* Status Filter */}
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Status</h4>
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="status"
                            value="all"
                            checked={filterStatus === 'all'}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="text-primary focus:ring-primary"
                          />
                          <span className="text-sm">All Tasks</span>
                          <span className="text-xs text-gray-500 ml-auto">({tasks.length})</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="status"
                            value="pending"
                            checked={filterStatus === 'pending'}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="text-primary focus:ring-primary"
                          />
                          <span className="text-sm">Pending</span>
                          <span className="text-xs text-gray-500 ml-auto">
                            ({tasks.filter(t => t.status === 'pending').length})
                          </span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="status"
                            value="in_progress"
                            checked={filterStatus === 'in_progress'}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="text-primary focus:ring-primary"
                          />
                          <span className="text-sm">In Progress</span>
                          <span className="text-xs text-gray-500 ml-auto">
                            ({tasks.filter(t => t.status === 'in_progress').length})
                          </span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="status"
                            value="completed"
                            checked={filterStatus === 'completed'}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="text-primary focus:ring-primary"
                          />
                          <span className="text-sm">Completed</span>
                          <span className="text-xs text-gray-500 ml-auto">
                            ({tasks.filter(t => t.status === 'completed').length})
                          </span>
                        </label>
                      </div>
                    </div>

                    {/* Priority Filter */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Priority</h4>
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="priority"
                            value="all"
                            checked={filterPriority === 'all'}
                            onChange={(e) => setFilterPriority(e.target.value)}
                            className="text-primary focus:ring-primary"
                          />
                          <span className="text-sm">All Priorities</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="priority"
                            value="critical"
                            checked={filterPriority === 'critical'}
                            onChange={(e) => setFilterPriority(e.target.value)}
                            className="text-primary focus:ring-primary"
                          />
                          <span className="text-sm flex items-center gap-1">
                            <AlertCircle className="h-3 w-3 text-critical" />
                            Critical
                          </span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="priority"
                            value="high"
                            checked={filterPriority === 'high'}
                            onChange={(e) => setFilterPriority(e.target.value)}
                            className="text-primary focus:ring-primary"
                          />
                          <span className="text-sm flex items-center gap-1">
                            <AlertCircle className="h-3 w-3 text-warning" />
                            High
                          </span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="priority"
                            value="medium"
                            checked={filterPriority === 'medium'}
                            onChange={(e) => setFilterPriority(e.target.value)}
                            className="text-primary focus:ring-primary"
                          />
                          <span className="text-sm">Medium</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="priority"
                            value="low"
                            checked={filterPriority === 'low'}
                            onChange={(e) => setFilterPriority(e.target.value)}
                            className="text-primary focus:ring-primary"
                          />
                          <span className="text-sm">Low</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Stats Card */}
              <Card className="mt-4">
                <CardContent className="p-4">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">Statistics</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Tasks</span>
                      <span className="font-medium">{tasks.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Pending</span>
                      <span className="font-medium text-warning">{pendingTasks.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">In Progress</span>
                      <span className="font-medium text-primary">{inProgressTasks.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Completed</span>
                      <span className="font-medium text-success">{completedTasks.length}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Tasks List */}
            <div className="lg:col-span-3">
              {filteredTasks.length > 0 ? (
                <div className="space-y-3">
                  {filteredTasks.map(task => (
                    <TaskCard key={task.id} task={task} />
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-12 text-center">
                    <CheckCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      No tasks found
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {filterStatus !== 'all' || filterPriority !== 'all'
                        ? 'Try adjusting your filters'
                        : 'Create your first task to get started'}
                    </p>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Task
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
