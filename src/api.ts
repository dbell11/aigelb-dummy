import { getAuthToken } from "@/utils";
import { Conversation, Message, KnowledgeItem } from "@/types";

interface LoginResponse {
  token: string;
}

interface RegisterResponse {
  token: string;
}

interface ApiError {
  detail: string;
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

export const summarizeConversation = async (
  conversationId: number
): Promise<void> => {
  const token = getAuthToken();
  if (!token) throw new Error("No token found");

  const response = await fetch(
    `https://api.afnb.ai-gelb.de/v1/conversation/${conversationId}/summarize`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        accept: "application/json",
        authorization: "Bearer " + token,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to summarize conversation");
  }
};

export const fetchConversations = async (): Promise<Conversation[]> => {
  const token = getAuthToken();
  if (!token) throw new Error("No token found");

  const response = await fetch(
    "https://api.afnb.ai-gelb.de/v1/conversation?skip=0&limit=100",
    {
      headers: {
        accept: "application/json",
        authorization: "Bearer " + token,
      },
    }
  );

  if (!response.ok) throw new Error("Failed to fetch conversations");

  const data: Conversation[] = await response.json();

  // Check and summarize conversations without titles
  const updatedConversations = await Promise.all(
    data.map(async (conv: Conversation) => {
      if (!conv.title) {
        try {
          await summarizeConversation(conv.id);
          // Fetch the updated conversation to get the new title
          const updatedConv = await fetchSingleConversation(conv.id);
          return updatedConv;
        } catch (error) {
          console.error(`Failed to summarize conversation ${conv.id}:`, error);
          return { ...conv, title: `Untitled Conversation ${conv.id}` };
        }
      }
      return conv;
    })
  );

  return updatedConversations;
};
export const fetchSingleConversation = async (
  id: number
): Promise<Conversation> => {
  const token = getAuthToken();
  if (!token) throw new Error("No token found");

  const response = await fetch(
    `https://api.afnb.ai-gelb.de/v1/conversation/${id}`,
    {
      headers: {
        accept: "application/json",
        authorization: "Bearer " + token,
      },
    }
  );

  if (!response.ok) throw new Error(`Failed to fetch conversation ${id}`);

  const data: Conversation = await response.json();
  return data;
};

export const deleteConversation = async (id: number): Promise<void> => {
  const token = getAuthToken();
  if (!token) throw new Error("No token found");

  const response = await fetch(
    `https://api.afnb.ai-gelb.de/v1/conversation/${id}`,
    {
      method: "DELETE",
      headers: {
        accept: "application/json",
        authorization: "Bearer " + token,
      },
    }
  );

  if (response.status !== 200) {
    throw new Error("Failed to delete conversation");
  }
};

export const createConversation = async (
  input?: string
): Promise<{ id: number; uuid: string; messageId: number }> => {
  const token = getAuthToken();
  if (!token) throw new Error("No token found");

  const response = await fetch("https://api.afnb.ai-gelb.de/v1/conversation", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      accept: "application/json",
      authorization: "Bearer " + token,
    },
    body: JSON.stringify({
      title: "",
      messages: input ? [{ role: "user", content: input }] : [],
    }),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  return {
    id: data.id,
    uuid: data.uuid,
    messageId: data.messages[0]?.id,
  };
};

export const addUserMessage = async (
  conversationId: number,
  message: Message
): Promise<{ id: number }> => {
  const token = getAuthToken();
  if (!token) throw new Error("No token found");

  const response = await fetch(
    `https://api.afnb.ai-gelb.de/v1/conversation/${conversationId}/message`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        accept: "application/json",
        authorization: "Bearer " + token,
      },
      body: JSON.stringify({
        role: message.role,
        content: message.content,
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  return { id: data.id };
};

export const uploadFile = async (
  conversationId: number,
  file: File
): Promise<KnowledgeItem> => {
  const token = getAuthToken();
  if (!token) throw new Error("No token found");

  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(
    `https://api.afnb.ai-gelb.de/v1/conversation/${conversationId}/knowledge`,
    {
      method: "POST",
      headers: {
        accept: "application/json",
        authorization: "Bearer " + token,
      },
      body: formData,
    }
  );

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const result = await response.json();
  return { id: result.id, fileName: file.name };
};

export const deleteFile = async (
  conversationId: number,
  fileId: number
): Promise<void> => {
  const token = getAuthToken();
  if (!token) throw new Error("No token found");

  const response = await fetch(
    `https://api.afnb.ai-gelb.de/v1/conversation/${conversationId}/knowledge/${fileId}`,
    {
      method: "DELETE",
      headers: {
        accept: "application/json",
        authorization: "Bearer " + token,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
};

export const editMessage = async (
  conversationId: number,
  messageId: string,
  newContent: string
): Promise<void> => {
  const token = getAuthToken();
  if (!token) throw new Error("No token found");

  const response = await fetch(
    `https://api.afnb.ai-gelb.de/v1/conversation/${conversationId}/message/${messageId}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify({ content: newContent }),
    }
  );

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
};

export const fetchConversationByUuid = async (
  uuid: string
): Promise<Conversation> => {
  const token = getAuthToken();
  if (!token) throw new Error("No token found");

  const response = await fetch(
    `https://api.afnb.ai-gelb.de/v1/conversation/uuid/${uuid}`,
    {
      headers: {
        accept: "application/json",
        authorization: "Bearer " + token,
      },
    }
  );

  if (!response.ok) throw new Error("Failed to fetch conversation");

  const data: Conversation = await response.json();
  return data;
};
