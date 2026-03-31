import type { FormatJsonResult, IndentOption } from "../types";

const indentMap: Record<IndentOption, string | number> = {
  tab: "\t",
  "space-1": 1,
  "space-2": 2,
  "space-4": 4
};

export function formatJson(input: string, indent: IndentOption): FormatJsonResult {
  try {
    const parsed = JSON.parse(input);
    return {
      ok: true,
      value: JSON.stringify(parsed, null, indentMap[indent])
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown JSON parse error";
    return {
      ok: false,
      error: `JSON parse failed: ${message}`
    };
  }
}
