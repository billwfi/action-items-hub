import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { fetchEmails, getConfiguredDomains } from "@/lib/graphClient";
import { Email } from "@/types";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const rawEmails = await fetchEmails(session.accessToken);
    const domains = getConfiguredDomains();

    const emails: Email[] = rawEmails.map((e: {
      id: string;
      subject?: string;
      bodyPreview?: string;
      body?: { content?: string };
      from?: { emailAddress?: { name?: string; address?: string } };
      toRecipients?: { emailAddress?: { name?: string; address?: string } }[];
      receivedDateTime?: string;
      isRead?: boolean;
      conversationId?: string;
    }) => {
      const fromAddress = e.from?.emailAddress?.address ?? "";
      const domain = fromAddress.split("@")[1]?.toLowerCase() ?? "";
      return {
        id: e.id,
        subject: e.subject ?? "(no subject)",
        bodyPreview: e.bodyPreview ?? "",
        body: e.body?.content,
        from: {
          name: e.from?.emailAddress?.name ?? fromAddress,
          address: fromAddress,
        },
        toRecipients: (e.toRecipients ?? []).map((r) => ({
          name: r.emailAddress?.name ?? r.emailAddress?.address ?? "",
          address: r.emailAddress?.address ?? "",
        })),
        receivedDateTime: e.receivedDateTime ?? "",
        domain: domains.includes(domain) ? domain : "other",
        isRead: e.isRead ?? true,
        conversationId: e.conversationId,
      };
    });

    return NextResponse.json({ emails });
  } catch (error) {
    console.error("Email fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch emails" },
      { status: 500 }
    );
  }
}
