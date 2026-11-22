import { defineTool } from "eve/tools";
import { z } from "zod";

const interactiveQuizInputSchema = z.object({
  title: z.string().min(1),
  topic: z.string().min(1),
  questions: z
    .array(
      z.object({
        id: z.string().min(1),
        question: z.string().min(1),
        options: z.array(z.string().min(1)).min(2).max(5),
        correctIndex: z.number().int().min(0),
        explanation: z.string().min(1),
      }),
    )
    .min(1)
    .max(5),
});

export default defineTool({
  description:
    "Create an interactive multiple-choice quiz card rendered inline for the learner with instant feedback and explanations.",
  inputSchema: interactiveQuizInputSchema,
  label: {
    start: ({ topic }) => `Create quiz on ${topic}`,
  },
  execute(input) {
    return {
      title: input.title,
      topic: input.topic,
      questions: input.questions.map((question) => ({
        ...question,
        correctIndex: Math.min(
          question.correctIndex,
          question.options.length - 1,
        ),
      })),
    };
  },
});
