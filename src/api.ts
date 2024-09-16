import { Message, Conversation } from "@/types";
import { getAuthToken } from "@/utils";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function createConversation(input: string): Promise<Conversation> {
  const token = getAuthToken();
  if (!token) throw new Error("No auth token found");

  const response = await fetch(`${API_URL}/conversation`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      messages: [
        {
          role: "user",
          content: input,
        },
      ],
    }),
  });

  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

  const conversationData: Conversation = await response.json();

  // Trigger summarization without waiting for it to complete
  summarizeConversation(conversationData.id, token);

  return conversationData;
}

export async function addUserMessage(
  conversationId: number,
  message: Message
): Promise<void> {
  const token = getAuthToken();
  if (!token) throw new Error("No auth token found");

  const response = await fetch(
    `${API_URL}/conversation/${conversationId}/message`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(message),
    }
  );

  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
}

export async function completeConversation(
  conversationId: number
): Promise<Message> {
  const token = getAuthToken();
  if (!token) throw new Error("No auth token found");

  const response = await fetch(
    `${API_URL}/conversation/${conversationId}/completion`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

  const reader = response.body?.getReader();
  if (!reader) throw new Error("Unable to read response");

  const decoder = new TextDecoder();
  let fullContent = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    fullContent += decoder.decode(value);
  }

  return { role: "assistant", content: fullContent, id: Date.now().toString() };
}

export async function fetchConversationMessages(
  conversationId: number
): Promise<Conversation> {
  const token = getAuthToken();
  if (!token) throw new Error("No auth token found");

  const response = await fetch(`${API_URL}/conversation/${conversationId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

  return response.json();
}

async function summarizeConversation(
  conversationId: number,
  token: string
): Promise<void> {
  try {
    const response = await fetch(
      `${API_URL}/conversation/${conversationId}/summarize`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      console.error(
        `Summarization failed for conversation ${conversationId}: ${response.statusText}`
      );
    }
  } catch (error) {
    console.error(
      `Error during summarization for conversation ${conversationId}:`,
      error
    );
  }
}

export async function deleteConversation(
  conversationId: number
): Promise<void> {
  const token = getAuthToken();
  if (!token) throw new Error("No auth token found");

  const response = await fetch(`${API_URL}/conversation/${conversationId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) throw new Error("Failed to delete conversation");
}
