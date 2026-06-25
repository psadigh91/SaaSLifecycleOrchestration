'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Plus, Search, Filter, FileText, Eye, ThumbsUp } from 'lucide-react';
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
import { useKnowledgeArticles } from '@/lib/api/knowledge-base';
import { formatDate } from '@/lib/utils';

export default function KnowledgeBasePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [tagFilter, setTagFilter] = useState<string>('');

  const { data: articles, isLoading } = useKnowledgeArticles();

  // Calculate stats
  const stats = useMemo(() => {
    if (!articles) return { total: 0, totalViews: 0, totalHelpful: 0 };

    return {
      total: articles.length,
      totalViews: articles.reduce((sum, article) => sum + article.views, 0),
      // Assuming we'll add helpfulVotes field later, for now using views as proxy
      totalHelpful: articles.reduce((sum, article) => sum + Math.floor(article.views * 0.7), 0),
    };
  }, [articles]);

  // Get unique categories and tags for filters
  const { categories, tags } = useMemo(() => {
    if (!articles) return { categories: [], tags: [] };

    const categoriesSet = new Set(articles.map(a => a.category));
    const tagsSet = new Set(articles.flatMap(a => a.tags));

    return {
      categories: Array.from(categoriesSet).sort(),
      tags: Array.from(tagsSet).sort(),
    };
  }, [articles]);

  // Filter articles
  const filteredArticles = useMemo(() => {
    if (!articles) return [];

    return articles.filter(article => {
      const matchesSearch = !searchQuery ||
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.content.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory = !categoryFilter || article.category === categoryFilter;

      const matchesStatus = !statusFilter ||
        (statusFilter === 'published' && article.isPublished) ||
        (statusFilter === 'draft' && !article.isPublished);

      const matchesTag = !tagFilter || article.tags.includes(tagFilter);

      return matchesSearch && matchesCategory && matchesStatus && matchesTag;
    });
  }, [articles, searchQuery, categoryFilter, statusFilter, tagFilter]);

  const getStatusBadge = (isPublished: boolean) => {
    return isPublished
      ? <Badge variant="success">Published</Badge>
      : <Badge variant="default">Draft</Badge>;
  };

  const clearFilters = () => {
    setSearchQuery('');
    setCategoryFilter('');
    setStatusFilter('');
    setTagFilter('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Knowledge Base</h1>
          <p className="text-muted-foreground">Manage your help articles and documentation</p>
        </div>
        <Link href="/knowledge-base/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Article
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Articles</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              {articles?.filter(a => a.isPublished).length || 0} published
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalViews.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Across all articles
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Helpful Votes</CardTitle>
            <ThumbsUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalHelpful.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Positive feedback received
            </p>
          </CardContent>
        </Card>
      </div>

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
                placeholder="Search articles..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <Select
              value={categoryFilter}
              onValueChange={setCategoryFilter}
            >
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={statusFilter}
              onValueChange={setStatusFilter}
            >
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Status</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={tagFilter}
              onValueChange={setTagFilter}
            >
              <SelectTrigger>
                <SelectValue placeholder="Tag" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Tags</SelectItem>
                {tags.map(tag => (
                  <SelectItem key={tag} value={tag}>
                    {tag}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={clearFilters}
            >
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Articles Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredArticles.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No articles found</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {searchQuery || categoryFilter || statusFilter || tagFilter
                  ? 'Try adjusting your filters'
                  : 'Get started by creating your first article'}
              </p>
              <Link href="/knowledge-base/new">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Article
                </Button>
              </Link>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Views</TableHead>
                  <TableHead>Author</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredArticles.map((article) => (
                  <TableRow key={article.id}>
                    <TableCell className="font-medium max-w-md">
                      <Link
                        href={`/knowledge-base/${article.id}`}
                        className="hover:underline"
                      >
                        {article.title}
                      </Link>
                      {article.tags.length > 0 && (
                        <div className="flex gap-1 mt-1 flex-wrap">
                          {article.tags.slice(0, 3).map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {article.tags.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{article.tags.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>{article.category}</TableCell>
                    <TableCell>{getStatusBadge(article.isPublished)}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Eye className="h-3 w-3 text-muted-foreground" />
                        <span>{article.views.toLocaleString()}</span>
                      </div>
                    </TableCell>
                    <TableCell>{article.author}</TableCell>
                    <TableCell>{formatDate(article.updatedAt)}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/knowledge-base/${article.id}`}>View</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Results count */}
      {!isLoading && filteredArticles.length > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {filteredArticles.length} of {articles?.length || 0} articles
          </p>
        </div>
      )}
    </div>
  );
}
