import { Message, Conversation } from "@/types";
import { getAuthToken } from "@/utils";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface LoginResponse {
  token: string;
}

interface RegisterResponse {
  token: string;
}

interface ApiError {
  detail: string;
}

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
      title: "", // Empty title, will be generated later
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

  // Ensure all required fields are present
  if (!conversationData.id || !conversationData.uuid) {
    throw new Error("Incomplete conversation data received from server");
  }

  // Ensure the messages array is initialized
  if (!Array.isArray(conversationData.messages)) {
    conversationData.messages = [
      {
        role: "user",
        content: input,
        id: Date.now().toString(),
      },
    ];
  }

  // Ensure the knowledge array is initialized
  if (!Array.isArray(conversationData.knowledge)) {
    conversationData.knowledge = [];
  }

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

export async function summarizeConversation(
  conversationId: number
): Promise<void> {
  const token = getAuthToken();
  if (!token) throw new Error("No auth token found");

  try {
    fetch(`${API_URL}/conversation/${conversationId}/summarize`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }).catch((error) => {
      console.error(
        `Error during summarization for conversation ${conversationId}:`,
        error
      );
    });
  } catch (error) {
    console.error(
      `Error initiating summarization for conversation ${conversationId}:`,
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

export const loginUser = async (
  email: string,
  password: string
): Promise<LoginResponse> => {
  const response = await fetch("https://api.afnb.ai-gelb.de/v1/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    throw new Error("Login failed");
  }

  return response.json();
};

export const registerUser = async (
  firstName: string,
  lastName: string,
  email: string,
  password: string
): Promise<RegisterResponse> => {
  const response = await fetch("https://api.afnb.ai-gelb.de/v1/signup", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ firstName, lastName, email, password }),
  });

  if (!response.ok) {
    const errorData: ApiError = await response.json();
    throw new Error(errorData.detail || "Registration failed");
  }

  return response.json();
};

export async function transcribeAudio(
  audioBlob: Blob,
  mimeType: string
): Promise<string> {
  const token = getAuthToken();
  if (!token) throw new Error("No auth token found");

  const formData = new FormData();
  const fileExtension = mimeType.split("/")[1];
  formData.append("audio_file", audioBlob, `recording.${fileExtension}`);

  const response = await fetch(`${API_URL}/audio/transcribe`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Speech to text conversion failed");
  }

  const data = await response.json();
  return data.transcription.trim();
}
