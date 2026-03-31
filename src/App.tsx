import { useEffect, useEffectEvent, useMemo, useRef, useState } from "react";
import faviconUrl from "../favicon.svg";
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
const githubUrl = "https://github.com/sdcb/json-formatter";

function isFormatShortcut(event: KeyboardEvent) {
  return (event.ctrlKey || event.metaKey) && !event.altKey && !event.shiftKey && event.key === "Enter";
}

function GitHubIcon() {
  return (
    <svg aria-hidden="true" fill="currentColor" height="18" viewBox="0 0 24 24" width="18">
      <path d="M12 .5C5.648.5.5 5.648.5 12a11.5 11.5 0 0 0 7.863 10.917c.575.106.787-.25.787-.556 0-.275-.012-1.188-.019-2.156-3.2.694-3.875-1.356-3.875-1.356-.525-1.337-1.281-1.694-1.281-1.694-1.05-.719.081-.706.081-.706 1.162.081 1.775 1.194 1.775 1.194 1.031 1.762 2.706 1.25 3.369.956.106-.744.406-1.25.737-1.537-2.556-.294-5.244-1.281-5.244-5.706 0-1.262.45-2.294 1.188-3.1-.119-.294-.512-1.475.112-3.075 0 0 .969-.312 3.175 1.188a10.94 10.94 0 0 1 5.781 0c2.206-1.5 3.175-1.188 3.175-1.188.625 1.6.231 2.781.112 3.075.738.806 1.188 1.838 1.188 3.1 0 4.437-2.694 5.406-5.263 5.694.419.362.794 1.075.794 2.169 0 1.569-.012 2.831-.012 3.219 0 .306.206.669.794.556A11.502 11.502 0 0 0 23.5 12C23.5 5.648 18.352.5 12 .5Z" />
    </svg>
  );
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
          <img alt="" className="brand-mark" height="32" src={faviconUrl} width="32" />
          <h1>JSON Formatter</h1>
        </div>

        <a
          aria-label="View source on GitHub"
          className="icon-button header-link"
          href={githubUrl}
          rel="noreferrer"
          target="_blank"
          title="View source on GitHub"
        >
          <GitHubIcon />
        </a>
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
