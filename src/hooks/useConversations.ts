import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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

export function useCreateConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      initial_message,
      document_ids,
    }: {
      initial_message: string;
      document_ids: number[];
    }) => {
      const response = await api
        .post("conversation/", {
          json: { initial_message, document_ids },
        })
        .json<Conversation>();

      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
}

export function useDeleteConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (conversationId: string | number) => {
      await api.delete(`conversation/${conversationId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
}
