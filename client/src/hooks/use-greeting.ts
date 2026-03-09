import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/routes";

export function useGreeting() {
  return useQuery({
    queryKey: [api.greeting.get.path],
    queryFn: async () => {
      const res = await fetch(api.greeting.get.path, {
        headers: { "Content-Type": "application/json" },
        credentials: "include"
      });
      
      if (!res.ok) {
        throw new Error("Failed to fetch greeting");
      }
      
      const data = await res.json();
      return api.greeting.get.responses[200].parse(data);
    },
    // Don't retry endlessly for a simple hello world to keep the UI snappy on fail
    retry: 1, 
    staleTime: 1000 * 60 * 5 // 5 minutes
  });
}
