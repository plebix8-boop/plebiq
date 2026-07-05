"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import type { FeaturedPoll } from "../data";

type ShareResultsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  poll: FeaturedPoll;
  percentages: string[];
};

type ShareOption = {
  label: string;
  helper: string;
  action: () => void;
};

const SHARE_DOMAIN = "https://plebiq.com";
const IMAGE_WIDTH = 1200;
const MIN_IMAGE_HEIGHT = 1500;
const OPTION_ACCENTS = [
  ["#146aff", "#2da3ff"],
  ["#7c3cff", "#2da3ff"],
  ["#0e304c", "#146aff"],
  ["#2da3ff", "#76d7ff"],
  ["#325a78", "#146aff"],
];

let logoDataUrlPromise: Promise<string> | null = null;

function escapeXml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function parsePercent(value: string) {
  const parsed = Number.parseFloat(value.replace("%", ""));
  if (Number.isFinite(parsed)) {
    return Math.max(0, Math.min(100, Math.round(parsed)));
  }
  return 0;
}

function wrapText(text: string, maxChars: number) {
  const words = text.trim().split(/\s+/);
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > maxChars && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  }

  if (current) lines.push(current);
  return lines;
}

function buildShareUrl(pollId: string | undefined) {
  if (!pollId) return SHARE_DOMAIN;
  return `${SHARE_DOMAIN}?poll=${encodeURIComponent(pollId)}`;
}

function buildCaption(poll: FeaturedPoll, shareUrl: string) {
  return `I just voted on Plebiq: "${poll.question}"\n\nSee the results and add your vote: ${shareUrl}`;
}

function loadLogoDataUrl() {
  if (!logoDataUrlPromise) {
    logoDataUrlPromise = fetch("/logo.png")
      .then((response) => {
        if (!response.ok) throw new Error("Could not load Plebiq logo.");
        return response.blob();
      })
      .then(
        (blob) =>
          new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(String(reader.result));
            reader.onerror = () => reject(new Error("Could not read Plebiq logo."));
            reader.readAsDataURL(blob);
          }),
      );
  }

  return logoDataUrlPromise;
}

