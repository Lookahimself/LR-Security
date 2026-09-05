import { z } from 'zod';
import { AnalysisResult, RiskLevel, ConfidenceLevel } from '../types';
import { GoogleGenAI } from '@google/genai';

// Initialize the Gemini client
// Note: In production, ensure GOOGLE_API_KEY is set in environment variables
const ai = new GoogleGenAI();

// Schema for structured output validation
const analysisSchema = z.object({
  category: z.string(),
  risk_level: z.enum(['low', 'medium', 'high', 'critical']),
  confidence: z.enum(['low', 'medium', 'high']),
  signals: z.array(z.string()),
  explanation: z.string(),
  recommended_actions: z.array(z.string()),
  uncertainty: z.string().optional(),
});

export class AIProvider {
  /**
   * Internal prompt for analyzing text content
   */
  private static textAnalysisPrompt = `
You are an expert digital safety assistant for an Arabic-speaking user (specifically in Saudi Arabia context).
Your job is to analyze the provided text for digital risks such as blackmail, threats, harassment, cyberbullying, scams, or phishing.

Analyze the text and provide a structured JSON response matching this schema:
{
  "category": "One of: Blackmail, Threat, Harassment, Cyberbullying, Scam, Phishing, Suspicious, Other",
  "risk_level": "One of: low, medium, high, critical",
  "confidence": "One of: low, medium, high",
  "signals": ["List of specific indicators found in the text"],
  "explanation": "Clear explanation in Arabic of why this is risky",
  "recommended_actions": ["List of safe next steps in Arabic"],
  "uncertainty": "Any missing context or doubts about the analysis (optional)"
}

IMPORTANT RULES:
- Never say "This is definitely a crime."
- Prefer phrases like "This content contains indicators commonly associated with..."
- Do not invent facts.
- The output MUST be valid JSON.
- Provide explanations and recommended actions in Modern Standard Arabic.
`;

  /**
   * Analyze text content for risks
   */
  static async analyzeText(text: string): Promise<AnalysisResult> {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash', // Using latest available flash model
        contents: [
          { role: 'user', parts: [{ text: this.textAnalysisPrompt }] },
          { role: 'user', parts: [{ text: `Content to analyze:\n\n---\n${text}\n---` }] }
        ],
        config: {
          responseMimeType: 'application/json',
          temperature: 0.1, // Low temperature for more deterministic analysis
        }
      });

      const responseText = response.text;
      
      if (!responseText) {
         throw new Error("No response from AI model");
      }

      let rawData;
      try {
        rawData = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Failed to parse AI response as JSON:', responseText);
        throw new Error('Invalid JSON format from AI provider.');
      }

      // Parse and validate the response
      const validatedData = analysisSchema.parse(rawData);

      return validatedData as AnalysisResult;
    } catch (error: unknown) {
      console.error('AI Analysis Error:', error);
      if (error instanceof z.ZodError) {
        console.error('Zod Validation Error:', error.errors);
      } else if (error instanceof Error) {
        console.error('Execution Error:', error.message);
      }
      throw new Error('Failed to analyze text safely.');
    }
  }
}
