import type { ReactNode } from "react";
import { Building2 } from "lucide-react";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container flex h-14 items-center gap-3 px-6">
          <Building2 className="h-5 w-5 text-primary" />
          <h1 className="text-lg font-semibold">Account Management</h1>
        </div>
      </header>
      <main className="container px-6 py-6">{children}</main>
    </div>
  );
}
