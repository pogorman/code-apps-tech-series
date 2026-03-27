import { useRef } from "react";
import { MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const COPILOT_URL =
  "https://copilotstudio.microsoft.com/environments/0582014c-9a6d-e35b-8705-5168c385f413/bots/auto_agent_s82bp/webchat?__version__=2";

export function CopilotChat() {
  const windowRef = useRef<Window | null>(null);

  function handleOpen() {
    // If the window is already open and not closed, focus it
    if (windowRef.current && !windowRef.current.closed) {
      windowRef.current.focus();
      return;
    }

    // Open a sized popup window
    windowRef.current = window.open(
      COPILOT_URL,
      "copilot-chat",
      "width=420,height=640,resizable=yes,scrollbars=no,status=no,toolbar=no,menubar=no,location=no"
    );
  }

  return (
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
  );
}
