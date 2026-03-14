import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { AppLayout } from "@/components/layout/app-layout";
import { AccountList } from "@/components/accounts";
import { ContactList } from "@/components/contacts";
import { ActionItemList } from "@/components/action-items";

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
      <HashRouter>
        <AppLayout>
          <Routes>
            <Route path="/accounts" element={<AccountList />} />
            <Route path="/contacts" element={<ContactList />} />
            <Route path="/action-items" element={<ActionItemList />} />
            <Route path="*" element={<Navigate to="/accounts" replace />} />
          </Routes>
        </AppLayout>
      </HashRouter>
      <Toaster richColors position="bottom-right" />
    </QueryClientProvider>
  );
}
