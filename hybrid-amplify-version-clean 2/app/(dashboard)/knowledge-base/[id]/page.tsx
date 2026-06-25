'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Edit, Eye, ThumbsUp, Clock, User } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useKnowledgeArticle, useSimilarArticles } from '@/lib/api/knowledge-base';
import { formatDate } from '@/lib/utils';

export default function KnowledgeArticleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { data: article, isLoading } = useKnowledgeArticle(id);
  const { data: similarArticles } = useSimilarArticles(id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <p className="text-muted-foreground">Article not found</p>
        <Link href="/knowledge-base">
          <Button variant="outline">Back to Knowledge Base</Button>
        </Link>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      draft: 'secondary',
      published: 'success',
      archived: 'default',
    };
    return <Badge variant={variants[status]}>{status}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-4 flex-1">
          <Link href="/knowledge-base">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              {article.category && (
                <Badge variant="outline" className="text-sm">
                  {article.category}
                </Badge>
              )}
              {getStatusBadge(article.status)}
              <h1 className="text-3xl font-bold tracking-tight">{article.title}</h1>
            </div>
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <div className="flex items-center space-x-1">
                <User className="h-4 w-4" />
                <span>{article.author || 'Unknown Author'}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>Updated {formatDate(article.updatedAt)}</span>
              </div>
            </div>
          </div>
        </div>
        <Button onClick={() => router.push(`/knowledge-base/${id}/edit`)}>
          <Edit className="mr-2 h-4 w-4" />
          Edit Article
        </Button>
      </div>

      {/* Tags */}
      {article.tags && article.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {article.tags.map((tag) => (
            <Badge key={tag} variant="secondary">
              {tag}
            </Badge>
          ))}
        </div>
      )}

      {/* Info Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{article.viewCount || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Total article views</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Helpful Votes</CardTitle>
            <ThumbsUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{article.helpfulCount || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {article.viewCount > 0
                ? `${Math.round(((article.helpfulCount || 0) / article.viewCount) * 100)}% helpful rating`
                : 'No ratings yet'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Published Date</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-medium">{formatDate(article.createdAt)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Last updated {formatDate(article.updatedAt)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Information */}
      <Tabs defaultValue="content" className="space-y-4">
        <TabsList>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="similar">
            Similar Articles ({similarArticles?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="metadata">Metadata</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Article Content</CardTitle>
              <CardDescription>
                {article.status === 'published'
                  ? 'Published content'
                  : article.status === 'draft'
                  ? 'Draft - not visible to users'
                  : 'Archived content'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <ReactMarkdown>{article.content}</ReactMarkdown>
              </div>
            </CardContent>
          </Card>

          {/* Helpful Actions */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">Was this article helpful?</p>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    <ThumbsUp className="h-4 w-4 mr-2" />
                    Yes
                  </Button>
                  <Button variant="outline" size="sm">
                    <ThumbsUp className="h-4 w-4 mr-2 rotate-180" />
                    No
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="similar" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Similar Articles (RAG-Powered)</CardTitle>
              <CardDescription>
                Semantically similar articles using vector search
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!similarArticles || similarArticles.length === 0 ? (
                <p className="text-sm text-muted-foreground">No similar articles found</p>
              ) : (
                <div className="space-y-3">
                  {similarArticles.map((result) => (
                    <Link
                      key={result.id}
                      href={`/knowledge-base/${result.id}`}
                      className="block"
                    >
                      <div className="border rounded-lg p-4 hover:bg-accent/50 transition-colors cursor-pointer">
                        <div className="flex items-start justify-between mb-2">
                          <div className="font-medium">{result.title}</div>
                          <Badge variant="outline">
                            {Math.round(result.similarity * 100)}% match
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {result.snippet}
                        </p>
                        {result.metadata?.category && (
                          <Badge variant="secondary" className="mt-2">
                            {result.metadata.category}
                          </Badge>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="metadata" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Article Metadata</CardTitle>
              <CardDescription>Classification and organizational details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div>
                  <div className="text-sm font-medium mb-1">Article ID</div>
                  <div className="text-sm text-muted-foreground font-mono">{article.id}</div>
                </div>

                <div>
                  <div className="text-sm font-medium mb-1">Category</div>
                  <div className="text-sm text-muted-foreground">
                    {article.category || 'Uncategorized'}
                  </div>
                </div>

                <div>
                  <div className="text-sm font-medium mb-1">Tags</div>
                  <div className="flex flex-wrap gap-2">
                    {article.tags && article.tags.length > 0 ? (
                      article.tags.map((tag) => (
                        <Badge key={tag} variant="secondary">
                          {tag}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-sm text-muted-foreground">No tags</span>
                    )}
                  </div>
                </div>

                <div>
                  <div className="text-sm font-medium mb-1">Author</div>
                  <div className="text-sm text-muted-foreground">
                    {article.author || 'Unknown'}
                  </div>
                </div>

                <div>
                  <div className="text-sm font-medium mb-1">Status</div>
                  <div>{getStatusBadge(article.status)}</div>
                </div>

                <div>
                  <div className="text-sm font-medium mb-1">Created</div>
                  <div className="text-sm text-muted-foreground">
                    {formatDate(article.createdAt)}
                  </div>
                </div>

                <div>
                  <div className="text-sm font-medium mb-1">Last Updated</div>
                  <div className="text-sm text-muted-foreground">
                    {formatDate(article.updatedAt)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Article Analytics</CardTitle>
              <CardDescription>Usage statistics and performance metrics</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="text-sm font-medium mb-2">Engagement Overview</div>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span>Total Views</span>
                      <span className="font-medium">{article.viewCount || 0}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{
                          width: `${Math.min((article.viewCount || 0) / 10, 100)}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span>Helpful Votes</span>
                      <span className="font-medium">{article.helpfulCount || 0}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{
                          width: `${Math.min((article.helpfulCount || 0) / 5, 100)}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span>Helpful Rating</span>
                      <span className="font-medium">
                        {article.viewCount > 0
                          ? `${Math.round(
                              ((article.helpfulCount || 0) / article.viewCount) * 100
                            )}%`
                          : '0%'}
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-yellow-500 h-2 rounded-full"
                        style={{
                          width: `${
                            article.viewCount > 0
                              ? ((article.helpfulCount || 0) / article.viewCount) * 100
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <div className="text-sm font-medium mb-2">Performance Insights</div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <span className="text-muted-foreground">Average rating</span>
                    <span className="font-medium">
                      {article.viewCount > 0
                        ? `${Math.round(
                            ((article.helpfulCount || 0) / article.viewCount) * 100
                          )}%`
                        : 'N/A'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <span className="text-muted-foreground">Status</span>
                    <span className="font-medium capitalize">{article.status}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <span className="text-muted-foreground">Content length</span>
                    <span className="font-medium">
                      {article.content.length} characters
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
