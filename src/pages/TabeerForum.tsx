import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, TrendingUp, Calendar, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Article {
  id: string;
  title: string;
  category: string;
  published_date: string;
  author: string;
  excerpt: string;
  content: string;
}

export default function TabeerForum() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadArticles();
  }, []);

  useEffect(() => {
    if (!isLoading && articles.length > 0) {
      const hash = window.location.hash;
      if (hash) {
        const element = document.querySelector(hash);
        if (element) {
          setTimeout(() => {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }, 100);
        }
      }
    }
  }, [isLoading, articles]);

  const loadArticles = async () => {
    try {
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .order('published_date', { ascending: false });

      if (error) throw error;

      setArticles(data || []);
    } catch (error) {
      console.error('Error loading articles:', error);
      toast({
        title: 'Error',
        description: 'Failed to load articles',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/10 to-background">
      <header className="bg-gradient-to-r from-primary to-primary-light text-primary-foreground p-6 shadow-[var(--shadow-elegant)]">
        <div className="max-w-4xl mx-auto">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/home')}
            className="text-primary-foreground hover:bg-primary-foreground/10 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Tabeer Forum</h1>
            <p className="text-primary-foreground/80 text-sm mt-2">
              Financial insights and expert advice for smarter money management
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6 space-y-6">
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading articles...</p>
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No articles available yet.</p>
          </div>
        ) : (
          articles.map((article) => (
          <Card key={article.id} id={`article-${article.id}`} className="border-primary/20 hover:shadow-[var(--shadow-elegant)] transition-shadow scroll-mt-6">
            <CardHeader>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <span className="px-2 py-1 bg-primary/10 text-primary rounded-md font-medium">
                  {article.category}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {formatDate(article.published_date)}
                </span>
                <span className="flex items-center gap-1">
                  <User className="w-3 h-3" />
                  {article.author}
                </span>
              </div>
              <CardTitle className="text-2xl">{article.title}</CardTitle>
              <CardDescription className="text-base">{article.excerpt}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none text-foreground">
                {article.content.split('\n\n').map((paragraph, idx) => (
                  <p key={idx} className="mb-4 leading-relaxed whitespace-pre-line">
                    {paragraph}
                  </p>
                ))}
              </div>
              <div className="mt-6 pt-4 border-t border-border flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <TrendingUp className="w-4 h-4" />
                  <span>Recommended by Tabeer AI</span>
                </div>
                <Button variant="outline" size="sm" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                  Back to Top
                </Button>
              </div>
            </CardContent>
          </Card>
          ))
        )}
      </main>
    </div>
  );
}
