import { useState } from "react";
import { MessageCircle, X, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/theme-provider";

const COPILOT_URL =
  "https://copilotstudio.microsoft.com/environments/0582014c-9a6d-e35b-8705-5168c385f413/bots/auto_agent_s82bp/webchat?__version__=2";

export function CopilotChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);
  const { theme } = useTheme();

  function handleRefresh() {
    setIframeKey((k) => k + 1);
  }

  return (
    <>
      {/* Floating trigger button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className={cn(
            "fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full shadow-lg transition-transform hover:scale-110",
            "bg-gradient-to-br from-[#0078D4] to-[#50E6FF] text-white"
          )}
          title="Open Copilot"
        >
          <MessageCircle className="h-5 w-5" />
        </button>
      )}

      {/* Chat panel */}
      {isOpen && (
        <div
          className={cn(
            "fixed bottom-6 right-6 z-50 flex flex-col overflow-hidden rounded-xl border border-border shadow-2xl",
            "bg-white dark:bg-card"
          )}
          style={{ width: 400, height: 600 }}
        >
          {/* Header */}
          <div className="flex shrink-0 items-center justify-between bg-gradient-to-r from-[#0078D4] to-[#50E6FF] px-4 py-3">
            <span className="text-sm font-semibold text-white">Copilot</span>
            <div className="flex items-center gap-1">
              <button
                onClick={handleRefresh}
                className="rounded p-1 text-white/80 transition-colors hover:bg-white/20 hover:text-white"
                title="Restart conversation"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded p-1 text-white/80 transition-colors hover:bg-white/20 hover:text-white"
                title="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Iframe body */}
          <div className="flex-1 overflow-hidden">
            <iframe
              key={iframeKey}
              src={COPILOT_URL}
              title="Copilot Chat"
              className="h-full w-full border-0"
              style={{
                colorScheme: theme === "dark" ? "dark" : "light",
              }}
            />
          </div>
        </div>
      )}
    </>
  );
}
