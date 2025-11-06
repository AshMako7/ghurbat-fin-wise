import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, TrendingUp, Calendar, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const articles = [
  {
    id: 1,
    title: 'Global Markets Update',
    category: 'Market Analysis',
    date: 'November 5, 2025',
    author: 'Tabeer Financial Team',
    excerpt: 'Markets show steady growth with technology sector leading gains...',
    content: `The global financial markets have demonstrated remarkable resilience in recent weeks, with the technology sector leading the charge. Major indices have posted significant gains, driven by strong corporate earnings and positive economic indicators.

Key Highlights:
• Technology stocks up 8.5% this quarter
• Strong earnings from major tech companies
• Inflation showing signs of cooling
• Consumer confidence remains robust

Investment Opportunities:
The current market environment presents several opportunities for investors. Technology companies with strong fundamentals continue to show promise, while traditional sectors like manufacturing are also seeing renewed interest due to improved supply chain dynamics.

Risk Factors to Consider:
While the outlook is generally positive, investors should remain vigilant about potential headwinds including geopolitical tensions and central bank policies. Diversification remains key to managing portfolio risk in these dynamic times.

Looking Ahead:
Analysts predict continued growth in the coming months, though at a more moderate pace. The focus will be on companies that can demonstrate sustainable profitability and strong cash flow generation.`,
  },
  {
    id: 2,
    title: 'Savings Rate Trends',
    category: 'Personal Finance',
    date: 'November 4, 2025',
    author: 'Tabeer Advisory',
    excerpt: 'Interest rates remain stable, good time for fixed deposits...',
    content: `In the current economic landscape, savings rates have stabilized, presenting an opportune moment for individuals to consider fixed deposit investments. Banks across the country are offering competitive rates that make saving more attractive than ever.

Current Rate Environment:
• Fixed deposit rates: 7-9% annually
• Regular savings accounts: 3-5% annually
• High-yield savings: 6-7% annually

Why Fixed Deposits Make Sense Now:
With inflation moderating and interest rates holding steady, fixed deposits offer a secure way to grow your wealth. The guaranteed returns provide peace of mind while your money works for you.

Strategic Approach:
Consider laddering your fixed deposits across different maturity periods. This strategy provides both liquidity and the ability to take advantage of potentially higher rates in the future.

Expert Tips:
• Compare rates across multiple banks
• Consider tax implications on interest income
• Don't put all funds in long-term deposits
• Maintain emergency fund liquidity

Tax Planning:
Remember that interest income is taxable. Consider investments that offer tax benefits under Section 80C, such as tax-saving fixed deposits with a 5-year lock-in period.

The Bottom Line:
Fixed deposits remain one of the safest investment options for conservative investors. In today's stable rate environment, they offer predictable returns with minimal risk, making them an essential component of a diversified portfolio.`,
  },
  {
    id: 3,
    title: 'Smart Budgeting Strategies for 2025',
    category: 'Financial Planning',
    date: 'November 3, 2025',
    author: 'Tabeer Planning Team',
    excerpt: 'Learn effective budgeting techniques to maximize your savings...',
    content: `As we navigate through 2025, having a solid budgeting strategy has never been more important. Whether you're looking to save for a major purchase, build an emergency fund, or simply gain better control over your finances, these proven strategies can help you achieve your financial goals.

The 50-30-20 Rule:
This simple yet effective approach divides your after-tax income into three categories:
• 50% for needs (housing, food, utilities)
• 30% for wants (entertainment, dining out)
• 20% for savings and debt repayment

Digital Tools for Success:
Leverage technology to track your spending. Apps like Tabeer.ai make it easy to categorize expenses and identify areas where you can cut back. Regular monitoring helps you stay accountable to your budget.

Common Budget Mistakes to Avoid:
1. Underestimating irregular expenses
2. Not accounting for inflation
3. Being too restrictive (leading to budget burnout)
4. Ignoring small recurring subscriptions

Building an Emergency Fund:
Aim to save 3-6 months of living expenses. Start small if necessary - even Rs. 5,000 per month adds up to Rs. 60,000 in a year. Automate your savings to make it effortless.

Reducing Unnecessary Expenses:
• Review and cancel unused subscriptions
• Cook at home more frequently
• Use public transport when possible
• Negotiate bills and insurance rates annually

Investment Integration:
Once you've established a budget and emergency fund, consider allocating a portion of your savings to long-term investments. This helps your money grow faster than inflation.

Review and Adjust:
Your budget isn't set in stone. Review it quarterly and adjust based on life changes, income fluctuations, or shifting priorities. Flexibility is key to long-term success.

Success Stories:
Many Tabeer.ai users have successfully implemented these strategies, with some reporting savings increases of 30-40% within the first year. The key is consistency and commitment to your financial goals.`,
  },
];

export default function TabeerForum() {
  const navigate = useNavigate();

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
        {articles.map((article) => (
          <Card key={article.id} className="border-primary/20 hover:shadow-[var(--shadow-elegant)] transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <span className="px-2 py-1 bg-primary/10 text-primary rounded-md font-medium">
                  {article.category}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {article.date}
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
        ))}
      </main>
    </div>
  );
}
