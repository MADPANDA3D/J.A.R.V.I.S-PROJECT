/**
 * Bug Assignment Interface Component
 * UI for assigning bugs to team members with workload visualization and recommendations
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  User, 
  Users, 
  AlertTriangle, 
  TrendingUp, 
  Target,
  RefreshCw,
  Search,
  Star,
  Activity
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { 
  bugAssignmentSystem,
  type TeamMember,
  type AssignmentRecommendation,
  type WorkloadMetrics,
  type AssignmentMethod
} from '@/lib/assignmentSystem';
import { useBugLifecycle } from '@/hooks/useBugLifecycle';

interface AssignmentInterfaceProps {
  bugId: string;
  currentAssignee?: string;
  onAssignmentChange?: (assigneeId: string) => void;
}

export function AssignmentInterface({ 
  bugId, 
  currentAssignee, 
  onAssignmentChange 
}: AssignmentInterfaceProps) {
  const { toast } = useToast();
  const { bugReport, loading: bugLoading } = useBugLifecycle(bugId);
  
  const [isAssigning, setIsAssigning] = useState(false);
  const [showAssignmentDialog, setShowAssignmentDialog] = useState(false);
  const [selectedAssignee, setSelectedAssignee] = useState<string>('');
  const [assignmentReason, setAssignmentReason] = useState('');
  const [assignmentMethod, setAssignmentMethod] = useState<AssignmentMethod>('manual');
  const [recommendations, setRecommendations] = useState<AssignmentRecommendation[]>([]);
  const [workloadMetrics, setWorkloadMetrics] = useState<WorkloadMetrics[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [availabilityFilter, setAvailabilityFilter] = useState<string>('all');

  useEffect(() => {
    loadData();
  }, [bugId]);

  const loadData = async () => {
    try {
      // Load recommendations
      if (bugReport) => {
        const recs = await bugAssignmentSystem.getAssignmentRecommendations(bugReport);
        setRecommendations(recs);
      }

      // Load workload metrics
      const metrics = bugAssignmentSystem.getWorkloadMetrics();
      setWorkloadMetrics(metrics);

      // Load team members (in a real app, this would be from an API)
      const members = Array.from((bugAssignmentSystem as any).teamMembers.values());
      setTeamMembers(members);
    } catch (error) => {
      console.error('Failed to load assignment data:', error);
      toast({
        title: "Error",
        description: "Failed to load assignment data",
        variant: "destructive"
      });
    }
  };

  const handleAssignment = async () => {
    if (!selectedAssignee) => {
      toast({
        title: "Error",
        description: "Please select an assignee",
        variant: "destructive"
      });
      return;
    }

    setIsAssigning(true);
    try {
      const result = await bugAssignmentSystem.assignBug(
        bugId,
        selectedAssignee,
        'current_user', // In a real app, this would be the current user ID
        assignmentMethod,
        assignmentReason || undefined
      );

      if (result.success) => {
        toast({
          title: "Success",
          description: "Bug assigned successfully"
        });
        
        setShowAssignmentDialog(false);
        setSelectedAssignee('');
        setAssignmentReason('');
        
        if (onAssignmentChange) => {
          onAssignmentChange(selectedAssignee);
        }
        
        await loadData(); // Refresh data
      } else {
        throw new Error(result.error || 'Assignment failed');
      }
    } catch (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to assign bug",
        variant: "destructive"
      });
    } finally {
      setIsAssigning(false);
    }
  };

  const handleAutoAssignment = async () => {
    setIsAssigning(true);
    try {
      const assignedTo = await bugAssignmentSystem.autoAssignBug(bugId);
      
      if (assignedTo) => {
        toast({
          title: "Success",
          description: "Bug auto-assigned successfully"
        });
        
        if (onAssignmentChange) => {
          onAssignmentChange(assignedTo);
        }
        
        await loadData();
      } else {
        toast({
          title: "Warning",
          description: "No suitable assignee found for auto-assignment",
          variant: "destructive"
        });
      }
    } catch (error) => {
      toast({
        title: "Error",
        description: "Auto-assignment failed",
        variant: "destructive"
      });
    } finally {
      setIsAssigning(false);
    }
  };

  const filteredTeamMembers = teamMembers.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || member.role === roleFilter;
    const matchesAvailability = availabilityFilter === 'all' || member.availability === availabilityFilter;
    
    return matchesSearch && matchesRole && matchesAvailability;
  });

  const getAvailabilityColor = (availability: string) => {
    switch (availability) => {
      case 'available': return 'bg-green-500';
      case 'busy': return 'bg-yellow-500';
      case 'unavailable': return 'bg-red-500';
      case 'on_leave': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) => {
      case 'admin': return <Star className="h-4 w-4" />;
      case 'senior_dev': return <TrendingUp className="h-4 w-4" />;
      case 'developer': return <User className="h-4 w-4" />;
      case 'support': return <Users className="h-4 w-4" />;
      case 'qa': return <Target className="h-4 w-4" />;
      default: return <User className="h-4 w-4" />;
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (bugLoading) => {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <RefreshCw className="h-6 w-6 animate-spin mr-2" />
            Loading assignment data...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current Assignment */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Current Assignment
          </CardTitle>
        </CardHeader>
        <CardContent>
          {currentAssignee ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={`/avatars/${currentAssignee}.jpg`} />
                  <AvatarFallback>
                    {teamMembers.find(m => m.id === currentAssignee)?.name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">
                    {teamMembers.find(m => m.id === currentAssignee)?.name || 'Unknown User'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {teamMembers.find(m => m.id === currentAssignee)?.role}
                  </p>
                </div>
              </div>
              <Dialog open={showAssignmentDialog} onOpenChange={setShowAssignmentDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline">Reassign</Button>
                </DialogTrigger>
                <AssignmentDialog />
              </Dialog>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-muted-foreground mb-4">No one assigned to this bug</p>
              <div className="flex gap-2 justify-center">
                <Dialog open={showAssignmentDialog} onOpenChange={setShowAssignmentDialog}>
                  <DialogTrigger asChild>
                    <Button>Assign Manually</Button>
                  </DialogTrigger>
                  <AssignmentDialog />
                </Dialog>
                <Button variant="outline" onClick={handleAutoAssignment} disabled={isAssigning}>
                  {isAssigning ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : null}
                  Auto Assign
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Assignment Recommendations */}
      {recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Recommended Assignees
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recommendations.slice(0, 3).map((rec) => (
                <div key={rec.userId} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={`/avatars/${rec.userId}.jpg`} />
                      <AvatarFallback>{rec.userName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{rec.userName}</p>
                      <div className="flex gap-2 mt-1">
                        {rec.reasons.slice(0, 2).map((reason, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {reason}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-medium ${getConfidenceColor(rec.confidence)}`}>
                      {(rec.confidence * 100).toFixed(0)}% match
                    </p>
                    <p className="text-sm text-muted-foreground">
                      ~{rec.estimatedResolutionTime}h
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Team Workload Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Team Workload
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-64">
            <div className="space-y-3">
              {workloadMetrics.map((metrics) => {
                const member = teamMembers.find(m => m.id === metrics.userId);
                if (!member) return null;

                return (
                  <div key={metrics.userId} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Avatar>
                          <AvatarImage src={`/avatars/${metrics.userId}.jpg`} />
                          <AvatarFallback>{metrics.userName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full ${getAvailabilityColor(member.availability)}`} />
                      </div>
                      <div>
                        <p className="font-medium flex items-center gap-1">
                          {metrics.userName}
                          {getRoleIcon(member.role)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {metrics.totalAssigned} assigned • {metrics.openBugs} open
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2 mb-1">
                        <Progress value={metrics.workloadPercentage} className="w-16" />
                        <span className="text-sm font-medium">
                          {metrics.workloadPercentage.toFixed(0)}%
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Avg: {metrics.averageResolutionTime}h
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );

  function AssignmentDialog() => {
    return (
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Assign Bug</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="manual" className="h-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="manual">Manual Assignment</TabsTrigger>
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          </TabsList>
          
          <TabsContent value="manual" className="mt-4 space-y-4">
            {/* Filters */}
            <div className="flex gap-4">
              <div className="flex-1">
                <Label htmlFor="search">Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Search team members..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="role-filter">Role</Label>
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger id="role-filter" className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="senior_dev">Senior Dev</SelectItem>
                    <SelectItem value="developer">Developer</SelectItem>
                    <SelectItem value="support">Support</SelectItem>
                    <SelectItem value="qa">QA</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="availability-filter">Status</Label>
                <Select value={availabilityFilter} onValueChange={setAvailabilityFilter}>
                  <SelectTrigger id="availability-filter" className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="busy">Busy</SelectItem>
                    <SelectItem value="unavailable">Unavailable</SelectItem>
                    <SelectItem value="on_leave">On Leave</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Team Members List */}
            <ScrollArea className="h-64 border rounded-md p-2">
              <div className="space-y-2">
                {filteredTeamMembers.map((member) => {
                  const metrics = workloadMetrics.find(m => m.userId === member.id);
                  const isSelected = selectedAssignee === member.id;

                  return (
                    <div
                      key={member.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors hover:bg-accent ${
                        isSelected ? 'border-primary bg-accent' : ''
                      }`}
                      onClick={() => setSelectedAssignee(member.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <Avatar>
                              <AvatarImage src={`/avatars/${member.id}.jpg`} />
                              <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full ${getAvailabilityColor(member.availability)}`} />
                          </div>
                          <div>
                            <p className="font-medium flex items-center gap-1">
                              {member.name}
                              {getRoleIcon(member.role)}
                            </p>
                            <div className="flex gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {member.role}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {member.availability}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        {metrics && (
                          <div className="text-right">
                            <div className="flex items-center gap-2 mb-1">
                              <Progress value={metrics.workloadPercentage} className="w-12" />
                              <span className="text-xs">
                                {metrics.workloadPercentage.toFixed(0)}%
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {metrics.totalAssigned} assigned
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>

            {/* Assignment Details */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="assignment-method">Assignment Method</Label>
                <Select value={assignmentMethod} onValueChange={(value) => setAssignmentMethod(value as AssignmentMethod)}>
                  <SelectTrigger id="assignment-method">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manual">Manual Assignment</SelectItem>
                    <SelectItem value="skill_based">Skill-Based</SelectItem>
                    <SelectItem value="workload_balanced">Workload Balanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="assignment-reason">Reason (Optional)</Label>
                <Textarea
                  id="assignment-reason"
                  placeholder="Why are you assigning this bug to this person?"
                  value={assignmentReason}
                  onChange={(e) => setAssignmentReason(e.target.value)}
                  rows={3}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowAssignmentDialog(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAssignment}
                disabled={!selectedAssignee || isAssigning}
              >
                {isAssigning ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : null}
                Assign Bug
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="recommendations" className="mt-4 space-y-4">
            {recommendations.length > 0 ? (
              <div className="space-y-3">
                {recommendations.map((rec) => {
                  const isSelected = selectedAssignee === rec.userId;
                  
                  return (
                    <div
                      key={rec.userId}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors hover:bg-accent ${
                        isSelected ? 'border-primary bg-accent' : ''
                      }`}
                      onClick={() => setSelectedAssignee(rec.userId)}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={`/avatars/${rec.userId}.jpg`} />
                            <AvatarFallback>{rec.userName.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{rec.userName}</p>
                            <p className={`text-sm font-medium ${getConfidenceColor(rec.confidence)}`}>
                              {(rec.confidence * 100).toFixed(0)}% confidence match
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">
                            Est. resolution: ~{rec.estimatedResolutionTime}h
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Workload impact: {(rec.workloadImpact * 100).toFixed(0)}%
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        {rec.reasons.map((reason, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {reason}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  No recommendations available. This might be because all team members are at capacity or the bug lacks sufficient information for matching.
                </AlertDescription>
              </Alert>
            )}

            {/* Actions for recommendations */}
            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowAssignmentDialog(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAssignment}
                disabled={!selectedAssignee || isAssigning}
              >
                {isAssigning ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : null}
                Assign to Selected
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    );
  }
}