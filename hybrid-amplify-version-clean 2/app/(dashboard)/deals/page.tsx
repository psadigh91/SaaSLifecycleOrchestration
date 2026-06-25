'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Plus, Search, Filter, DollarSign, TrendingUp, Target, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useDeals } from '@/lib/api/deals';
import { DealFilters } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function DealsPage() {
  const [filters, setFilters] = useState<DealFilters>({});
  const { data, isLoading } = useDeals(filters);

  // Calculate stats from deals data
  const stats = useMemo(() => {
    if (!data?.data) return null;

    const deals = data.data;
    const totalValue = deals.reduce((sum, deal) => sum + deal.value, 0);
    const avgProbability = deals.length > 0
      ? deals.reduce((sum, deal) => sum + deal.probability, 0) / deals.length
      : 0;

    const stageCount = deals.reduce((acc, deal) => {
      acc[deal.stage] = (acc[deal.stage] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const activeDeals = deals.filter(deal =>
      !['closed_won', 'closed_lost'].includes(deal.stage)
    ).length;

    return {
      totalDeals: deals.length,
      totalValue,
      avgProbability: Math.round(avgProbability),
      activeDeals,
      stageCount,
    };
  }, [data?.data]);

  const getStageBadge = (stage: string) => {
    const variants: Record<string, { variant: any; label: string; color: string }> = {
      prospecting: { variant: 'secondary', label: 'Prospecting', color: 'bg-gray-500' },
      qualification: { variant: 'default', label: 'Qualification', color: 'bg-blue-500' },
      proposal: { variant: 'default', label: 'Proposal', color: 'bg-purple-500' },
      negotiation: { variant: 'warning', label: 'Negotiation', color: 'bg-yellow-500' },
      closed_won: { variant: 'success', label: 'Closed Won', color: 'bg-green-500' },
      closed_lost: { variant: 'destructive', label: 'Closed Lost', color: 'bg-red-500' },
    };

    const config = variants[stage] || variants.prospecting;
    return (
      <Badge variant={config.variant} className="capitalize">
        {config.label}
      </Badge>
    );
  };

  const getProbabilityColor = (probability: number) => {
    if (probability >= 75) return 'text-green-600 font-semibold';
    if (probability >= 50) return 'text-blue-600 font-semibold';
    if (probability >= 25) return 'text-yellow-600 font-semibold';
    return 'text-gray-600';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Deals</h1>
          <p className="text-muted-foreground">Track and manage your sales pipeline</p>
        </div>
        <Link href="/deals/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Deal
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Pipeline Value</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.totalValue)}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Across {stats.totalDeals} deals
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Deals</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeDeals}</div>
              <p className="text-xs text-muted-foreground mt-1">
                In progress
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Win Probability</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.avgProbability}%</div>
              <p className="text-xs text-muted-foreground mt-1">
                Weighted average
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Closed Won</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.stageCount.closed_won || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Successfully closed
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium flex items-center">
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search deals..."
                className="pl-10"
                value={filters.search || ''}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              />
            </div>

            <Select
              value={filters.stage}
              onValueChange={(value) =>
                setFilters({ ...filters, stage: value as any })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="All Stages" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="prospecting">Prospecting</SelectItem>
                <SelectItem value="qualification">Qualification</SelectItem>
                <SelectItem value="proposal">Proposal</SelectItem>
                <SelectItem value="negotiation">Negotiation</SelectItem>
                <SelectItem value="closed_won">Closed Won</SelectItem>
                <SelectItem value="closed_lost">Closed Lost</SelectItem>
              </SelectContent>
            </Select>

            <Input
              placeholder="Min Value"
              type="number"
              value={filters.minValue || ''}
              onChange={(e) => setFilters({ ...filters, minValue: e.target.value ? Number(e.target.value) : undefined })}
            />

            <Input
              placeholder="Max Value"
              type="number"
              value={filters.maxValue || ''}
              onChange={(e) => setFilters({ ...filters, maxValue: e.target.value ? Number(e.target.value) : undefined })}
            />

            <Button
              variant="outline"
              onClick={() => setFilters({})}
            >
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Deals Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Stage</TableHead>
                  <TableHead>Probability</TableHead>
                  <TableHead>Close Date</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.data && data.data.length > 0 ? (
                  data.data.map((deal) => (
                    <TableRow key={deal.id}>
                      <TableCell className="font-medium">
                        <Link
                          href={`/deals/${deal.id}`}
                          className="hover:underline"
                        >
                          {deal.title}
                        </Link>
                      </TableCell>
                      <TableCell>{deal.customerName}</TableCell>
                      <TableCell className="font-semibold">{formatCurrency(deal.value)}</TableCell>
                      <TableCell>{getStageBadge(deal.stage)}</TableCell>
                      <TableCell>
                        <span className={getProbabilityColor(deal.probability)}>
                          {deal.probability}%
                        </span>
                      </TableCell>
                      <TableCell>{formatDate(deal.closeDate)}</TableCell>
                      <TableCell>{deal.owner}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/deals/${deal.id}`}>View</Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                      No deals found. Create your first deal to get started.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {data?.pagination && data.data.length > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {data.data.length} of {data.pagination.total} deals
          </p>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              disabled={data.pagination.page === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={data.pagination.page === data.pagination.totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
