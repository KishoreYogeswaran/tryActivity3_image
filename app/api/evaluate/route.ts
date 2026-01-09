import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { learning_activity_content, user_prompt } = body;

    console.log('📥 Evaluating prompt for activity');
    console.log('📝 User prompt length:', user_prompt.length);

    // Extract only the necessary fields (exclude base64 image)
    const relevantContent = {
      title: learning_activity_content.title,
      activity_scenario: learning_activity_content.activity_scenario,
      supervisor_directions: learning_activity_content.supervisor_directions,
      final_instruction: learning_activity_content.final_instruction,
      rubrics: learning_activity_content.rubrics
    };

    console.log('📊 Relevant content prepared (without image)');

    // Build the evaluation prompt
    const evaluationPrompt = `Role: You are an expert in evaluating prompts. 

Action: You are evaluating prompt written by an Indian student in high school, ITI, VTP, Polytechnic, or 2nd/3rd tier College who is attempting a 'learning activity' about using AI tools to generate images. You will evaluate the prompt written by the user on a scale of 1-5 based on the 'learning activity content, which includes rubrics, given in this prompt. 

Context: 

learning_activity_content: ${JSON.stringify(relevantContent)} 

user_prompt: ${user_prompt}

Expectations: 

Generate the feedback with the following details: 
Score (Out of 5) - based on the rules given below 

A one-liner summary of feedback 
A 5-pointer detailed feedback based on the rubrics. Each pointer should have three parts:  

Heading: This should be the same text as the rubric heading.  

Status: PASS or FAIL. Do not mention this in the feedback. 

Feedback: One line feedback mentioning what user did well or what the user missed out on. Do not mention Pass or Fail status. 

 
Rules for scoring: 
- MUST DO: The user should be awarded at least 1 point for attempting the question, even when no rubrics are satisfied. In this case, the one-liner summary of feedback should state that none of the requirements are fulfilled, but 1 mark is awarded for attempting the activity. 

- The user receives 1 point for each rubric they satisfy completely. 
- Marks should not be awarded for any rubrics where extraneous information related to that rubric is found in the user's submitted prompt 

BE STRICT IN YOUR EVALUATION. Do not give points for partially meeting criteria. Each element must be fully satisfied to pass.

IMPORTANT: Respond ONLY with valid JSON in this exact format:
{
  "score": number (1-5),
  "summary": "One sentence of overall feedback using simple vocabulary",
  "detailed_feedback": [
    {
      "heading": "rubric heading text",
      "status": "PASS" or "FAIL",
      "feedback": "Evaluation statement using simple vocabulary"
    }
  ]
}

Provide your response in the JSON format specified.`;

    console.log('🚀 Sending to Groq for evaluation');

    const completion = await groq.chat.completions.create({
      model: "openai/gpt-oss-120b",
      messages: [
        { role: "user", content: evaluationPrompt }
      ],
      temperature: 0.3,
      response_format: { type: "json_object" },
      max_tokens: 2000
    });

    const responseContent = completion.choices[0]?.message?.content;

    if (!responseContent) {
      throw new Error('No response from Groq');
    }

    console.log('✅ Received evaluation from Groq');

    // Clean and parse response
    let cleanedResponse = responseContent.trim();
    if (cleanedResponse.startsWith('```json')) {
      cleanedResponse = cleanedResponse.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (cleanedResponse.startsWith('```')) {
      cleanedResponse = cleanedResponse.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    const evaluation = JSON.parse(cleanedResponse);

    return NextResponse.json(evaluation);
  } catch (error) {
    console.error('❌ Error in evaluate:', error);
    return NextResponse.json(
      { error: 'Failed to evaluate prompt', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