function buildShareImage(
  poll: FeaturedPoll,
  percentages: string[],
  shareUrl: string,
  logoDataUrl?: string | null,
) {
  const questionLines = wrapText(poll.question, 30).slice(0, 4);
  const optionCount = poll.options.length;
  const optionGap = optionCount > 6 ? 22 : 28;
  const optionHeight = optionCount > 6 ? 124 : 148;
  const startY = 500;
  const contentHeight = startY + optionCount * (optionHeight + optionGap);
  const footerY = Math.max(1285, contentHeight + 28);
  const imageHeight = Math.max(MIN_IMAGE_HEIGHT, footerY + 150);
  const optionsSvg = poll.options
    .map((option, index) => {
      const percent = parsePercent(percentages[index] ?? option.previewWidth);
      const y = startY + index * (optionHeight + optionGap);
      const barWidth = Math.max(12, Math.round((percent / 100) * 674));
      const labelLines = wrapText(option.label, 34).slice(0, 2);
      const descriptionLines = wrapText(option.description, 50).slice(0, 1);
      const [accentStart, accentEnd] = OPTION_ACCENTS[index % OPTION_ACCENTS.length];
      const rank = String(index + 1).padStart(2, "0");

      return `
        <g transform="translate(100 ${y})">
          <rect x="0" y="10" width="1000" height="${optionHeight}" rx="38" fill="#082a45" opacity="0.16"/>
          <rect width="1000" height="${optionHeight}" rx="38" fill="#f4f8ff"/>
          <rect x="0" y="0" width="1000" height="${optionHeight}" rx="38" fill="none" stroke="#d6e7ff" stroke-width="2"/>
          <rect x="0" y="0" width="16" height="${optionHeight}" rx="8" fill="url(#optionGradient${index})"/>
          <circle cx="72" cy="58" r="30" fill="url(#optionGradient${index})"/>
          <text x="72" y="68" text-anchor="middle" fill="#ffffff" font-family="Inter, Arial, sans-serif" font-size="22" font-weight="900">${rank}</text>
          ${labelLines
            .map(
              (line, lineIndex) =>
                `<text x="122" y="${48 + lineIndex * 34}" fill="#0e304c" font-family="Inter, Arial, sans-serif" font-size="32" font-weight="900">${escapeXml(line)}</text>`,
            )
            .join("")}
          ${
            descriptionLines[0]
              ? `<text x="122" y="${labelLines.length > 1 ? 112 : 88}" fill="#47657d" font-family="Inter, Arial, sans-serif" font-size="22" font-weight="600">${escapeXml(descriptionLines[0])}</text>`
              : ""
          }
          <rect x="818" y="34" width="132" height="64" rx="26" fill="#e4f0ff"/>
          <text x="884" y="77" text-anchor="middle" fill="${accentStart}" font-family="Inter, Arial, sans-serif" font-size="40" font-weight="950">${percent}%</text>
          <rect x="122" y="${optionHeight - 34}" width="674" height="14" rx="7" fill="#d8e7fb"/>
          <rect x="122" y="${optionHeight - 34}" width="${barWidth}" height="14" rx="7" fill="url(#optionGradient${index})"/>
          <circle cx="${122 + barWidth}" cy="${optionHeight - 27}" r="18" fill="#ffffff" stroke="${accentEnd}" stroke-width="8"/>
          <defs>
            <linearGradient id="optionGradient${index}" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stop-color="${accentStart}"/>
              <stop offset="100%" stop-color="${accentEnd}"/>
            </linearGradient>
          </defs>
        </g>
      `;
    })
    .join("");

  const svg = `
    <svg width="${IMAGE_WIDTH}" height="${imageHeight}" viewBox="0 0 ${IMAGE_WIDTH} ${imageHeight}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bgGradient" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#0e304c"/>
          <stop offset="54%" stop-color="#146aff"/>
          <stop offset="100%" stop-color="#2da3ff"/>
        </linearGradient>
        <linearGradient id="barGradient" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="#146aff"/>
          <stop offset="100%" stop-color="#2da3ff"/>
        </linearGradient>
        <pattern id="dotPattern" width="44" height="44" patternUnits="userSpaceOnUse">
          <circle cx="6" cy="6" r="3" fill="#f4f8ff" opacity="0.18"/>
        </pattern>
        <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="24" stdDeviation="34" flood-color="#06243d" flood-opacity="0.22"/>
        </filter>
        <filter id="logoShadow" x="-20%" y="-40%" width="140%" height="180%">
          <feDropShadow dx="0" dy="14" stdDeviation="18" flood-color="#061f35" flood-opacity="0.28"/>
        </filter>
      </defs>
      <rect width="1200" height="${imageHeight}" fill="url(#bgGradient)"/>
      <rect width="1200" height="${imageHeight}" fill="url(#dotPattern)"/>
      <circle cx="1070" cy="120" r="230" fill="#f4f8ff" opacity="0.12"/>
      <circle cx="1040" cy="430" r="118" fill="none" stroke="#f4f8ff" stroke-width="22" opacity="0.12"/>
      <path d="M104 404 C220 312 314 404 430 298 S650 208 796 304" fill="none" stroke="#91ceff" stroke-width="10" stroke-linecap="round" opacity="0.24"/>
      <circle cx="120" cy="${imageHeight - 180}" r="260" fill="#2da3ff" opacity="0.18"/>
      <rect x="58" y="58" width="1084" height="${imageHeight - 116}" rx="58" fill="#f4f8ff" opacity="0.12" stroke="#f4f8ff" stroke-opacity="0.24"/>

      <g transform="translate(94 92)" filter="url(#logoShadow)">
        <rect x="0" y="0" width="480" height="132" rx="34" fill="#f4f8ff" opacity="0.97"/>
        ${
          logoDataUrl
            ? `<image href="${logoDataUrl}" x="30" y="28" width="420" height="76" preserveAspectRatio="xMidYMid meet"/>`
            : `<rect x="30" y="28" width="420" height="76" rx="18" fill="#d8e7fb"/>`
        }
      </g>
      <g transform="translate(790 116)">
        <rect width="310" height="70" rx="35" fill="#f4f8ff" opacity="0.18" stroke="#f4f8ff" stroke-opacity="0.26"/>
        <circle cx="38" cy="35" r="11" fill="#2da3ff"/>
        <text x="66" y="44" fill="#f4f8ff" font-family="Inter, Arial, sans-serif" font-size="24" font-weight="900" letter-spacing="3">LIVE RESULTS</text>
      </g>

      <g transform="translate(100 260)">
        <rect x="0" y="-36" width="${Math.max(220, poll.category.length * 18 + 96)}" height="54" rx="27" fill="#f4f8ff" opacity="0.17"/>
        <text x="38" y="0" fill="#d9efff" font-family="Inter, Arial, sans-serif" font-size="22" font-weight="900" letter-spacing="4">${escapeXml(poll.category.toUpperCase())}</text>
        ${questionLines
          .map(
            (line, index) =>
              `<text x="0" y="${84 + index * 58}" fill="#ffffff" font-family="Inter, Arial, sans-serif" font-size="52" font-weight="950">${escapeXml(line)}</text>`,
          )
          .join("")}
      </g>

      <g filter="url(#softShadow)">
        ${optionsSvg}
      </g>

      <g transform="translate(100 ${footerY})">
        <rect width="1000" height="92" rx="28" fill="#0e304c" opacity="0.88"/>
        <text x="40" y="38" fill="#f4f8ff" font-family="Inter, Arial, sans-serif" font-size="26" font-weight="900">Join the vote</text>
        <text x="40" y="68" fill="#b9ddff" font-family="Inter, Arial, sans-serif" font-size="22" font-weight="700">${escapeXml(shareUrl.replace("https://", ""))}</text>
        <path d="M910 31 L948 46 L910 61 M946 46 H834" fill="none" stroke="#2da3ff" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>
      </g>
    </svg>
  `;

  return { height: imageHeight, svg, width: IMAGE_WIDTH };
}

