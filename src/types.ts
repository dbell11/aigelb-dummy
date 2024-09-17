export interface Message {
  content: string;
  id: string;
  role: string;
}

export interface KnowledgeItem {
  id: number;
  fileName: string;
}

export interface Conversation {
  title: string;
  id: number;
  uuid: string;
  user_id?: number;
  messages: Message[];
  knowledge: KnowledgeItem[];
}
