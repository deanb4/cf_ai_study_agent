import { AIChatAgent } from "@cloudflare/ai-chat";
import { routeAgentRequest, callable } from "agents";
import { createWorkersAI } from "workers-ai-provider";
import { streamText, convertToModelMessages, pruneMessages, tool, stepCountIs } from "ai";
import { z } from "zod";

type StudyState = {
  quizScore: { correct: number; total: number };
  currentTopic: string;
};

export class ChatAgent extends AIChatAgent<Env, StudyState> {
  initialState: StudyState = {
    quizScore: { correct: 0, total: 0 },
    currentTopic: "",
  };

  @callable()
  resetScore() {
    this.setState({ ...this.state, quizScore: { correct: 0, total: 0 } });
    return { reset: true };
  }

  async onChatMessage() {
    const workersai = createWorkersAI({ binding: this.env.AI });

    const result = streamText({
    //   model: workersai("@cf/zai-org/glm-4.7-flash"),
      model: workersai("@cf/zai-org/glm-4.7-flash"),
      toolChoice: "auto",
      system: `You are an expert CS tutor helping students prepare for exams.
            Always prioritize multiple choice quiz/questions unless specifies otherwise by user.
            You can generate practice questions and check answers across all CS topics:
            algorithms, data structures, networking, operating systems, databases, and web development.
            Current topic: ${this.state.currentTopic || "none set"}.
            When the user answers a question you MUST call the checkAnswer tool - do not write the result as text.
            You MUST write out the full question for the user in your response.
            Never write JSON or tool call syntax in your responses.`,
      messages:  await convertToModelMessages(this.messages),
      tools: {
        generateQuestion: tool({
          description: "Generate a CS practice question on a given topic",
          inputSchema: z.object({
            topic: z.string().describe("CS topic e.g. 'binary trees', 'TCP/IP'"),
            difficulty: z.enum(["easy", "medium", "hard"]),
          }),
        }),
        checkAnswer: tool({
          description: "Check if the user's answer is correct and update their score",
          inputSchema: z.object({
            correct: z.boolean().describe("Whether the answer was correct"),
            explanation: z.string().describe("Explanation of the correct answer"),
          }),

        }),
      },
      stopWhen: stepCountIs(5),
    });

    return result.toUIMessageStreamResponse();
  }
}

export default {
  async fetch(request: Request, env: Env) {
    return (
      (await routeAgentRequest(request, env)) ||
      new Response("Not found", { status: 404 })
    );
  },
} satisfies ExportedHandler<Env>;
