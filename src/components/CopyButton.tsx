import { useEffect, useRef, useState } from "react";

type CopyButtonProps = {
  value: string;
  title?: string;
};

function ClipboardIcon() {
  return (
    <svg aria-hidden="true" fill="none" height="18" viewBox="0 0 24 24" width="18">
      <path
        d="M9 4.75A2.25 2.25 0 0 1 11.25 2.5h1.5A2.25 2.25 0 0 1 15 4.75h1.25A2.75 2.75 0 0 1 19 7.5v10.75A2.75 2.75 0 0 1 16.25 21H7.75A2.75 2.75 0 0 1 5 18.25V7.5a2.75 2.75 0 0 1 2.75-2.75H9Zm2.25-.75a.75.75 0 0 0-.75.75v.5c0 .414.336.75.75.75h1.5a.75.75 0 0 0 .75-.75v-.5a.75.75 0 0 0-.75-.75h-1.5Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg aria-hidden="true" fill="none" height="18" viewBox="0 0 24 24" width="18">
      <path
        d="m6.75 12.75 3.5 3.5 7-8"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

export default function CopyButton({
  value,
  title = "Copy"
}: CopyButtonProps) {
  const [isCopied, setIsCopied] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  async function handleCopy() {
    if (!value || !navigator.clipboard) {
      return;
    }

    await navigator.clipboard.writeText(value);
    setIsCopied(true);

    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = window.setTimeout(() => {
      setIsCopied(false);
      timeoutRef.current = null;
    }, 2000);
  }

  return (
    <button
      aria-label={title}
      className="icon-button"
      disabled={!value}
      onClick={handleCopy}
      title={title}
      type="button"
    >
      {isCopied ? <CheckIcon /> : <ClipboardIcon />}
    </button>
  );
}
