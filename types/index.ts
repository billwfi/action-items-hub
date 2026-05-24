export interface Email {
  id: string;
  subject: string;
  bodyPreview: string;
  body?: string;
  from: {
    name: string;
    address: string;
  };
  toRecipients: { name: string; address: string }[];
  receivedDateTime: string;
  domain: string;
  isRead: boolean;
  conversationId?: string;
}

export interface TeamsMessage {
  id: string;
  chatId: string;
  chatName: string;
  from: string;
  body: string;
  createdDateTime: string;
  messageType: string;
}

export interface ActionItem {
  id: string;
  text: string;
  owner?: string;
  dueDate?: string;
  priority: "high" | "medium" | "low";
  source: "email" | "teams";
  sourceId: string;
  sourceSubject: string;
}

export interface NextStep {
  id: string;
  text: string;
  context: string;
  source: "email" | "teams";
  sourceId: string;
}

export interface AnalysisResult {
  sourceId: string;
  sourceType: "email" | "teams";
  sourceSubject: string;
  summary: string;
  actionItems: ActionItem[];
  nextSteps: NextStep[];
  analyzedAt: string;
}

export interface DomainConfig {
  domain: string;
  label: string;
  color: string;
}

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    error?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    refreshToken?: string;
    expiresAt?: number;
    error?: string;
  }
}
