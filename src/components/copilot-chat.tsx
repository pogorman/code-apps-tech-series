import { useState, useRef, useCallback } from "react";
import { MessageCircle, X, RotateCcw, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/theme-provider";
import ReactWebChat, { createDirectLine, createStore } from "botframework-webchat";

const DIRECT_LINE_SECRET = import.meta.env.VITE_COPILOT_DIRECT_LINE_SECRET || "";

export function CopilotChat() {
  const { theme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [directLine, setDirectLine] = useState<ReturnType<typeof createDirectLine> | null>(null);
  const [store, setStore] = useState<ReturnType<typeof createStore> | null>(null);
  const initializingRef = useRef(false);

  const initializeChat = useCallback(async () => {
    if (initializingRef.current) return;
    initializingRef.current = true;
    setIsLoading(true);
    setError(null);

    try {
      if (!DIRECT_LINE_SECRET) {
        throw new Error("VITE_COPILOT_DIRECT_LINE_SECRET not configured");
      }

      // Exchange secret for a conversation token
      const res = await fetch(
        "https://directline.botframework.com/v3/directline/tokens/generate",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${DIRECT_LINE_SECRET}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user: { id: "code-app-user", name: "Code App User" },
          }),
        }
      );

      if (!res.ok) {
        throw new Error(`Direct Line token error: ${res.status}`);
      }

      const tokenData = await res.json();
      const dl = createDirectLine({ token: tokenData.token });

      // Store with no SSO middleware — bot will show sign-in card if needed
      const chatStore = createStore({}, () => (next: (action: unknown) => unknown) => (action: unknown) => {
        return next(action);
      });

      setStore(chatStore);
      setDirectLine(dl);

      // Send startConversation event once connected
      const subscription = dl.connectionStatus$.subscribe({
        next: (status: number) => {
          if (status === 2) {
            dl.postActivity({
              type: "event",
              name: "startConversation",
              from: { id: "code-app-user", name: "Code App User" },
            } as Parameters<typeof dl.postActivity>[0]).subscribe({
              next: () => console.log("Sent startConversation event"),
              error: (err: Error) => console.warn("startConversation failed:", err),
            });
            subscription.unsubscribe();
          }
        },
      });

      setIsLoading(false);
    } catch (err) {
      console.error("Chat init failed:", err);
      setError(err instanceof Error ? err.message : "Failed to connect");
      setIsLoading(false);
    } finally {
      initializingRef.current = false;
    }
  }, []);

  function handleOpen() {
    setIsOpen(true);
    if (!directLine && !isLoading) {
      initializeChat();
    }
  }

  function handleClear() {
    setDirectLine(null);
    setStore(null);
    setError(null);
    initializeChat();
  }

  const isDark = theme === "dark";

  const styleOptions = {
    backgroundColor: isDark ? "#1a1a2e" : "#ffffff",
    bubbleBackground: isDark ? "#2d2d3d" : "#f0f0f0",
    bubbleTextColor: isDark ? "#e0e0e0" : "#242424",
    bubbleFromUserBackground: "#0078D4",
    bubbleFromUserTextColor: "#ffffff",
    bubbleBorderRadius: 8,
    sendBoxBackground: isDark ? "#2d2d3d" : "#ffffff",
    sendBoxTextColor: isDark ? "#e0e0e0" : "#242424",
    sendBoxButtonColor: "#0078D4",
    sendBoxButtonColorOnHover: "#106EBE",
    sendBoxBorderTop: `1px solid ${isDark ? "#404050" : "#e0e0e0"}`,
    userAvatarInitials: "You",
    hideUploadButton: true,
  };

  return (
    <>
      {/* Floating trigger button */}
      {!isOpen && (
        <button
          onClick={handleOpen}
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
                onClick={handleClear}
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

          {/* Chat body */}
          <div className="flex-1 overflow-hidden">
            {isLoading ? (
              <div className="flex h-full flex-col items-center justify-center gap-3">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Connecting...</span>
              </div>
            ) : error ? (
              <div className="flex h-full flex-col items-center justify-center gap-3 px-6">
                <span className="text-sm text-destructive">{error}</span>
                <button
                  onClick={handleClear}
                  className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90"
                >
                  Retry
                </button>
              </div>
            ) : directLine && store ? (
              <ReactWebChat
                directLine={directLine}
                store={store}
                styleOptions={styleOptions}
                locale="en-US"
              />
            ) : null}
          </div>
        </div>
      )}
    </>
  );
}
