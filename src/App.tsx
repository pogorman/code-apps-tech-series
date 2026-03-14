import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { AppLayout } from "@/components/layout/app-layout";
import { AccountList } from "@/components/accounts";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
    },
  },
});

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppLayout>
        <AccountList />
      </AppLayout>
      <Toaster richColors position="bottom-right" />
    </QueryClientProvider>
  );
}
