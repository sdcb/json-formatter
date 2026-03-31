import { useEffect, useEffectEvent, useMemo, useRef, useState } from "react";
import CopyButton from "./components/CopyButton";
import MonacoEditor from "./components/MonacoEditor";
import type { IndentOption } from "./types";
import { formatJson } from "./utils/formatJson";

const indentOptions: Array<{ label: string; value: IndentOption }> = [
  { label: "Tab", value: "tab" },
  { label: "1 space", value: "space-1" },
  { label: "2 spaces", value: "space-2" },
  { label: "4 spaces", value: "space-4" }
];

const initialInput =
  '{"name":"json-formatter","description":"paste raw json on the left","hint":"click \\"Format JSON\\" to show the formatted result on the right","example":{"ui":"react","editor":"monaco"}}';

const mobileQuery = "(max-width: 900px)";

function isFormatShortcut(event: KeyboardEvent) {
  return (event.ctrlKey || event.metaKey) && !event.altKey && !event.shiftKey && event.key === "Enter";
}

export default function App() {
  const [inputValue, setInputValue] = useState(initialInput);
  const [outputValue, setOutputValue] = useState("");
  const [indent, setIndent] = useState<IndentOption>("space-2");
  const [splitRatio, setSplitRatio] = useState(0.5);
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia(mobileQuery).matches : false
  );
  const dragStateRef = useRef<{ pointerId: number | null }>({ pointerId: null });
  const workspaceRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const mediaQuery = window.matchMedia(mobileQuery);
    const handleChange = (event: MediaQueryListEvent) => {
      setIsMobile(event.matches);
    };

    setIsMobile(mediaQuery.matches);
    mediaQuery.addEventListener("change", handleChange);

    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, []);

  useEffect(() => {
    if (isMobile) {
      dragStateRef.current.pointerId = null;
    }
  }, [isMobile]);

  const layoutStyle = useMemo(
    () =>
      isMobile
        ? undefined
        : {
            gridTemplateColumns: `minmax(320px, ${splitRatio}fr) 14px minmax(320px, ${1 - splitRatio}fr)`
          },
    [isMobile, splitRatio]
  );

  const handleFormat = useEffectEvent(() => {
    const result = formatJson(inputValue, indent);
    if (result.ok) {
      setOutputValue(result.value);
      return;
    }

    setOutputValue(result.error);
  });

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isFormatShortcut(event) || event.isComposing) {
        return;
      }

      event.preventDefault();
      handleFormat();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleFormat]);

  function handlePointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if (isMobile || !workspaceRef.current) {
      return;
    }

    dragStateRef.current.pointerId = event.pointerId;
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (isMobile || !workspaceRef.current || dragStateRef.current.pointerId !== event.pointerId) {
      return;
    }

    const bounds = workspaceRef.current.getBoundingClientRect();
    const minWidth = 320;
    const availableWidth = bounds.width - 14;
    const nextLeft = Math.min(
      Math.max(event.clientX - bounds.left, minWidth),
      bounds.width - minWidth - 14
    );
    const nextRatio = nextLeft / availableWidth;
    setSplitRatio(Math.min(0.72, Math.max(0.28, nextRatio)));
  }

  function handlePointerUp(event: React.PointerEvent<HTMLDivElement>) {
    if (dragStateRef.current.pointerId !== event.pointerId) {
      return;
    }

    dragStateRef.current.pointerId = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }

  return (
    <main className="app-shell">
      <header className="page-header">
        <div className="brand">
          <img alt="" className="brand-mark" height="32" src="/favicon.svg" width="32" />
          <h1>JSON Formatter</h1>
        </div>
      </header>

      <section className="workspace" ref={workspaceRef} style={layoutStyle}>
        <article className="panel panel-input">
          <header className="panel-header">
            <h2>Raw JSON</h2>
          </header>

          <div className="editor-shell">
            <MonacoEditor
              ariaLabel="Raw JSON input"
              language="json"
              onChange={setInputValue}
              onFormatShortcut={handleFormat}
              value={inputValue}
            />
          </div>

          <div className="control-card">
            <div className="control-copy">
              <h3>Indentation</h3>
            </div>

            <div className="controls-row">
              <label className="select-wrap">
                <span className="sr-only">Indentation style</span>
                <select
                  className="indent-select"
                  onChange={(event) => setIndent(event.target.value as IndentOption)}
                  value={indent}
                >
                  {indentOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <button className="format-button" onClick={handleFormat} type="button">
                Format JSON
              </button>
            </div>
          </div>
        </article>

        <div
          aria-hidden={isMobile}
          className="divider"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        >
          <span className="divider-grip" />
        </div>

        <article className="panel panel-output">
          <header className="panel-header">
            <h2>Formatted JSON</h2>
            <CopyButton title="Copy formatted JSON" value={outputValue} />
          </header>

          <div className="editor-shell">
            <MonacoEditor
              ariaLabel="Formatted JSON output"
              language="json"
              onFormatShortcut={handleFormat}
              readOnly
              value={outputValue}
            />
          </div>
        </article>
      </section>
    </main>
  );
}
