import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!LOVABLE_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Missing required environment variables");
    }

    console.log("Generating new article using Lovable AI...");

    // Generate article content using Lovable AI
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: "You are a financial expert writer for Tabeer Forum. Generate comprehensive, informative financial articles that help users understand money management, investments, and personal finance. Each article should be educational, practical, and relevant to current financial trends."
          },
          {
            role: "user",
            content: `Generate a new financial article with the following structure in JSON format:
{
  "title": "An engaging title about a financial topic",
  "category": "One of: Market Analysis, Personal Finance, Investment Strategy, Financial Planning, Tax Planning, or Retirement Planning",
  "author": "Tabeer Financial Team or Tabeer Advisory or Tabeer Planning Team",
  "excerpt": "A compelling 1-2 sentence summary (max 120 characters)",
  "content": "A comprehensive article of 300-500 words with:\n- An engaging introduction\n- 3-4 main sections with clear headings (use format: 'Heading:\\n')\n- Bullet points for key takeaways (use '• ' for bullets)\n- Practical tips and advice\n- A conclusion with actionable insights\n\nFormat the content with double line breaks (\\n\\n) between paragraphs and sections."
}

Make the topic timely and relevant to current financial markets and personal finance trends. Ensure the content is high-quality, informative, and valuable to readers.`
          }
        ],
        temperature: 0.8,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("AI gateway error:", aiResponse.status, errorText);
      throw new Error(`AI gateway error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const generatedContent = aiData.choices[0].message.content;
    console.log("AI Response received, parsing content...");

    // Parse the JSON response from AI
    let articleData;
    try {
      // Try to extract JSON from markdown code blocks if present
      const jsonMatch = generatedContent.match(/```json\n([\s\S]*?)\n```/) || 
                       generatedContent.match(/```\n([\s\S]*?)\n```/);
      const jsonStr = jsonMatch ? jsonMatch[1] : generatedContent;
      articleData = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      console.error("AI response:", generatedContent);
      throw new Error("Failed to parse AI response as JSON");
    }

    // Initialize Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Insert the new article into the database
    const { data: newArticle, error: insertError } = await supabase
      .from('articles')
      .insert({
        title: articleData.title,
        category: articleData.category,
        author: articleData.author,
        excerpt: articleData.excerpt,
        content: articleData.content,
        published_date: new Date().toISOString().split('T')[0]
      })
      .select()
      .single();

    if (insertError) {
      console.error("Database insert error:", insertError);
      throw insertError;
    }

    console.log("New article created successfully:", newArticle.id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        article: newArticle,
        message: "New article generated and published successfully" 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error("Error in generate-daily-article function:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error occurred" 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
