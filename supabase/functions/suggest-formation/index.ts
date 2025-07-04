import { createClient } from 'npm:@supabase/supabase-js@2.39.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { tactical_description } = await req.json();
    
    // Initialize the AI model
    const model = new Supabase.ai.Session('gte-small');
    
    // Generate embeddings for the tactical description
    const embedding = await model.run(tactical_description, {
      mean_pool: true,
      normalize: true
    });

    // Predefined tactical patterns and their corresponding formations
    const formations = [
      {
        pattern: "possession based attacking football with wide players",
        formation: "4-3-3",
        description: "Ideal for teams that want to control the game through possession and create width in attack"
      },
      {
        pattern: "defensive solid counter attacking style",
        formation: "4-4-2",
        description: "Perfect for teams focusing on defensive stability and quick counter-attacks"
      },
      {
        pattern: "high pressing aggressive style",
        formation: "4-2-3-1",
        description: "Suited for teams that want to press high and control the midfield"
      }
    ];

    // Generate embeddings for all patterns
    const patternEmbeddings = await Promise.all(
      formations.map(f => model.run(f.pattern, { mean_pool: true, normalize: true }))
    );

    // Calculate cosine similarity
    const similarities = patternEmbeddings.map((patternEmb, index) => {
      const similarity = embedding.reduce((acc, curr, i) => acc + curr * patternEmb[i], 0);
      return { similarity, formation: formations[index] };
    });

    // Sort by similarity and get the best match
    const bestMatch = similarities.sort((a, b) => b.similarity - a.similarity)[0];

    return new Response(
      JSON.stringify({
        suggested_formation: bestMatch.formation.formation,
        explanation: bestMatch.formation.description,
        confidence: bestMatch.similarity
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  }
});