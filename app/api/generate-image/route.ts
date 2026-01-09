import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { prompt } = body;

    console.log('🎨 Generating image with Gemini 3 Pro');
    console.log('📝 Prompt length:', prompt.length);

    // Build prompt with guardrails
    const guardrails = `
CRITICAL REQUIREMENTS - MUST FOLLOW:

1. INDIAN CONTEXT (MANDATORY):
   - Setting: Indian workplace environment (office, shop, workshop, etc.)
   - People: Indian individuals with Indian/South Asian skin tones and features
   - Background: Indian architectural elements, furniture, and workplace aesthetics
   - Cultural elements: Appropriate for Indian workplace settings

2. PROFESSIONAL & APPROPRIATE CONTENT:
   - All people must wear professional, workplace-appropriate clothing
   - Clothing must be modest and cover most parts appropriately
   - No profanity or inappropriate content
   - Professional workplace behavior and interactions

3. NO TEXT IN IMAGE (CRITICAL):
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

4. VISUAL QUALITY:
   - High quality, professional workplace photography style
   - Natural lighting and realistic colors
   - Clear focus on main subjects
   - Authentic Indian workplace environment

---

USER'S PROMPT:
${prompt}

Generate the image following ALL the critical requirements above, especially the Indian context and NO TEXT rules.`;

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
              text: guardrails
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

