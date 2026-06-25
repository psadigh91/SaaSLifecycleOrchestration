'use client';

import { useState } from 'react';
import { Send, Loader2, Clock, Hash, FileText, ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import ReactMarkdown from 'react-markdown';

interface RAGSource {
  id: string;
  title: string;
  content: string;
  relevanceScore: number;
  type: string;
}

interface ExecutionStats {
  tokensUsed: number;
  executionTime: number;
  model: string;
  timestamp: string;
}

interface AgentExecution {
  id: string;
  prompt: string;
  response: string;
  sources: RAGSource[];
  stats: ExecutionStats;
  timestamp: string;
}

export default function AgentsPage() {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentResponse, setCurrentResponse] = useState<string>('');
  const [currentSources, setCurrentSources] = useState<RAGSource[]>([]);
  const [currentStats, setCurrentStats] = useState<ExecutionStats | null>(null);
  const [history, setHistory] = useState<AgentExecution[]>([]);
  const [expandedSources, setExpandedSources] = useState(false);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isLoading) return;

    setIsLoading(true);
    setCurrentResponse('');
    setCurrentSources([]);
    setCurrentStats(null);

    try {
      // Simulate AI agent execution
      // In production, this would call your backend API
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mock response
      const mockResponse = `Based on the RAG sources retrieved, here's my analysis:

## Key Findings

The customer lifecycle orchestration platform shows strong engagement metrics across multiple touchpoints. Here are the main insights:

1. **Customer Health Trends**: Overall health scores have improved by 15% quarter-over-quarter
2. **Escalation Patterns**: 80% of escalations are resolved within the first 48 hours
3. **Engagement Metrics**: Average response time has decreased by 23%

## Recommendations

- Consider implementing proactive outreach for at-risk customers
- Enhance knowledge base articles for common escalation topics
- Schedule quarterly business reviews for high-value accounts

The data suggests that focusing on preventive measures will yield better outcomes than reactive support.`;

      const mockSources: RAGSource[] = [
        {
          id: '1',
          title: 'Customer Health Score Analysis Q2 2026',
          content: 'Comprehensive analysis of customer health metrics showing 15% improvement...',
          relevanceScore: 0.94,
          type: 'Report'
        },
        {
          id: '2',
          title: 'Escalation Resolution Patterns',
          content: 'Study of escalation resolution times and patterns across customer segments...',
          relevanceScore: 0.87,
          type: 'Analysis'
        },
        {
          id: '3',
          title: 'Customer Engagement Best Practices',
          content: 'Guide to effective customer engagement strategies for SaaS platforms...',
          relevanceScore: 0.82,
          type: 'Guide'
        }
      ];

      const mockStats: ExecutionStats = {
        tokensUsed: 1247,
        executionTime: 1850,
        model: 'gpt-4',
        timestamp: new Date().toISOString()
      };

      setCurrentResponse(mockResponse);
      setCurrentSources(mockSources);
      setCurrentStats(mockStats);

      // Add to history
      const execution: AgentExecution = {
        id: Date.now().toString(),
        prompt,
        response: mockResponse,
        sources: mockSources,
        stats: mockStats,
        timestamp: new Date().toISOString()
      };

      setHistory(prev => [execution, ...prev]);
      setPrompt('');
    } catch (error) {
      console.error('Error executing agent:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadHistoryItem = (execution: AgentExecution) => {
    setSelectedHistoryItem(execution.id);
    setPrompt(execution.prompt);
    setCurrentResponse(execution.response);
    setCurrentSources(execution.sources);
    setCurrentStats(execution.stats);
  };

  const formatTime = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">AI Agents</h1>
        <p className="text-muted-foreground">
          Query your data using natural language with RAG-powered AI agents
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Prompt Input */}
          <Card>
            <CardHeader>
              <CardTitle>Ask Your AI Agent</CardTitle>
              <CardDescription>
                Enter your query and the AI will search relevant data sources to provide insights
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Textarea
                  placeholder="Example: What are the key trends in customer health scores this quarter?"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="min-h-[120px] resize-none"
                  disabled={isLoading}
                />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    {prompt.length} characters
                  </span>
                  <Button type="submit" disabled={isLoading || !prompt.trim()}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Submit Query
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Response Display */}
          {(currentResponse || isLoading) && (
            <Card>
              <CardHeader>
                <CardTitle>Response</CardTitle>
                <CardDescription>AI-generated insights based on your data</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="text-center space-y-4">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                      <p className="text-sm text-muted-foreground">
                        Analyzing data and generating response...
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="prose prose-sm max-w-none dark:prose-invert">
                    <ReactMarkdown>{currentResponse}</ReactMarkdown>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Context Inspector */}
          {currentSources.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Context Sources</CardTitle>
                    <CardDescription>
                      RAG sources used to generate this response
                    </CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setExpandedSources(!expandedSources)}
                  >
                    {expandedSources ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </CardHeader>
              {expandedSources && (
                <CardContent>
                  <div className="space-y-4">
                    {currentSources.map((source) => (
                      <div
                        key={source.id}
                        className="border rounded-lg p-4 space-y-2"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-2">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{source.title}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline">{source.type}</Badge>
                            <Badge variant="secondary">
                              {(source.relevanceScore * 100).toFixed(0)}% relevant
                            </Badge>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {source.content}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              )}
            </Card>
          )}

          {/* Execution Stats */}
          {currentStats && (
            <Card>
              <CardHeader>
                <CardTitle>Execution Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Hash className="h-4 w-4 mr-1" />
                      Tokens Used
                    </div>
                    <div className="text-2xl font-bold">
                      {currentStats.tokensUsed.toLocaleString()}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="h-4 w-4 mr-1" />
                      Execution Time
                    </div>
                    <div className="text-2xl font-bold">
                      {formatTime(currentStats.executionTime)}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">Model</div>
                    <div className="text-2xl font-bold">{currentStats.model}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* History Sidebar */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle>History</CardTitle>
              <CardDescription>Past agent executions</CardDescription>
            </CardHeader>
            <CardContent>
              {history.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No executions yet. Submit a query to get started.
                </p>
              ) : (
                <div className="space-y-2 max-h-[600px] overflow-y-auto">
                  {history.map((execution) => (
                    <button
                      key={execution.id}
                      onClick={() => loadHistoryItem(execution)}
                      className={`w-full text-left p-3 rounded-lg border transition-colors hover:bg-accent ${
                        selectedHistoryItem === execution.id
                          ? 'bg-accent border-primary'
                          : ''
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="text-sm font-medium line-clamp-2">
                          {execution.prompt}
                        </div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{formatDate(execution.timestamp)}</span>
                          <span>{execution.stats.tokensUsed} tokens</span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
