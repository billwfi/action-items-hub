import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { fetchTeamsChats } from "@/lib/graphClient";
import { TeamsMessage } from "@/types";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const chatGroups = await fetchTeamsChats(session.accessToken);

    const messages: TeamsMessage[] = chatGroups.flatMap((group) =>
      (group.messages as {
        id: string;
        from?: { user?: { displayName?: string } };
        body?: { content?: string };
        createdDateTime?: string;
        messageType?: string;
      }[])
        .filter((m) => m.messageType === "message" && m.body?.content)
        .map((m) => ({
          id: m.id,
          chatId: group.chatId,
          chatName: group.chatName,
          from: m.from?.user?.displayName ?? "Unknown",
          body: m.body?.content?.replace(/<[^>]+>/g, "") ?? "",
          createdDateTime: m.createdDateTime ?? "",
          messageType: m.messageType ?? "message",
        }))
    );

    return NextResponse.json({ messages });
  } catch (error) {
    console.error("Teams fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch Teams messages" },
      { status: 500 }
    );
  }
}
