import Anthropic from "@anthropic-ai/sdk";
import { ActionItem, NextStep, AnalysisResult } from "@/types";

const client = new Anthropic();

const SYSTEM_PROMPT = `You are an expert assistant that analyzes email threads and Teams chat conversations to extract actionable information.

For each conversation you analyze, identify:
1. **Action Items**: Specific tasks that need to be done, with an owner (person responsible) if mentioned, and due date if mentioned. Rate each as high/medium/low priority.
2. **Next Steps**: Forward-looking items, follow-ups, and planned activities.
3. **Summary**: A brief 2-3 sentence summary of the conversation.

Respond in valid JSON only. No markdown fences. Use this exact structure:
{
  "summary": "string",
  "actionItems": [
    {
      "text": "string",
      "owner": "string or null",
      "dueDate": "string or null (ISO date if extractable)",
      "priority": "high|medium|low"
    }
  ],
  "nextSteps": [
    {
      "text": "string",
      "context": "string (brief context for this step)"
    }
  ]
}`;

export async function analyzeContent(
  content: string,
  sourceType: "email" | "teams",
  sourceId: string,
  sourceSubject: string
): Promise<AnalysisResult> {
  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 2048,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: `Analyze this ${sourceType === "email" ? "email thread" : "Teams chat"} and extract action items and next steps:\n\n${content}`,
      },
    ],
  });

  const rawText =
    message.content[0].type === "text" ? message.content[0].text : "{}";

  let parsed: {
    summary?: string;
    actionItems?: { text: string; owner?: string; dueDate?: string; priority?: string }[];
    nextSteps?: { text: string; context?: string }[];
  };
  try {
    parsed = JSON.parse(rawText);
  } catch {
    parsed = { summary: rawText, actionItems: [], nextSteps: [] };
  }

  const actionItems: ActionItem[] = (parsed.actionItems ?? []).map(
    (item, i) => ({
      id: `${sourceId}-action-${i}`,
      text: item.text,
      owner: item.owner ?? undefined,
      dueDate: item.dueDate ?? undefined,
      priority: (["high", "medium", "low"].includes(item.priority ?? "")
        ? item.priority
        : "medium") as "high" | "medium" | "low",
      source: sourceType,
      sourceId,
      sourceSubject,
    })
  );

  const nextSteps: NextStep[] = (parsed.nextSteps ?? []).map((step, i) => ({
    id: `${sourceId}-step-${i}`,
    text: step.text,
    context: step.context ?? "",
    source: sourceType,
    sourceId,
  }));

  return {
    sourceId,
    sourceType,
    sourceSubject,
    summary: parsed.summary ?? "",
    actionItems,
    nextSteps,
    analyzedAt: new Date().toISOString(),
  };
}
