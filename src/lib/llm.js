import { GoogleGenerativeAI } from '@google/generative-ai';

export function initClient(apiKey) {
  if (!apiKey) {
    throw new Error('API key is required');
  }
  
  const genAI = new GoogleGenerativeAI(apiKey);
  
  return {
    flash: genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' }),
    pro: genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })
  };
}

export async function analyzeJobDescription({ text, client }) {
  if (!client) {
    throw new Error('Client not initialized');
  }
  
  const prompt = `
Analyze the following job description and extract key information. Respond with ONLY a valid JSON object with these exact keys:

{
  "role": "string - job title/position",
  "seniority": "string - level (e.g., 'Senior', 'Mid-level', 'Entry-level')",
  "location": "string - location if mentioned, or 'Remote' or 'Not specified'",
  "mustHaveKeywords": ["array of strings - essential skills/technologies"],
  "niceToHaveKeywords": ["array of strings - preferred skills/technologies"],
  "companySummary": "string - brief company description",
  "toneHints": "string - writing style/tone preferences if any",
  "instructions": "string - any specific application instructions"
}

Job Description:
${text}
`;

  try {
    const result = await client.flash.generateContent(prompt);
    const response = await result.response;
    const textResponse = response.text();
    
    // Try to parse JSON
    const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }
    
    const parsed = JSON.parse(jsonMatch[0]);
    
    // Validate required fields
    const requiredFields = ['role', 'seniority', 'location', 'mustHaveKeywords', 'niceToHaveKeywords', 'companySummary', 'toneHints', 'instructions'];
    for (const field of requiredFields) {
      if (!(field in parsed)) {
        throw new Error(`Missing required field: ${field}`);
      }
    }
    
    return parsed;
  } catch (error) {
    // Retry once with stricter instructions
    console.warn('First attempt failed, retrying with stricter prompt:', error);
    
    const strictPrompt = `
You must respond with ONLY a valid JSON object. Do not include any other text, explanations, or formatting.

Extract information from this job description:

${text}

Return JSON with these exact keys:
{
  "role": "string",
  "seniority": "string", 
  "location": "string",
  "mustHaveKeywords": ["array of strings"],
  "niceToHaveKeywords": ["array of strings"],
  "companySummary": "string",
  "toneHints": "string",
  "instructions": "string"
}
`;

    try {
      const result = await client.flash.generateContent(strictPrompt);
      const response = await result.response;
      const textResponse = response.text();
      
      const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in retry response');
      }
      
      return JSON.parse(jsonMatch[0]);
    } catch (retryError) {
      throw new Error(`Failed to parse job description analysis: ${retryError.message}`);
    }
  }
}

export async function draftCoverLetter({ jd, examples, client }) {
  if (!client) {
    throw new Error('Client not initialized');
  }
  
  const examplesText = examples.length > 0 
    ? `${examples.map((ex, i) => `## Example ${i + 1} - ${ex.title}:\n${ex.body}\n`).join('\n')}`
    : '';
  
    const prompt = `You are an expert cover letter writer. Write a professional, tailored cover letter based on the job description analysis below.

    # Requirements:
    
    - 300-500 words
    - Professional, concise, human tone
    - Address the specific role and company
    - Highlight relevant experience and skills
    - Show enthusiasm for the position
    - No code blocks or special formatting
    - IMPORTANT: Match the writing style, tone, and details from the examples below
    - CRITICAL: Extract and reuse personal information from examples (name, previous companies, specific experiences, achievements)
    
    # Job Description Analysis:
    
    ${JSON.stringify(jd, null, 2)}
    
    # Previous Cover Letter Examples:
    
    ${examplesText}
    
    # Instructions:
    
    Study the writing examples above carefully. From the examples, extract and reuse:
    - Personal name and contact information
    - Previous company names and roles
    - Specific achievements and experiences
    - Technical skills and expertise mentioned
    - Personal background and career progression
    
    Match their:
    - Tone and voice
    - Sentence structure and flow
    - Level of formality
    - How they address experience and skills
    - Overall writing personality
    
    Now write a cover letter that combines the job requirements with the writing style AND personal information from the examples:`;

  try {
    const result = await client.pro.generateContent(prompt);
    const response = await result.response;
    const textResponse = response.text();
    
    // Clean up the response (remove any code blocks or extra formatting)
    return textResponse
      .replace(/```[\s\S]*?```/g, '') // Remove code blocks
      .replace(/^\s*["']|["']\s*$/g, '') // Remove surrounding quotes
      .trim();
  } catch (error) {
    throw new Error(`Failed to generate cover letter: ${error.message}`);
  }
}
