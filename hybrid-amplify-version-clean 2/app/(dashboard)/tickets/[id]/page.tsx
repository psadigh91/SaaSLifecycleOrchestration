'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Ticket as TicketIcon, User, Calendar, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useTicket, useUpdateTicket } from '@/lib/api/tickets';
import { formatDate } from '@/lib/utils';
import { Ticket } from '@/types';
import { useState } from 'react';

export default function TicketDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { data: ticket, isLoading } = useTicket(id);
  const updateTicket = useUpdateTicket(id);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const handleStatusChange = async (newStatus: Ticket['status']) => {
    setIsUpdatingStatus(true);
    try {
      await updateTicket.mutateAsync({ status: newStatus });
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!ticket) {
    return <div>Ticket not found</div>;
  }

  const getTypeBadge = (type: string) => {
    const variants: Record<string, any> = {
      bug: 'destructive',
      feature: 'default',
      enhancement: 'secondary',
      task: 'outline',
    };
    return <Badge variant={variants[type]}>{type}</Badge>;
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      backlog: 'secondary',
      todo: 'outline',
      in_progress: 'default',
      review: 'warning',
      done: 'success',
    };
    return <Badge variant={variants[status]}>{status.replace('_', ' ')}</Badge>;
  };

  const getPriorityBadge = (priority: string) => {
    const variants: Record<string, any> = {
      critical: 'destructive',
      high: 'warning',
      medium: 'default',
      low: 'secondary',
    };
    return <Badge variant={variants[priority]}>{priority}</Badge>;
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      critical: 'text-red-500',
      high: 'text-orange-500',
      medium: 'text-yellow-500',
      low: 'text-blue-500',
    };
    return colors[priority] || 'text-gray-500';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link href="/tickets">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            {getTypeBadge(ticket.type)}
            {getPriorityBadge(ticket.priority)}
            <h1 className="text-3xl font-bold tracking-tight">{ticket.title}</h1>
          </div>
          <p className="text-muted-foreground">
            Created by {ticket.createdBy} • {formatDate(ticket.createdAt)}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Select
            value={ticket.status}
            onValueChange={handleStatusChange}
            disabled={isUpdatingStatus}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="backlog">Backlog</SelectItem>
              <SelectItem value="todo">To Do</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="review">Review</SelectItem>
              <SelectItem value="done">Done</SelectItem>
            </SelectContent>
          </Select>
          {ticket.status === 'done' && (
            <CheckCircle2 className="h-5 w-5 text-green-500" />
          )}
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Priority</CardTitle>
            <AlertCircle className={`h-4 w-4 ${getPriorityColor(ticket.priority)}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getPriorityColor(ticket.priority)}`}>
              {ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {ticket.priority === 'critical' ? 'Requires immediate attention' :
               ticket.priority === 'high' ? 'High priority item' :
               ticket.priority === 'medium' ? 'Standard priority' : 'Low priority'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assigned To</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-medium">
              {ticket.assignedTo || 'Unassigned'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {ticket.assignedTo ? 'Currently assigned' : 'Available for assignment'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Time Open</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-medium">
              {ticket.status === 'done' ?
                `Completed in ${Math.round((new Date(ticket.updatedAt).getTime() - new Date(ticket.createdAt).getTime()) / (1000 * 60 * 60 * 24))}d` :
                `${Math.round((Date.now() - new Date(ticket.createdAt).getTime()) / (1000 * 60 * 60 * 24))}d open`
              }
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Last updated {formatDate(ticket.updatedAt)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Related Items Cards */}
      {(ticket.escalationId || ticket.featureGapId) && (
        <div className="grid gap-4 md:grid-cols-2">
          {ticket.escalationId && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Related Escalation</CardTitle>
              </CardHeader>
              <CardContent>
                <Link
                  href={`/escalations/${ticket.escalationId}`}
                  className="text-primary hover:underline flex items-center space-x-2"
                >
                  <AlertCircle className="h-4 w-4" />
                  <span>View Escalation #{ticket.escalationId.slice(-8)}</span>
                </Link>
                <p className="text-xs text-muted-foreground mt-2">
                  This ticket was created from an escalation
                </p>
              </CardContent>
            </Card>
          )}
          {ticket.featureGapId && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Related Feature Gap</CardTitle>
              </CardHeader>
              <CardContent>
                <Link
                  href={`/feature-gaps/${ticket.featureGapId}`}
                  className="text-primary hover:underline flex items-center space-x-2"
                >
                  <TicketIcon className="h-4 w-4" />
                  <span>View Feature Gap #{ticket.featureGapId.slice(-8)}</span>
                </Link>
                <p className="text-xs text-muted-foreground mt-2">
                  This ticket addresses a feature request
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Detailed Information */}
      <Tabs defaultValue="details" className="space-y-4">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="comments">Comments</TabsTrigger>
          <TabsTrigger value="related">Related Items</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm whitespace-pre-wrap">{ticket.description}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ticket Information</CardTitle>
              <CardDescription>
                Metadata and tracking details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium mb-1">Type</div>
                  <div>{getTypeBadge(ticket.type)}</div>
                </div>
                <div>
                  <div className="text-sm font-medium mb-1">Status</div>
                  <div>{getStatusBadge(ticket.status)}</div>
                </div>
                <div>
                  <div className="text-sm font-medium mb-1">Priority</div>
                  <div>{getPriorityBadge(ticket.priority)}</div>
                </div>
                <div>
                  <div className="text-sm font-medium mb-1">Created By</div>
                  <div className="text-sm text-muted-foreground">{ticket.createdBy}</div>
                </div>
                <div>
                  <div className="text-sm font-medium mb-1">Assigned To</div>
                  <div className="text-sm text-muted-foreground">
                    {ticket.assignedTo || 'Unassigned'}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium mb-1">Created Date</div>
                  <div className="text-sm text-muted-foreground">
                    {formatDate(ticket.createdAt)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle>Activity Timeline</CardTitle>
              <CardDescription>Ticket history and updates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 mt-2 rounded-full bg-primary" />
                  <div>
                    <div className="text-sm font-medium">Ticket Created</div>
                    <div className="text-xs text-muted-foreground">
                      {formatDate(ticket.createdAt)} by {ticket.createdBy}
                    </div>
                  </div>
                </div>
                {ticket.status === 'in_progress' && (
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 mt-2 rounded-full bg-blue-500" />
                    <div>
                      <div className="text-sm font-medium">In Progress</div>
                      <div className="text-xs text-muted-foreground">
                        Work started on this ticket
                      </div>
                    </div>
                  </div>
                )}
                {ticket.status === 'review' && (
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 mt-2 rounded-full bg-yellow-500" />
                    <div>
                      <div className="text-sm font-medium">In Review</div>
                      <div className="text-xs text-muted-foreground">
                        Ticket is under review
                      </div>
                    </div>
                  </div>
                )}
                {ticket.status === 'done' && (
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 mt-2 rounded-full bg-green-500" />
                    <div>
                      <div className="text-sm font-medium">Completed</div>
                      <div className="text-xs text-muted-foreground">
                        {formatDate(ticket.updatedAt)}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comments">
          <Card>
            <CardHeader>
              <CardTitle>Comments</CardTitle>
              <CardDescription>Discussion and updates</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                No comments yet. Be the first to comment on this ticket.
              </p>
              {/* TODO: Add comment system */}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="related" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Related Items</CardTitle>
              <CardDescription>
                Connected escalations, feature gaps, and other tickets
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {ticket.escalationId && (
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Escalation</span>
                    </div>
                    <Link href={`/escalations/${ticket.escalationId}`}>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </Link>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Ticket ID: {ticket.escalationId}
                  </p>
                </div>
              )}
              {ticket.featureGapId && (
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <TicketIcon className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Feature Gap</span>
                    </div>
                    <Link href={`/feature-gaps/${ticket.featureGapId}`}>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </Link>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Gap ID: {ticket.featureGapId}
                  </p>
                </div>
              )}
              {!ticket.escalationId && !ticket.featureGapId && (
                <p className="text-sm text-muted-foreground">
                  No related items found for this ticket.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
