'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, FileText, AlertTriangle, Bug, BookOpen, Lightbulb, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSearchAll, useSearchByType, SearchResult } from '@/lib/api/rag';
import { cn } from '@/lib/utils';

const TYPE_CONFIG = {
  escalation: {
    label: 'Escalations',
    icon: AlertTriangle,
    color: 'bg-red-500/10 text-red-500 border-red-500/20',
    route: '/escalations',
  },
  ticket: {
    label: 'Tickets',
    icon: Bug,
    color: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    route: '/tickets',
  },
  knowledge_base: {
    label: 'Knowledge Base',
    icon: BookOpen,
    color: 'bg-green-500/10 text-green-500 border-green-500/20',
    route: '/knowledge-base',
  },
  feature_gap: {
    label: 'Feature Gaps',
    icon: Lightbulb,
    color: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
    route: '/feature-gaps',
  },
};

type EntityType = keyof typeof TYPE_CONFIG;

export default function SearchPage() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | EntityType>('all');

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Fetch search results
  const { data: allResults, isLoading: isLoadingAll } = useSearchAll(
    { query: debouncedQuery, limit: 20, threshold: 0.5 },
    activeTab === 'all' && debouncedQuery.length > 0
  );

  const { data: escalationResults, isLoading: isLoadingEscalations } = useSearchByType(
    { query: debouncedQuery, type: 'escalation', limit: 20, threshold: 0.5 },
    activeTab === 'escalation' && debouncedQuery.length > 0
  );

  const { data: ticketResults, isLoading: isLoadingTickets } = useSearchByType(
    { query: debouncedQuery, type: 'ticket', limit: 20, threshold: 0.5 },
    activeTab === 'ticket' && debouncedQuery.length > 0
  );

  const { data: knowledgeResults, isLoading: isLoadingKnowledge } = useSearchByType(
    { query: debouncedQuery, type: 'knowledge_base', limit: 20, threshold: 0.5 },
    activeTab === 'knowledge_base' && debouncedQuery.length > 0
  );

  const { data: featureGapResults, isLoading: isLoadingFeatureGaps } = useSearchByType(
    { query: debouncedQuery, type: 'feature_gap', limit: 20, threshold: 0.5 },
    activeTab === 'feature_gap' && debouncedQuery.length > 0
  );

  const isLoading =
    isLoadingAll ||
    isLoadingEscalations ||
    isLoadingTickets ||
    isLoadingKnowledge ||
    isLoadingFeatureGaps;

  // Get counts for each type from all results
  const typeCounts = allResults?.reduce(
    (acc, result) => {
      const type = result.type || 'unknown';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  ) || {};

  const getResultsForTab = (): SearchResult[] => {
    switch (activeTab) {
      case 'all':
        return allResults || [];
      case 'escalation':
        return escalationResults || [];
      case 'ticket':
        return ticketResults || [];
      case 'knowledge_base':
        return knowledgeResults || [];
      case 'feature_gap':
        return featureGapResults || [];
      default:
        return [];
    }
  };

  const handleResultClick = (result: SearchResult) => {
    const type = result.type as EntityType;
    const config = TYPE_CONFIG[type];
    if (config && result.id) {
      router.push(`${config.route}/${result.id}`);
    }
  };

  const getSimilarityColor = (score: number) => {
    if (score >= 0.9) return 'text-green-600 dark:text-green-400';
    if (score >= 0.8) return 'text-blue-600 dark:text-blue-400';
    if (score >= 0.7) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-gray-600 dark:text-gray-400';
  };

  const renderResults = () => {
    const results = getResultsForTab();

    if (!debouncedQuery) {
      return (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-64 space-y-4">
            <Search className="h-12 w-12 text-muted-foreground" />
            <div className="text-center space-y-2">
              <p className="text-lg font-medium">Start searching</p>
              <p className="text-sm text-muted-foreground max-w-md">
                Use semantic search to find escalations, tickets, knowledge base articles, and feature gaps.
                Search understands context and meaning, not just keywords.
              </p>
            </div>
          </CardContent>
        </Card>
      );
    }

    if (isLoading) {
      return (
        <Card>
          <CardContent className="flex items-center justify-center h-64">
            <div className="flex flex-col items-center space-y-3">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Searching...</p>
            </div>
          </CardContent>
        </Card>
      );
    }

    if (results.length === 0) {
      return (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-64 space-y-4">
            <FileText className="h-12 w-12 text-muted-foreground" />
            <div className="text-center space-y-2">
              <p className="text-lg font-medium">No results found</p>
              <p className="text-sm text-muted-foreground">
                Try adjusting your search query or browse a different category
              </p>
            </div>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="space-y-3">
        {results.map((result) => {
          const type = result.type as EntityType;
          const config = TYPE_CONFIG[type];
          const Icon = config?.icon || FileText;

          return (
            <Card
              key={result.id}
              className="hover:bg-accent/50 transition-all cursor-pointer hover:shadow-md border-l-4"
              style={{
                borderLeftColor: type
                  ? config?.color.split(' ')[0].replace('bg-', '').replace('/10', '')
                  : 'transparent',
              }}
              onClick={() => handleResultClick(result)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="mt-1">
                      <Icon className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        {config && (
                          <Badge variant="outline" className={config.color}>
                            {config.label}
                          </Badge>
                        )}
                        <span className={cn('text-sm font-mono font-semibold', getSimilarityColor(result.similarity))}>
                          {(result.similarity * 100).toFixed(1)}%
                        </span>
                      </div>
                      <CardTitle className="text-lg mt-2 line-clamp-2">
                        {result.metadata?.title || 'Untitled'}
                      </CardTitle>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {result.content || result.metadata?.description || result.metadata?.snippet || 'No description available'}
                </p>
                {result.metadata?.tags && Array.isArray(result.metadata.tags) && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {result.metadata.tags.slice(0, 5).map((tag: string, idx: number) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Semantic Search</h1>
        <p className="text-muted-foreground">
          AI-powered search across escalations, tickets, knowledge base, and feature gaps
        </p>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search by meaning, not just keywords... (e.g., 'login issues affecting enterprise customers')"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10 h-12 text-base"
          autoFocus
        />
      </div>

      {/* Results Count */}
      {debouncedQuery && !isLoading && (
        <div className="text-sm text-muted-foreground">
          {getResultsForTab().length > 0 ? (
            <>
              Found <span className="font-semibold text-foreground">{getResultsForTab().length}</span> results
              {activeTab === 'all' && allResults && allResults.length > 0 && (
                <span className="ml-2">
                  (
                  {Object.entries(typeCounts).map(([type, count], idx, arr) => (
                    <span key={type}>
                      {count} {TYPE_CONFIG[type as EntityType]?.label || type}
                      {idx < arr.length - 1 ? ', ' : ''}
                    </span>
                  ))}
                  )
                </span>
              )}
            </>
          ) : (
            'No results found'
          )}
        </div>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as typeof activeTab)} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">
            All {allResults && allResults.length > 0 && `(${allResults.length})`}
          </TabsTrigger>
          <TabsTrigger value="escalation">
            <AlertTriangle className="h-4 w-4 mr-1" />
            Escalations {typeCounts.escalation ? `(${typeCounts.escalation})` : ''}
          </TabsTrigger>
          <TabsTrigger value="ticket">
            <Bug className="h-4 w-4 mr-1" />
            Tickets {typeCounts.ticket ? `(${typeCounts.ticket})` : ''}
          </TabsTrigger>
          <TabsTrigger value="knowledge_base">
            <BookOpen className="h-4 w-4 mr-1" />
            Knowledge {typeCounts.knowledge_base ? `(${typeCounts.knowledge_base})` : ''}
          </TabsTrigger>
          <TabsTrigger value="feature_gap">
            <Lightbulb className="h-4 w-4 mr-1" />
            Features {typeCounts.feature_gap ? `(${typeCounts.feature_gap})` : ''}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all">{renderResults()}</TabsContent>
        <TabsContent value="escalation">{renderResults()}</TabsContent>
        <TabsContent value="ticket">{renderResults()}</TabsContent>
        <TabsContent value="knowledge_base">{renderResults()}</TabsContent>
        <TabsContent value="feature_gap">{renderResults()}</TabsContent>
      </Tabs>
    </div>
  );
}
