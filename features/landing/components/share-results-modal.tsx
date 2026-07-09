"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState, type ComponentType } from "react";
import { createPortal } from "react-dom";
import {
  FaCopy,
  FaDownload,
  FaFacebookF,
  FaLinkedinIn,
  FaRedditAlien,
  FaShareAlt,
  FaTelegramPlane,
  FaTwitter,
  FaWhatsapp,
} from "react-icons/fa";
import type { FeaturedPoll } from "../data";
import { AppButton } from "@/components/ui/button";

type ShareResultsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  poll: FeaturedPoll;
  percentages: string[];
};

type ShareOption = {
  label: string;
  helper: string;
  Icon: ComponentType<{ className?: string }>;
  color: string;
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
  const results = poll.options
    .map((option, index) => ({
      option,
      originalIndex: index,
      percent: parsePercent(percentages[index] ?? option.previewWidth),
    }))
    .sort((a, b) => b.percent - a.percent);
  const questionLines = wrapText(poll.question, 27).slice(0, 4);
  const optionCount = results.length;
  const optionGap = optionCount > 6 ? 18 : 22;
  const optionHeight = optionCount > 6 ? 118 : 132;
  const startY = 560;
  const contentHeight = startY + optionCount * (optionHeight + optionGap);
  const footerY = Math.max(1290, contentHeight + 34);
  const imageHeight = Math.max(MIN_IMAGE_HEIGHT, footerY + 150);
  const cardHeight = imageHeight - 150;
  const optionsSvg = results
    .map(({ option, percent, originalIndex }, index) => {
      const y = startY + index * (optionHeight + optionGap);
      const barWidth = Math.max(12, Math.round((percent / 100) * 640));
      const labelLines = wrapText(option.label, 32).slice(0, 2);
      const descriptionLines = wrapText(option.description, 46).slice(0, 1);
      const [accentStart, accentEnd] = OPTION_ACCENTS[originalIndex % OPTION_ACCENTS.length];
      const rank = String(index + 1).padStart(2, "0");

      return `
        <g transform="translate(130 ${y})">
          <rect x="0" y="10" width="940" height="${optionHeight}" rx="30" fill="#050812" opacity="0.34"/>
          <rect width="940" height="${optionHeight}" rx="30" fill="#ffffff" opacity="0.055"/>
          <rect width="940" height="${optionHeight}" rx="30" fill="none" stroke="#ffffff" stroke-opacity="0.085" stroke-width="2"/>
          <circle cx="58" cy="52" r="27" fill="url(#optionGradient${index})"/>
          <text x="58" y="61" text-anchor="middle" fill="#ffffff" font-family="Inter, Arial, sans-serif" font-size="20" font-weight="900">${rank}</text>
          ${labelLines
            .map(
              (line, lineIndex) =>
                `<text x="108" y="${43 + lineIndex * 31}" fill="#ffffff" fill-opacity="0.95" font-family="Inter, Arial, sans-serif" font-size="28" font-weight="850">${escapeXml(line)}</text>`,
            )
            .join("")}
          ${
            descriptionLines[0]
              ? `<text x="108" y="${labelLines.length > 1 ? 103 : 78}" fill="#a9b7d8" font-family="Inter, Arial, sans-serif" font-size="20" font-weight="600">${escapeXml(descriptionLines[0])}</text>`
              : ""
          }
          <rect x="768" y="28" width="124" height="58" rx="23" fill="#ffffff" opacity="0.08"/>
          <text x="830" y="66" text-anchor="middle" fill="${accentEnd}" font-family="Inter, Arial, sans-serif" font-size="34" font-weight="950">${percent}%</text>
          <rect x="108" y="${optionHeight - 30}" width="640" height="10" rx="5" fill="#ffffff" opacity="0.08"/>
          <rect x="108" y="${optionHeight - 30}" width="${barWidth}" height="10" rx="5" fill="url(#optionGradient${index})"/>
          <circle cx="${108 + barWidth}" cy="${optionHeight - 25}" r="13" fill="#10152e" stroke="${accentEnd}" stroke-width="7"/>
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
          <stop offset="0%" stop-color="#050812"/>
          <stop offset="48%" stop-color="#0e304c"/>
          <stop offset="100%" stop-color="#146aff"/>
        </linearGradient>
        <linearGradient id="cardGradient" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#171c3a"/>
          <stop offset="58%" stop-color="#10152e"/>
          <stop offset="100%" stop-color="#081326"/>
        </linearGradient>
        <pattern id="dotPattern" width="44" height="44" patternUnits="userSpaceOnUse">
          <circle cx="6" cy="6" r="2.6" fill="#f4f8ff" opacity="0.12"/>
        </pattern>
        <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="30" stdDeviation="38" flood-color="#000000" flood-opacity="0.38"/>
        </filter>
        <filter id="logoShadow" x="-20%" y="-40%" width="140%" height="180%">
          <feDropShadow dx="0" dy="8" stdDeviation="8" flood-color="#000000" flood-opacity="0.18"/>
        </filter>
      </defs>
      <rect width="1200" height="${imageHeight}" fill="url(#bgGradient)"/>
      <rect width="1200" height="${imageHeight}" fill="url(#dotPattern)"/>
      <circle cx="1030" cy="160" r="260" fill="#7c5cff" opacity="0.18"/>
      <circle cx="120" cy="${imageHeight - 140}" r="300" fill="#2da3ff" opacity="0.18"/>
      <path d="M88 416 C230 306 332 420 468 294 S696 198 848 314" fill="none" stroke="#22d3c5" stroke-width="9" stroke-linecap="round" opacity="0.24"/>
      <rect x="74" y="72" width="1052" height="${cardHeight}" rx="54" fill="url(#cardGradient)" stroke="#ffffff" stroke-opacity="0.1" stroke-width="2" filter="url(#softShadow)"/>
      <circle cx="1010" cy="396" r="112" fill="none" stroke="#ffffff" stroke-width="20" opacity="0.08"/>
      <circle cx="928" cy="292" r="10" fill="#22d3c5"/>
      <circle cx="962" cy="334" r="6" fill="#7c5cff"/>
      <circle cx="1028" cy="292" r="7" fill="#2da3ff"/>

      <g transform="translate(118 106)" filter="url(#logoShadow)">
        ${
          logoDataUrl
            ? `<image href="${logoDataUrl}" x="0" y="0" width="520" height="146" preserveAspectRatio="xMinYMid meet"/>`
            : `<rect x="0" y="36" width="520" height="74" rx="22" fill="#d8e7fb" opacity="0.3"/>`
        }
      </g>
      <g transform="translate(794 138)">
        <rect width="278" height="64" rx="32" fill="#22d3c5" opacity="0.1" stroke="#22d3c5" stroke-opacity="0.28"/>
        <circle cx="37" cy="32" r="8" fill="#22d3c5"/>
        <path d="M66 32 H88 L98 18 L108 46 L120 32 H198" fill="none" stroke="#22d3c5" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
        <text x="214" y="40" fill="#22d3c5" font-family="Inter, Arial, sans-serif" font-size="18" font-weight="900" letter-spacing="2">LIVE</text>
      </g>

      <g transform="translate(130 340)">
        <rect x="0" y="-36" width="${Math.max(220, poll.category.length * 17 + 92)}" height="54" rx="27" fill="#ffffff" opacity="0.07"/>
        <text x="34" y="0" fill="#8790b3" font-family="Inter, Arial, sans-serif" font-size="21" font-weight="900" letter-spacing="4">${escapeXml(poll.category.toUpperCase())}</text>
        ${questionLines
          .map(
            (line, index) =>
              `<text x="0" y="${80 + index * 57}" fill="#ffffff" font-family="Inter, Arial, sans-serif" font-size="52" font-weight="850">${escapeXml(line)}</text>`,
          )
          .join("")}
      </g>

      <g filter="url(#softShadow)">
        ${optionsSvg}
      </g>

      <g transform="translate(130 ${footerY})">
        <rect width="940" height="96" rx="30" fill="#ffffff" opacity="0.065" stroke="#ffffff" stroke-opacity="0.09"/>
        <text x="38" y="39" fill="#ffffff" font-family="Inter, Arial, sans-serif" font-size="25" font-weight="850">Join the vote</text>
        <text x="38" y="70" fill="#8790b3" font-family="Inter, Arial, sans-serif" font-size="21" font-weight="700">${escapeXml(shareUrl.replace("https://", ""))}</text>
        <circle cx="878" cy="48" r="31" fill="#146aff"/>
        <path d="M868 38 L884 48 L868 58 M884 48 H850" fill="none" stroke="#ffffff" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>
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
      Icon: FaFacebookF,
      color: "#1877f2",
      action: () =>
        openShareWindow(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
        ),
    },
    {
      label: "Reddit",
      helper: "Submit post",
      Icon: FaRedditAlien,
      color: "#ff4500",
      action: () =>
        openShareWindow(
          `https://www.reddit.com/submit?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(poll.question)}`,
        ),
    },
    {
      label: "WhatsApp",
      helper: "Send message",
      Icon: FaWhatsapp,
      color: "#25d366",
      action: () =>
        openShareWindow(`https://wa.me/?text=${encodeURIComponent(caption)}`),
    },
    {
      label: "X",
      helper: "Post result",
      Icon: FaTwitter,
      color: "#1da1f2",
      action: () =>
        openShareWindow(
          `https://twitter.com/intent/tweet?text=${encodeURIComponent(caption)}`,
        ),
    },
    {
      label: "LinkedIn",
      helper: "Share link",
      Icon: FaLinkedinIn,
      color: "#0a66c2",
      action: () =>
        openShareWindow(
          `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
        ),
    },
    {
      label: "Telegram",
      helper: "Send message",
      Icon: FaTelegramPlane,
      color: "#2aabee",
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
            className="relative grid max-h-[min(900px,92vh)] w-full max-w-5xl overflow-y-auto overflow-x-hidden rounded-[1.5rem] border border-poll-option-border bg-poll-auth-modal-bg text-poll-auth-modal-text shadow-[0_30px_90px_var(--shadow-soft)] md:grid-cols-[0.95fr_1.05fr]"
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            onClick={(event) => event.stopPropagation()}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
          >
            <button
              aria-label="Close share results"
              className="absolute right-4 top-4 z-20 grid size-9 place-items-center rounded-full border border-poll-option-border bg-poll-option-bg text-poll-option-text transition hover:bg-poll-option-bg-hover"
              onClick={onClose}
              type="button"
            >
              x
            </button>

            <div className="min-h-0 p-5 sm:p-6">
              <div className="mb-4">
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
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                <AppButton
                  className="font-black"
                  onClick={shareNative}
                  size="lg"
                  type="button"
                >
                  <FaShareAlt className="size-4" />
                  Share
                </AppButton>
                <AppButton
                  className="font-bold"
                  onClick={downloadImage}
                  variant="secondary"
                  size="lg"
                  type="button"
                >
                  <FaDownload className="size-4" />
                  Download image
                </AppButton>
                <AppButton
                  className="font-bold"
                  onClick={() => void withStatus(() => copyText(shareUrl), "Link copied.")}
                  variant="secondary"
                  size="lg"
                  type="button"
                >
                  <FaCopy className="size-4" />
                  Copy link
                </AppButton>
                <AppButton
                  className="font-bold"
                  onClick={() => void withStatus(() => copyText(caption), "Caption copied.")}
                  variant="secondary"
                  size="lg"
                  type="button"
                >
                  <FaCopy className="size-4" />
                  Copy caption
                </AppButton>
              </div>

              <div className="mt-5">
                <p className="mb-2 text-xs font-black uppercase tracking-[0.16em] text-poll-card-subtle">
                  Platforms
                </p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {platformShares.map((option) => {
                    const Icon = option.Icon;

                    return (
                    <button
                      className="group relative flex items-center gap-3 overflow-hidden rounded-2xl border border-poll-option-border bg-poll-option-bg px-4 py-3 text-left transition hover:border-poll-option-border-hover"
                      key={option.label}
                      onClick={option.action}
                      type="button"
                    >
                      <span
                        aria-hidden="true"
                        className="absolute inset-0 opacity-0 transition group-hover:opacity-15"
                        style={{ backgroundColor: option.color }}
                      />
                      <span
                        className="relative grid size-9 shrink-0 place-items-center rounded-full bg-button-secondary-bg transition group-hover:bg-white"
                        style={{ color: option.color }}
                      >
                        <Icon className="size-4" />
                      </span>
                      <span className="relative min-w-0">
                        <span className="block text-sm font-black text-poll-option-text">
                          {option.label}
                        </span>
                        <span className="mt-0.5 block truncate text-xs text-poll-option-muted">
                          {option.helper}
                        </span>
                      </span>
                    </button>
                  );
                  })}
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
