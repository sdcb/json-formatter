export type IndentOption = "tab" | "space-1" | "space-2" | "space-4";

export type FormatJsonResult =
  | { ok: true; value: string }
  | { ok: false; error: string };
