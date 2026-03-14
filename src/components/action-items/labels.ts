import type { Tdvsp_actionitemsModel } from "@/generated";

type Priority = Tdvsp_actionitemsModel.Tdvsp_actionitemstdvsp_priority;
type TaskStatus = Tdvsp_actionitemsModel.Tdvsp_actionitemstdvsp_taskstatus;

export const PRIORITY_LABELS: Record<Priority, string> = {
  468510001: "Eh",
  468510000: "Low",
  468510003: "High",
  468510002: "Top Priority",
};

export const STATUS_LABELS: Record<TaskStatus, string> = {
  468510000: "Recognized",
  468510001: "In Progress",
  468510002: "Pending Comms",
  468510003: "On Hold",
  468510004: "Wrapping Up",
  468510005: "Complete",
};

export const TASK_TYPE_LABELS: Record<Tdvsp_actionitemsModel.Tdvsp_actionitemstdvsp_tasktype, string> = {
  468510000: "Personal",
  468510001: "Work",
};

export function priorityVariant(p: Priority): "default" | "secondary" | "destructive" | "outline" {
  if (p === 468510002) return "destructive";
  if (p === 468510003) return "default";
  if (p === 468510000) return "secondary";
  return "outline";
}

export function statusVariant(s: TaskStatus): "default" | "secondary" | "destructive" | "outline" {
  if (s === 468510005) return "default";
  if (s === 468510001) return "secondary";
  return "outline";
}
