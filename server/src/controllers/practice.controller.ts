import { NextFunction, Request, Response } from 'express';
import Goal from '../models/goal.model';
import StudySession from '../models/studySession.model';
import User, { IUser } from '../models/user.model';
import { generatePracticeReply, PracticeChatMessage } from '../services/practiceAi.service';
import { BadRequestError, NotFoundError } from '../utils/ApiError';
import { ApiResponse } from '../utils/ApiResponse';

const MAX_CONVERSATION_MESSAGES = 12;
const MAX_MESSAGE_LENGTH = 1200;

function parseConversation(value: unknown): PracticeChatMessage[] {
  if (value === undefined) return [];
  if (!Array.isArray(value)) {
    throw new BadRequestError('conversation must be an array');
  }
  if (value.length > MAX_CONVERSATION_MESSAGES) {
    throw new BadRequestError(`conversation supports at most ${MAX_CONVERSATION_MESSAGES} messages`);
  }

  return value.map((item, index) => {
    if (!item || typeof item !== 'object' || Array.isArray(item)) {
      throw new BadRequestError(`conversation[${index}] must be an object`);
    }
    const role = String((item as Record<string, unknown>).role ?? '').trim();
    const content = String((item as Record<string, unknown>).content ?? '').trim();
    if (role !== 'user' && role !== 'assistant') {
      throw new BadRequestError(`conversation[${index}].role must be "user" or "assistant"`);
    }
    if (!content) {
      throw new BadRequestError(`conversation[${index}].content is required`);
    }
    if (content.length > MAX_MESSAGE_LENGTH) {
      throw new BadRequestError(`conversation[${index}].content exceeds ${MAX_MESSAGE_LENGTH} characters`);
    }
    return { role, content } as PracticeChatMessage;
  });
}

export function createPracticeController() {
  return {
    chat: async (req: Request, res: Response, next: NextFunction) => {
      try {
        const userId = req.auth!.userId;
        const selectedTopic = String(req.body?.topic ?? '').trim();
        const customTopic = String(req.body?.customTopic ?? '').trim();
        const topic = customTopic || selectedTopic;
        if (!topic) throw new BadRequestError('topic is required');

        const userAnswer = String(req.body?.userAnswer ?? '').trim();
        if (userAnswer.length > MAX_MESSAGE_LENGTH) {
          throw new BadRequestError(`userAnswer exceeds ${MAX_MESSAGE_LENGTH} characters`);
        }

        const conversation = parseConversation(req.body?.conversation).slice(-6);

        const user = await User.findById(userId).lean<IUser | null>();
        const sessions = await StudySession.find({ user: userId }).select('duration').lean<Array<{ duration: number }>>();
        const goals = await Goal.find({ user: userId }).select('done').lean<Array<{ done: boolean }>>();

        if (!user) throw new NotFoundError('User not found');

        const totalSessions = sessions.length;
        const totalSessionHours = sessions.reduce((sum, session) => sum + Number(session.duration ?? 0), 0) / 60;
        const totalGoals = goals.length;
        const completedGoals = goals.filter((goal) => Boolean(goal.done)).length;
        const progressRaw = user.progress as unknown;
        const progress =
          progressRaw && typeof progressRaw === 'object' && !Array.isArray(progressRaw)
            ? Object.entries(progressRaw as Record<string, unknown>).reduce<Record<string, number>>((acc, [key, value]) => {
                const next = Number(value);
                if (Number.isFinite(next)) {
                  acc[key] = next;
                }
                return acc;
              }, {})
            : {};

        const aiResult = await generatePracticeReply({
          topic,
          userAnswer,
          conversation,
          userContext: {
            name: user.name,
            skillLevel: user.skillLevel,
            interests: user.interests,
            streak: user.streak,
            totalHours: user.totalHours > 0 ? user.totalHours : Math.round(totalSessionHours * 10) / 10,
            progress,
            totalSessions,
            completedGoals,
            totalGoals,
          },
        });

        return ApiResponse.ok(
          res,
          {
            topic,
            assistantMessage: aiResult.assistantMessage,
            evaluation: aiResult.evaluation,
            nextQuestion: aiResult.nextQuestion,
            contextUsed: {
              skillLevel: user.skillLevel,
              interests: user.interests,
              streak: user.streak,
              totalHours: user.totalHours > 0 ? user.totalHours : Math.round(totalSessionHours * 10) / 10,
            },
          },
          'Practice response generated',
        );
      } catch (err) {
        return next(err);
      }
    },
  };
}