function svgToPreviewUrl(svg: string) {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

async function svgToPngBlob(svg: string, width: number, height: number) {
  const image = new Image();
  const svgBlob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(svgBlob);

  try {
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error("Could not render share image."));
      image.src = url;
    });

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Canvas is not available.");
    context.drawImage(image, 0, 0, width, height);

    return await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Could not export share image."));
      }, "image/png");
    });
  } finally {
    URL.revokeObjectURL(url);
  }
}

async function copyText(value: string) {
  await navigator.clipboard.writeText(value);
}

function openShareWindow(url: string) {
  window.open(url, "_blank", "noopener,noreferrer,width=720,height=720");
}

export function ShareResultsModal({
  isOpen,
  onClose,
  poll,
  percentages,
}: ShareResultsModalProps) {
  const [status, setStatus] = useState<string | null>(null);
  const [logoDataUrl, setLogoDataUrl] = useState<string | null>(null);
  const shareUrl = useMemo(() => buildShareUrl(poll.id), [poll.id]);
  const caption = useMemo(() => buildCaption(poll, shareUrl), [poll, shareUrl]);
  const shareImage = useMemo(
    () => buildShareImage(poll, percentages, shareUrl, logoDataUrl),
    [poll, percentages, shareUrl, logoDataUrl],
  );
  const previewUrl = useMemo(() => svgToPreviewUrl(shareImage.svg), [shareImage.svg]);

  useEffect(() => {
    let alive = true;

    void loadLogoDataUrl()
      .then((dataUrl) => {
        if (alive) {
          setLogoDataUrl(dataUrl);
        }
      })
      .catch(() => {
        if (alive) {
          setLogoDataUrl(null);
        }
      });

    return () => {
      alive = false;
    };
  }, []);

  async function createShareImage() {
    const logo = logoDataUrl ?? (await loadLogoDataUrl());
    return buildShareImage(poll, percentages, shareUrl, logo);
  }

  async function withStatus(action: () => Promise<void>, success: string) {
    try {
      setStatus(null);
      await action();
      setStatus(success);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Something went wrong.");
    }
  }

  async function shareNative() {
    await withStatus(async () => {
      const image = await createShareImage();
      const blob = await svgToPngBlob(image.svg, image.width, image.height);
      const file = new File([blob], "plebiq-poll-results.png", {
        type: "image/png",
      });
      const shareData: ShareData = {
        title: "Plebiq poll results",
        text: caption,
        url: shareUrl,
      };

      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ ...shareData, files: [file] });
        return;
      }

      if (navigator.share) {
        await navigator.share(shareData);
        return;
      }

      await copyText(caption);
    }, "Share ready.");
  }

  async function downloadImage() {
    await withStatus(async () => {
      const image = await createShareImage();
      const blob = await svgToPngBlob(image.svg, image.width, image.height);
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = "plebiq-poll-results.png";
      anchor.click();
      URL.revokeObjectURL(url);
    }, "Image downloaded.");
  }

  const platformShares: ShareOption[] = [
    {
      label: "Facebook",
      helper: "Share link",
      action: () =>
        openShareWindow(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
        ),
    },
    {
      label: "Reddit",
      helper: "Submit post",
      action: () =>
        openShareWindow(
          `https://www.reddit.com/submit?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(poll.question)}`,
        ),
    },
    {
      label: "WhatsApp",
      helper: "Send message",
      action: () =>
        openShareWindow(`https://wa.me/?text=${encodeURIComponent(caption)}`),
    },
    {
      label: "X",
      helper: "Post result",
      action: () =>
        openShareWindow(
          `https://twitter.com/intent/tweet?text=${encodeURIComponent(caption)}`,
        ),
    },
    {
      label: "LinkedIn",
      helper: "Share link",
      action: () =>
        openShareWindow(
          `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
        ),
    },
    {
      label: "Telegram",
      helper: "Send message",
      action: () =>
        openShareWindow(
          `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(caption)}`,
        ),
    },
  ];

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-[80] flex items-center justify-center overflow-y-auto bg-black/50 p-4 backdrop-blur-xl"
          exit={{ opacity: 0 }}
          initial={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="relative grid max-h-[min(900px,92vh)] w-full max-w-5xl overflow-hidden rounded-[1.5rem] border border-poll-option-border bg-poll-auth-modal-bg text-poll-auth-modal-text shadow-[0_30px_90px_var(--shadow-soft)] md:grid-cols-[0.95fr_1.05fr]"
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            onClick={(event) => event.stopPropagation()}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
          >
            <div className="min-h-0 overflow-y-auto p-5 sm:p-6">
              <div className="mb-4 flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-poll-card-subtle">
                    Share results
                  </p>
                  <h3 className="mt-2 text-2xl font-black leading-tight text-poll-auth-modal-text">
                    Share this poll with the world
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-poll-auth-modal-muted">
                    The image includes branding, percentages, every option, and the poll link.
                  </p>
                </div>
                <button
                  className="grid size-9 shrink-0 place-items-center rounded-full border border-poll-option-border bg-poll-option-bg text-poll-option-text transition hover:bg-poll-option-bg-hover"
                  onClick={onClose}
                  type="button"
                >
                  x
                </button>
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                <button
                  className="rounded-2xl bg-button-primary-bg px-4 py-3 text-sm font-black text-button-primary-text transition hover:bg-button-primary-bg-hover"
                  onClick={shareNative}
                  type="button"
                >
                  Native share
                </button>
                <button
                  className="rounded-2xl border border-button-secondary-border bg-button-secondary-bg px-4 py-3 text-sm font-bold text-button-secondary-text transition hover:bg-button-secondary-bg-hover"
                  onClick={downloadImage}
                  type="button"
                >
                  Download image
                </button>
                <button
                  className="rounded-2xl border border-button-secondary-border bg-button-secondary-bg px-4 py-3 text-sm font-bold text-button-secondary-text transition hover:bg-button-secondary-bg-hover"
                  onClick={() => void withStatus(() => copyText(shareUrl), "Link copied.")}
                  type="button"
                >
                  Copy link
                </button>
                <button
                  className="rounded-2xl border border-button-secondary-border bg-button-secondary-bg px-4 py-3 text-sm font-bold text-button-secondary-text transition hover:bg-button-secondary-bg-hover"
                  onClick={() => void withStatus(() => copyText(caption), "Caption copied.")}
                  type="button"
                >
                  Copy caption
                </button>
              </div>

              <div className="mt-5">
                <p className="mb-2 text-xs font-black uppercase tracking-[0.16em] text-poll-card-subtle">
                  Platforms
                </p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {platformShares.map((option) => (
                    <button
                      className="rounded-2xl border border-poll-option-border bg-poll-option-bg px-4 py-3 text-left transition hover:border-poll-option-border-hover hover:bg-poll-option-bg-hover"
                      key={option.label}
                      onClick={option.action}
                      type="button"
                    >
                      <span className="block text-sm font-black text-poll-option-text">
                        {option.label}
                      </span>
                      <span className="mt-0.5 block text-xs text-poll-option-muted">
                        {option.helper}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-4 rounded-2xl border border-poll-option-border bg-poll-option-bg p-4">
                <p className="text-sm font-black text-poll-option-text">Instagram</p>
                <p className="mt-1 text-xs leading-5 text-poll-option-muted">
                  Instagram does not support direct web sharing. Download the image and copy the caption.
                </p>
              </div>

              {status && (
                <p className="mt-4 rounded-2xl border border-poll-option-border bg-poll-option-bg px-4 py-3 text-sm font-semibold text-poll-option-text">
                  {status}
                </p>
              )}
            </div>

            <div className="min-h-0 bg-poll-option-bg p-4 sm:p-6">
              <div className="mx-auto max-h-full max-w-sm overflow-hidden rounded-[1.3rem] border border-poll-option-border bg-poll-card-bg shadow-[0_18px_50px_var(--shadow-soft)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  alt="Generated Plebiq poll result share image preview"
                  className="h-full w-full object-contain"
                  src={previewUrl}
                />
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
    ,
    document.body,
  );
}
