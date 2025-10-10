import { useQuery } from "@tanstack/react-query";
import api from "@/utils/api";
import { Conversation } from "@/types/conversation";

export function useConversations() {
  return useQuery<Conversation[]>({
    queryKey: ["conversations"],
    queryFn: async () => {
      const response = await api.get("conversation/").json<Conversation[]>();
      return response;
    },
  });
}
