import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  CheckSquare,
  Plus,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle2,
  Circle,
  MoreHorizontal,
  Search,
} from 'lucide-react';
import { Input } from '@/components/ui/input';

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  createdAt: string;
}

export const TasksPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<
    'all' | 'todo' | 'in-progress' | 'completed'
  >('all');

  // Mock data - in production this would come from API/database
  const [tasks] = useState<Task[]>([
    {
      id: '1',
      title: 'Set up JARVIS chat functionality',
      description: 'Configure AI webhook and test conversation flow',
      status: 'completed',
      priority: 'high',
      dueDate: '2024-01-20',
      createdAt: '2024-01-15',
    },
    {
      id: '2',
      title: 'Configure Supabase database',
      description: 'Set up authentication and message persistence',
      status: 'completed',
      priority: 'high',
      createdAt: '2024-01-16',
    },
    {
      id: '3',
      title: 'Deploy to production server',
      description: 'Set up Docker deployment and nginx configuration',
      status: 'in-progress',
      priority: 'medium',
      dueDate: '2024-01-25',
      createdAt: '2024-01-18',
    },
    {
      id: '4',
      title: 'Add file upload functionality',
      description: 'Allow users to upload and share files in chat',
      status: 'todo',
      priority: 'low',
      createdAt: '2024-01-19',
    },
  ]);

  const getStatusIcon = (status: Task['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      case 'in-progress':
        return <Clock className="w-4 h-4 text-blue-600" />;
      case 'todo':
        return <Circle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'high':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low':
        return 'text-green-600 bg-green-50 border-green-200';
    }
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || task.status === filter;
    return matchesSearch && matchesFilter;
  });

  const taskCounts = {
    all: tasks.length,
    todo: tasks.filter(t => t.status === 'todo').length,
    'in-progress': tasks.filter(t => t.status === 'in-progress').length,
    completed: tasks.filter(t => t.status === 'completed').length,
  };

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Tasks</h1>
            <p className="text-muted-foreground">
              Manage your tasks and track project progress.
            </p>
          </div>
          <Button disabled variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            Add Task
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Total Tasks
                  </p>
                  <p className="text-2xl font-bold">{taskCounts.all}</p>
                </div>
                <CheckSquare className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    To Do
                  </p>
                  <p className="text-2xl font-bold text-gray-600">
                    {taskCounts.todo}
                  </p>
                </div>
                <Circle className="h-8 w-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    In Progress
                  </p>
                  <p className="text-2xl font-bold text-blue-600">
                    {taskCounts['in-progress']}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Completed
                  </p>
                  <p className="text-2xl font-bold text-green-600">
                    {taskCounts.completed}
                  </p>
                </div>
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <div className="flex gap-4 items-center">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="flex gap-2">
            {(['all', 'todo', 'in-progress', 'completed'] as const).map(
              status => (
                <Button
                  key={status}
                  variant={filter === status ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter(status)}
                >
                  {status === 'all'
                    ? 'All'
                    : status === 'in-progress'
                      ? 'In Progress'
                      : status.charAt(0).toUpperCase() + status.slice(1)}
                </Button>
              )
            )}
          </div>
        </div>

        {/* Tasks List */}
        <div className="space-y-4">
          {filteredTasks.length > 0 ? (
            filteredTasks.map(task => (
              <Card key={task.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      {getStatusIcon(task.status)}
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground">
                          {task.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {task.description}
                        </p>

                        <div className="flex items-center gap-4 mt-3">
                          <span
                            className={`text-xs px-2 py-1 rounded-full border ${getPriorityColor(task.priority)}`}
                          >
                            {task.priority.charAt(0).toUpperCase() +
                              task.priority.slice(1)}{' '}
                            Priority
                          </span>

                          {task.dueDate && (
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Calendar className="w-4 h-4" />
                              <span>
                                Due{' '}
                                {new Date(task.dueDate).toLocaleDateString()}
                              </span>
                            </div>
                          )}

                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Clock className="w-4 h-4" />
                            <span>
                              Created{' '}
                              {new Date(task.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <Button variant="ghost" size="sm" disabled>
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <CheckSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No tasks found</h3>
                <p className="text-muted-foreground">
                  {searchTerm || filter !== 'all'
                    ? 'Try adjusting your search or filter criteria.'
                    : 'Create your first task to get started with project management.'}
                </p>
                <Button className="mt-4" disabled>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Task
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Feature Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-primary" />
                Smart Task Creation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Create tasks from chat conversations automatically. JARVIS can
                extract action items and create tasks for you.
              </p>
              <Button className="mt-4 w-full" variant="outline" disabled>
                Coming Soon
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-primary" />
                Priority Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Intelligent priority suggestions based on deadlines,
                dependencies, and your work patterns.
              </p>
              <Button className="mt-4 w-full" variant="outline" disabled>
                Coming Soon
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                Calendar Integration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Sync tasks with your calendar and get smart scheduling
                suggestions for optimal productivity.
              </p>
              <Button className="mt-4 w-full" variant="outline" disabled>
                Coming Soon
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
