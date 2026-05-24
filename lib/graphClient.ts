import { Client } from "@microsoft/microsoft-graph-client";
import "isomorphic-fetch";

export function getGraphClient(accessToken: string): Client {
  return Client.init({
    authProvider: (done) => {
      done(null, accessToken);
    },
  });
}

export function getConfiguredDomains(): string[] {
  const raw = process.env.NEXT_PUBLIC_DOMAINS || "";
  return raw
    .split(",")
    .map((d) => d.trim().toLowerCase())
    .filter(Boolean);
}

export function getDomainLabels(): Record<string, string> {
  const domains = getConfiguredDomains();
  const labelsRaw = process.env.NEXT_PUBLIC_DOMAIN_LABELS || "";
  const labels = labelsRaw.split(",").map((l) => l.trim());
  const map: Record<string, string> = {};
  domains.forEach((d, i) => {
    map[d] = labels[i] || d;
  });
  return map;
}

export async function fetchEmails(accessToken: string, top = 50) {
  const client = getGraphClient(accessToken);
  const domains = getConfiguredDomains();

  const filterParts = domains.map(
    (d) => `contains(from/emailAddress/address,'@${d}')`
  );
  const filter = filterParts.join(" or ");

  const response = await client
    .api("/me/messages")
    .filter(filter)
    .top(top)
    .select(
      "id,subject,bodyPreview,body,from,toRecipients,receivedDateTime,isRead,conversationId"
    )
    .orderby("receivedDateTime desc")
    .get();

  return response.value ?? [];
}

export async function fetchEmailThread(accessToken: string, conversationId: string) {
  const client = getGraphClient(accessToken);
  const response = await client
    .api("/me/messages")
    .filter(`conversationId eq '${conversationId}'`)
    .select("id,subject,bodyPreview,body,from,toRecipients,receivedDateTime")
    .orderby("receivedDateTime asc")
    .get();
  return response.value ?? [];
}

export async function fetchTeamsChats(accessToken: string) {
  const client = getGraphClient(accessToken);
  const chatsResponse = await client
    .api("/me/chats")
    .expand("members")
    .top(20)
    .get();

  const chats = chatsResponse.value ?? [];
  const messages: {
    chatId: string;
    chatName: string;
    messages: unknown[];
  }[] = [];

  await Promise.all(
    chats.slice(0, 10).map(async (chat: { id: string; topic?: string; members?: { displayName?: string }[] }) => {
      try {
        const msgResponse = await client
          .api(`/me/chats/${chat.id}/messages`)
          .top(20)
          .get();
        const chatName =
          chat.topic ||
          (chat.members ?? [])
            .map((m: { displayName?: string }) => m.displayName)
            .filter(Boolean)
            .join(", ") ||
          "Group Chat";
        messages.push({
          chatId: chat.id,
          chatName,
          messages: msgResponse.value ?? [],
        });
      } catch {
        // skip chats we can't read
      }
    })
  );

  return messages;
}
