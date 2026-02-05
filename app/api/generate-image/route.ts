import { NextResponse } from 'next/server';

// Map language codes to cultural context
interface CulturalContext {
  geography: string;
  region: string;
  description: string;
}

const CONTEXT_MAP: Record<string, CulturalContext> = {
  "ES": {
    geography: "Mexican",
    region: "Mexico",
    description: "Mexican workplace environment with Latin American context"
  },
  "PT": {
    geography: "Brazilian",
    region: "Brazil",
    description: "Brazilian workplace environment with South American context"
  },
  "BH": {
    geography: "Indonesian",
    region: "Indonesia",
    description: "Indonesian workplace environment with Southeast Asian context"
  },
  "EN": {
    geography: "Indian",
    region: "India",
    description: "Indian workplace environment with South Asian context"
  }
};

function buildPromptWithGuardrails(prompt: string, language: string = "EN"): string {
  // Default to Indian/English if language not found
  const context = CONTEXT_MAP[language.toUpperCase()] || CONTEXT_MAP["EN"];
  
  const guardrails = `
CRITICAL REQUIREMENTS - MUST FOLLOW:

1. ${context.geography.toUpperCase()} CONTEXT (MANDATORY):
- Setting: ${context.description} (office, shop, workshop, etc.)
- People: ${context.geography} individuals with appropriate ethnic features and skin tones
- Background: ${context.geography} architectural elements, furniture, and workplace aesthetics
- Cultural elements: Appropriate for ${context.geography} workplace settings in ${context.region}

2. PROFESSIONAL & APPROPRIATE CONTENT:
- All people must wear professional, workplace-appropriate clothing
- Clothing should be modest and cover most of the body appropriately
- No revealing, inappropriate, or unprofessional attire
- Professional workplace demeanor and body language

3. CONTENT SAFETY:
- No profanity, offensive symbols, or inappropriate content
- No violence, weapons, or threatening imagery
- Family-friendly and workplace-appropriate content only
- Respectful representation of all individuals

4. NO TEXT IN IMAGE (CRITICAL):
- ABSOLUTELY NO readable text, letters, numbers, or written content
- NO posters with text, NO signs with words, NO labels
- NO clocks showing specific times
- Any documents, papers, clipboards must show ONLY blurred, illegible marks
- Any sheets, brochures, or written materials must have blurred, unreadable content
- Computer/laptop screens must show ONLY:
  * Blurred, illegible content, OR
  * Solid black screen if showing the back
- ID badges on lanyards must show:
  * Blurred portrait photo
  * Holographic seal (no readable text)
- Background posters/signs must be completely blurred with no readable elements

SCENARIO TO VISUALIZE:
${prompt}

REMINDER: Generate a realistic, professional ${context.geography} workplace image with NO text, signs, or written content visible. All content should be appropriate for educational use.`;

  return guardrails;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { prompt, language = "EN" } = body;

    console.log('🎨 Generating image with Gemini 3 Pro');
    console.log('🌍 Language/Context:', language);
    console.log('📝 Prompt length:', prompt.length);

    // Build prompt with culturally-adapted guardrails
    const fullPrompt = buildPromptWithGuardrails(prompt, language);

    // Call Gemini API with 16:9 aspect ratio
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-image-preview:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: fullPrompt
            }]
          }],
          generationConfig: {
            temperature: 0.4,
            topK: 32,
            topP: 1,
            maxOutputTokens: 4096,
            imageConfig: {
              aspectRatio: "16:9"
            }
          }
        })
      }
    );

    if (!geminiResponse.ok) {
      throw new Error(`Gemini API error: ${geminiResponse.statusText}`);
    }

    const result = await geminiResponse.json();

    // Extract image from response
    if (result.candidates && result.candidates[0]?.content?.parts) {
      for (const part of result.candidates[0].content.parts) {
        if (part.inlineData && part.inlineData.data) {
          console.log('✅ Image generated successfully');
          return NextResponse.json({
            image_base64: part.inlineData.data
          });
        }
      }
    }

    throw new Error('No image data in response');
  } catch (error) {
    console.error('❌ Error generating image:', error);
    return NextResponse.json(
      { error: 'Failed to generate image', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

