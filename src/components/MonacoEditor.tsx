import Editor from "@monaco-editor/react";
import type { OnChange, OnMount } from "@monaco-editor/react";

type MonacoEditorProps = {
  value: string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
  language: string;
  ariaLabel: string;
  onFormatShortcut?: () => void;
};

function EditorFallback({
  value,
  onChange,
  readOnly,
  ariaLabel
}: Pick<MonacoEditorProps, "value" | "onChange" | "readOnly" | "ariaLabel">) {
  if (readOnly) {
    return (
      <pre aria-label={ariaLabel} className="editor-fallback editor-fallback-readonly">
        {value || "Formatting result will appear here."}
      </pre>
    );
  }

  return (
    <textarea
      aria-label={ariaLabel}
      className="editor-fallback"
      onChange={(event) => onChange?.(event.target.value)}
      spellCheck={false}
      value={value}
    />
  );
}

export default function MonacoEditor({
  value,
  onChange,
  readOnly = false,
  language,
  ariaLabel,
  onFormatShortcut
}: MonacoEditorProps) {
  const handleChange: OnChange = (nextValue) => {
    onChange?.(nextValue ?? "");
  };

  const handleMount: OnMount = (editor, monaco) => {
    if (!onFormatShortcut) {
      return;
    }

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      onFormatShortcut();
    });
  };

  return (
    <Editor
      aria-label={ariaLabel}
      defaultLanguage={language}
      height="100%"
      loading={
        <EditorFallback
          ariaLabel={ariaLabel}
          onChange={onChange}
          readOnly={readOnly}
          value={value}
        />
      }
      onChange={handleChange}
      onMount={handleMount}
      options={{
        automaticLayout: true,
        contextmenu: true,
        fontFamily: "'IBM Plex Mono', 'Cascadia Code', Consolas, monospace",
        fontLigatures: true,
        fontSize: 14,
        guides: {
          indentation: true
        },
        lineNumbersMinChars: 3,
        minimap: {
          enabled: false
        },
        padding: {
          top: 16,
          bottom: 16
        },
        readOnly,
        roundedSelection: true,
        scrollBeyondLastLine: false,
        scrollbar: {
          alwaysConsumeMouseWheel: false
        },
        smoothScrolling: true,
        tabSize: 2,
        wordWrap: "on"
      }}
      theme="vs-dark"
      value={value}
    />
  );
}
