import { useState, useRef, useEffect } from "react";
import type { DriveItem } from "../types";
import { eventBus } from "../events";

interface ShareButtonProps {
  item: DriveItem;
  labels: {
    share: string;
    copyLink: string;
    copiedToClipboard: string;
    shareOn: string;
  };
  variant?: "button" | "icon";
}

function buildShareUrl(itemId: string): string {
  const base = window.location.href.split("?")[0].split("#")[0];
  return `${base}#/?item=${encodeURIComponent(itemId)}`;
}

export function ShareButton({ item, labels, variant = "button" }: ShareButtonProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  async function handleShare() {
    const url = buildShareUrl(item.id);
    const title = item.name;
    eventBus.emit("share:item", { item });

    if (navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch {
        // user cancelled or not supported, fallback to dropdown
      }
    }
    setOpen(!open);
  }

  async function copyToClipboard() {
    const url = buildShareUrl(item.id);
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      eventBus.emit("notify:success", { message: labels.copiedToClipboard });
    } catch {
      // fallback
      const textArea = document.createElement("textarea");
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
    setOpen(false);
  }

  function shareExternal(platform: string) {
    const url = encodeURIComponent(buildShareUrl(item.id));
    const text = encodeURIComponent(item.name);
    let href = "";
    switch (platform) {
      case "facebook":
        href = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
        break;
      case "twitter":
        href = `https://twitter.com/intent/tweet?url=${url}&text=${text}`;
        break;
      case "whatsapp":
        href = `https://wa.me/?text=${text}%20${url}`;
        break;
      case "email":
        href = `mailto:?subject=${text}&body=${url}`;
        break;
    }
    if (href) window.open(href, "_blank", "noopener,noreferrer");
    setOpen(false);
  }

  if (variant === "icon") {
    return (
      <div className="share-btn-wrapper" ref={wrapperRef}>
        <button type="button" className="share-icon-mini" onClick={handleShare} title={labels.share}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
          </svg>
        </button>
        {open && (
          <div className="share-dropdown">
            <button type="button" onClick={copyToClipboard}>{copied ? "✓" : "🔗"} {labels.copyLink}</button>
            <button type="button" onClick={() => shareExternal("facebook")}>📘 Facebook</button>
            <button type="button" onClick={() => shareExternal("twitter")}>🐦 X / Twitter</button>
            <button type="button" onClick={() => shareExternal("whatsapp")}>💬 WhatsApp</button>
            <button type="button" onClick={() => shareExternal("email")}>✉️ Email</button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="share-btn-wrapper" ref={wrapperRef}>
      <button type="button" className="share-btn" onClick={handleShare}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
        </svg>
        {labels.share}
      </button>
      {open && (
        <div className="share-dropdown">
          <button type="button" onClick={copyToClipboard}>{copied ? "✓" : "🔗"} {labels.copyLink}</button>
          <button type="button" onClick={() => shareExternal("facebook")}>📘 Facebook</button>
          <button type="button" onClick={() => shareExternal("twitter")}>🐦 X / Twitter</button>
          <button type="button" onClick={() => shareExternal("whatsapp")}>💬 WhatsApp</button>
          <button type="button" onClick={() => shareExternal("email")}>✉️ Email</button>
        </div>
      )}
    </div>
  );
}
