import { useQuery } from "@tanstack/react-query";
import api from "@/utils/api";
import { Document } from "@/types/document";

export function useDocuments() {
  return useQuery<Document[]>({
    queryKey: ["documents"],
    queryFn: async () => {
      const response = await api.get("document/").json<Document[]>();
      return response;
    },
  });
}
