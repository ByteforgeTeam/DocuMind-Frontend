import { useQuery } from "@tanstack/react-query";
import api from "@/utils/api";
import { Conversation, ConversationDetail } from "@/types/conversation";

export function useConversations() {
  return useQuery<Conversation[]>({
    queryKey: ["conversations"],
    queryFn: async () => {
      const response = await api.get("conversation/").json<Conversation[]>();
      return response;
    },
  });
}

export function useConversationDetail(conversationId: string | number) {
  return useQuery<ConversationDetail>({
    queryKey: ["conversation", conversationId],
    queryFn: async () => {
      const response = await api
        .get(`conversation/${conversationId}`)
        .json<ConversationDetail>();
      return response;
    },
    enabled: !!conversationId,
  });
}
