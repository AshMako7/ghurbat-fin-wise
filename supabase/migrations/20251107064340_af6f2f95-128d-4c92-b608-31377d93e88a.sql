-- Create articles table
CREATE TABLE public.articles (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  category text NOT NULL,
  author text NOT NULL DEFAULT 'Tabeer Financial Team',
  excerpt text NOT NULL,
  content text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  published_date date NOT NULL DEFAULT CURRENT_DATE
);

-- Enable RLS
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
CREATE POLICY "Articles are viewable by everyone" 
ON public.articles 
FOR SELECT 
USING (true);

-- Create index for faster queries
CREATE INDEX idx_articles_published_date ON public.articles(published_date DESC);

-- Insert the existing articles as seed data
INSERT INTO public.articles (title, category, author, excerpt, content, published_date) VALUES
(
  'Global Markets Update',
  'Market Analysis',
  'Tabeer Financial Team',
  'Markets show steady growth with technology sector leading gains...',
  'The global financial markets have demonstrated remarkable resilience in recent weeks, with the technology sector leading the charge. Major indices have posted significant gains, driven by strong corporate earnings and positive economic indicators.

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
Analysts predict continued growth in the coming months, though at a more moderate pace. The focus will be on companies that can demonstrate sustainable profitability and strong cash flow generation.',
  '2025-11-05'
),
(
  'Savings Rate Trends',
  'Personal Finance',
  'Tabeer Advisory',
  'Interest rates remain stable, good time for fixed deposits...',
  'In the current economic landscape, savings rates have stabilized, presenting an opportune moment for individuals to consider fixed deposit investments. Banks across the country are offering competitive rates that make saving more attractive than ever.

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
• Don''t put all funds in long-term deposits
• Maintain emergency fund liquidity

Tax Planning:
Remember that interest income is taxable. Consider investments that offer tax benefits under Section 80C, such as tax-saving fixed deposits with a 5-year lock-in period.

The Bottom Line:
Fixed deposits remain one of the safest investment options for conservative investors. In today''s stable rate environment, they offer predictable returns with minimal risk, making them an essential component of a diversified portfolio.',
  '2025-11-04'
),
(
  'Smart Budgeting Strategies for 2025',
  'Financial Planning',
  'Tabeer Planning Team',
  'Learn effective budgeting techniques to maximize your savings...',
  'As we navigate through 2025, having a solid budgeting strategy has never been more important. Whether you''re looking to save for a major purchase, build an emergency fund, or simply gain better control over your finances, these proven strategies can help you achieve your financial goals.

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
Once you''ve established a budget and emergency fund, consider allocating a portion of your savings to long-term investments. This helps your money grow faster than inflation.

Review and Adjust:
Your budget isn''t set in stone. Review it quarterly and adjust based on life changes, income fluctuations, or shifting priorities. Flexibility is key to long-term success.

Success Stories:
Many Tabeer.ai users have successfully implemented these strategies, with some reporting savings increases of 30-40% within the first year. The key is consistency and commitment to your financial goals.',
  '2025-11-03'
);