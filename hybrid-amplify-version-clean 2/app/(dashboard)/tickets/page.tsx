'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, Ticket as TicketIcon, AlertCircle, ListTodo, GitPullRequest, CheckCircle2, Archive } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTickets, useUpdateTicket } from '@/lib/api/tickets';
import { Ticket, TicketFilters } from '@/types';
import { formatDate } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function TicketsPage() {
  const [filters, setFilters] = useState<TicketFilters>({});
  const { data, isLoading } = useTickets(filters);

  const getTypeBadge = (type: string) => {
    const variants: Record<string, any> = {
      bug: 'destructive',
      feature: 'default',
      enhancement: 'secondary',
      task: 'outline',
    };
    return <Badge variant={variants[type]}>{type}</Badge>;
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

  const getStatusIcon = (status: string) => {
    const icons: Record<string, any> = {
      backlog: Archive,
      todo: ListTodo,
      in_progress: GitPullRequest,
      review: AlertCircle,
      done: CheckCircle2,
    };
    const Icon = icons[status] || TicketIcon;
    return <Icon className="h-4 w-4" />;
  };

  const tickets = data?.data || [];

  const ticketsByStatus = {
    backlog: tickets.filter((t) => t.status === 'backlog'),
    todo: tickets.filter((t) => t.status === 'todo'),
    in_progress: tickets.filter((t) => t.status === 'in_progress'),
    review: tickets.filter((t) => t.status === 'review'),
    done: tickets.filter((t) => t.status === 'done'),
  };

  const handleStatusChange = async (ticketId: string, newStatus: Ticket['status']) => {
    // Visual feedback only - in a real implementation, this would call the API
    console.log(`Moving ticket ${ticketId} to ${newStatus}`);
  };

  const TicketCard = ({ ticket }: { ticket: Ticket }) => (
    <Card className="mb-3 hover:bg-accent/50 transition-colors cursor-pointer">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center space-x-2">
            {getTypeBadge(ticket.type)}
            {getPriorityBadge(ticket.priority)}
          </div>
        </div>
        <CardTitle className="text-sm">
          <Link href={`/tickets/${ticket.id}`} className="hover:underline">
            {ticket.title}
          </Link>
        </CardTitle>
        <CardDescription className="text-xs">
          Created {formatDate(ticket.createdAt)} by {ticket.createdBy}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
          {ticket.description}
        </p>
        {ticket.assignedTo && (
          <p className="text-xs">
            <span className="text-muted-foreground">Assigned:</span>{' '}
            <span className="font-medium">{ticket.assignedTo}</span>
          </p>
        )}
        <div className="mt-2">
          <Select
            value={ticket.status}
            onValueChange={(value) => handleStatusChange(ticket.id, value as Ticket['status'])}
          >
            <SelectTrigger className="h-7 text-xs">
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
        </div>
      </CardContent>
    </Card>
  );

  const KanbanColumn = ({
    status,
    title,
    tickets,
    icon: Icon
  }: {
    status: string;
    title: string;
    tickets: Ticket[];
    icon: any;
  }) => (
    <div className="flex-1 min-w-[280px]">
      <div className="bg-muted/50 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Icon className="h-4 w-4 text-muted-foreground" />
            <h3 className="font-semibold text-sm">{title}</h3>
            <Badge variant="secondary" className="ml-1">
              {tickets.length}
            </Badge>
          </div>
        </div>
        <div className="space-y-2">
          {tickets.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-xs">
              No tickets
            </div>
          ) : (
            tickets.map((ticket) => (
              <TicketCard key={ticket.id} ticket={ticket} />
            ))
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tickets</h1>
          <p className="text-muted-foreground">Track and manage engineering tickets</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Ticket
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Backlog</CardTitle>
            <Archive className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ticketsByStatus.backlog.length}</div>
            <p className="text-xs text-muted-foreground">Awaiting triage</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">To Do</CardTitle>
            <ListTodo className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ticketsByStatus.todo.length}</div>
            <p className="text-xs text-muted-foreground">Ready to start</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <GitPullRequest className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ticketsByStatus.in_progress.length}</div>
            <p className="text-xs text-muted-foreground">Being worked on</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Review</CardTitle>
            <AlertCircle className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ticketsByStatus.review.length}</div>
            <p className="text-xs text-muted-foreground">Under review</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Done</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ticketsByStatus.done.length}</div>
            <p className="text-xs text-muted-foreground">Completed</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4">
        <Select
          value={filters.type || 'all'}
          onValueChange={(value) =>
            setFilters({ ...filters, type: value === 'all' ? undefined : value as Ticket['type'] })
          }
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="bug">Bug</SelectItem>
            <SelectItem value="feature">Feature</SelectItem>
            <SelectItem value="enhancement">Enhancement</SelectItem>
            <SelectItem value="task">Task</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.status || 'all'}
          onValueChange={(value) =>
            setFilters({ ...filters, status: value === 'all' ? undefined : value as Ticket['status'] })
          }
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="backlog">Backlog</SelectItem>
            <SelectItem value="todo">To Do</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="review">Review</SelectItem>
            <SelectItem value="done">Done</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.priority || 'all'}
          onValueChange={(value) =>
            setFilters({ ...filters, priority: value === 'all' ? undefined : value as Ticket['priority'] })
          }
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Kanban Board */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="overflow-x-auto pb-4">
          <div className="flex space-x-4 min-w-max">
            <KanbanColumn
              status="backlog"
              title="Backlog"
              tickets={ticketsByStatus.backlog}
              icon={Archive}
            />
            <KanbanColumn
              status="todo"
              title="To Do"
              tickets={ticketsByStatus.todo}
              icon={ListTodo}
            />
            <KanbanColumn
              status="in_progress"
              title="In Progress"
              tickets={ticketsByStatus.in_progress}
              icon={GitPullRequest}
            />
            <KanbanColumn
              status="review"
              title="Review"
              tickets={ticketsByStatus.review}
              icon={AlertCircle}
            />
            <KanbanColumn
              status="done"
              title="Done"
              tickets={ticketsByStatus.done}
              icon={CheckCircle2}
            />
          </div>
        </div>
      )}
    </div>
  );
}
