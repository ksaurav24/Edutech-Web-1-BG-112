import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '../config/env';
import { BadRequestError, InternalServerError } from '../utils/ApiError';

export type PracticeChatRole = 'assistant' | 'user';

export interface PracticeChatMessage {
  role: PracticeChatRole;
  content: string;
}

export interface PracticeUserContext {
  name: string;
  skillLevel: 'Beginner' | 'Intermediate' | 'Advanced';
  interests: string[];
  streak: number;
  totalHours: number;
  progress: Record<string, number>;
  totalSessions: number;
  completedGoals: number;
  totalGoals: number;
}

export interface PracticeAiInput {
  topic: string;
  userAnswer: string;
  conversation: PracticeChatMessage[];
  userContext: PracticeUserContext;
}

export interface PracticeEvaluation {
  score: number;
  strengths: string[];
  improvements: string[];
  idealAnswer: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

export interface PracticeAiOutput {
  assistantMessage: string;
  evaluation: PracticeEvaluation | null;
  nextQuestion: string;
}

const ALLOWED_DIFFICULTIES: PracticeEvaluation['difficulty'][] = ['beginner', 'intermediate', 'advanced'];
const MAX_PROMPT_MESSAGES = 6;

function toObject(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new InternalServerError('Gemini response is not a JSON object');
  }
  return value as Record<string, unknown>;
}

function ensureString(value: unknown, field: string): string {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new InternalServerError(`Gemini response field "${field}" must be a non-empty string`);
  }
  return value.trim();
}

function ensureStringArray(value: unknown, field: string): string[] {
  if (!Array.isArray(value)) {
    throw new InternalServerError(`Gemini response field "${field}" must be an array of strings`);
  }
  const next = value
    .map((item) => (typeof item === 'string' ? item.trim() : ''))
    .filter(Boolean);
  if (next.length === 0) {
    throw new InternalServerError(`Gemini response field "${field}" must include at least one item`);
  }
  return next;
}

function extractJson(text: string): Record<string, unknown> {
  const trimmed = text.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced ? fenced[1].trim() : trimmed;

  let parsed: unknown;
  try {
    parsed = JSON.parse(candidate);
  } catch (error) {
    throw new InternalServerError('Gemini returned non-JSON output', [], undefined, { cause: error });
  }
  return toObject(parsed);
}

function parseEvaluation(value: unknown): PracticeEvaluation {
  const raw = toObject(value);
  const score = Number(raw.score);
  if (!Number.isFinite(score) || score < 0 || score > 100) {
    throw new InternalServerError('Gemini response field "evaluation.score" must be 0-100');
  }

  const difficultyRaw = String(raw.difficulty ?? '').toLowerCase() as PracticeEvaluation['difficulty'];
  if (!ALLOWED_DIFFICULTIES.includes(difficultyRaw)) {
    throw new InternalServerError('Gemini response field "evaluation.difficulty" is invalid');
  }

  return {
    score: Math.round(score),
    strengths: ensureStringArray(raw.strengths, 'evaluation.strengths'),
    improvements: ensureStringArray(raw.improvements, 'evaluation.improvements'),
    idealAnswer: ensureString(raw.idealAnswer, 'evaluation.idealAnswer'),
    difficulty: difficultyRaw,
  };
}

function parseOutput(text: string): PracticeAiOutput {
  const raw = extractJson(text);
  const evaluationRaw = raw.evaluation;

  return {
    assistantMessage: ensureString(raw.assistantMessage, 'assistantMessage'),
    evaluation: evaluationRaw === null ? null : parseEvaluation(evaluationRaw),
    nextQuestion: ensureString(raw.nextQuestion, 'nextQuestion'),
  };
}

function getGeminiClient(): GoogleGenerativeAI {
  if (!env.geminiApiKey) {
    throw new InternalServerError('GEMINI_API_KEY is not configured');
  }
  return new GoogleGenerativeAI(env.geminiApiKey);
}

function buildPrompt(input: PracticeAiInput): string {
  const chatWindow = input.conversation.slice(-MAX_PROMPT_MESSAGES);
  const conversation = chatWindow.map((message) => `${message.role.toUpperCase()}: ${message.content}`).join('\n');
  const hasAnswer = input.userAnswer.trim().length > 0;

  const instructions = hasAnswer
    ? 'Evaluate the user answer, coach clearly, and ask one follow-up question.'
    : 'Ask the first practice question for the selected topic at suitable level.';

  return [
    'You are StudyPro practice coach. Return ONLY valid JSON. No markdown.',
    instructions,
    '',
    `Topic: ${input.topic}`,
    `User skill level: ${input.userContext.skillLevel}`,
    `User name: ${input.userContext.name}`,
    `Interests: ${input.userContext.interests.join(', ') || 'None'}`,
    `Streak: ${input.userContext.streak}`,
    `Total hours: ${input.userContext.totalHours}`,
    `Progress by subject: ${JSON.stringify(input.userContext.progress)}`,
    `Sessions completed: ${input.userContext.totalSessions}`,
    `Goals completed: ${input.userContext.completedGoals}/${input.userContext.totalGoals}`,
    '',
    'Recent conversation:',
    conversation || '(none)',
    '',
    `Current user answer: ${input.userAnswer || '(none - generate the first question)'}`,
    '',
    'Output schema:',
    '{',
    '  "assistantMessage": "string",',
    '  "evaluation": null | {',
    '    "score": number,',
    '    "strengths": ["string"],',
    '    "improvements": ["string"],',
    '    "idealAnswer": "string",',
    '    "difficulty": "beginner" | "intermediate" | "advanced"',
    '  },',
    '  "nextQuestion": "string"',
    '}',
  ].join('\n');
}

export async function generatePracticeReply(input: PracticeAiInput): Promise<PracticeAiOutput> {
  const topic = input.topic.trim();
  if (!topic) {
    throw new BadRequestError('Topic is required');
  }

  const model = getGeminiClient().getGenerativeModel({ model: env.geminiModel });
  const prompt = buildPrompt({
    ...input,
    topic,
    userAnswer: input.userAnswer.trim(),
  });

  let rawText = '';
  try {
    const result = await model.generateContent(prompt);
    rawText = result.response.text();
  } catch (error) {
    throw new InternalServerError('Failed to generate practice response from Gemini', [], undefined, {
      cause: error,
    });
  }

  return parseOutput(rawText);
}
