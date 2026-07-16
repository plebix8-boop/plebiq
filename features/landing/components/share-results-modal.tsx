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
import { LuX } from "react-icons/lu";
import type { FeaturedPoll } from "../data";
import { AppButton } from "@/components/ui/button";
import { useTheme } from "@/contexts/theme-context";

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
const SHARE_FOOTER_HEIGHT = 132;
const SHARE_FOOTER_BOTTOM_PADDING = 80;
const SHARE_IMAGE_BOTTOM_MARGIN = 52;
const CATEGORY_PILL_MARGIN_BOTTOM = 15;
const OPTIONS_MARGIN_TOP = 10;
const PROGRESS_BAR_MARGIN_BOTTOM = 10;
const SUPPORTING_TEXT_TO_PROGRESS_GAP = 6;
const QUESTION_FIRST_LINE_Y = 435;
const QUESTION_LINE_HEIGHT = 57;
const QUESTION_TO_OPTIONS_GAP = 54;
const DEFAULT_OPTIONS_START_Y = 570;

type ShareImageTheme = "light" | "dark";

const SHARE_IMAGE_PALETTES = {
  dark: {
    accent: "#2563eb",
    accentAlt: "#2da3ff",
    accentSoft: "#173d70",
    backgroundEnd: "#146aff",
    backgroundMiddle: "#0e304c",
    backgroundStart: "#050812",
    cardEnd: "#081326",
    cardMiddle: "#10152e",
    cardStart: "#171c3a",
    footerBackground: "#102a47",
    footerBorder: "#31516c",
    footerButton: "#f4f8ff",
    footerButtonText: "#0e304c",
    foreground: "#ffffff",
    muted: "#8790b3",
    optionBackground: "#122b49",
    optionBorder: "#31516c",
    optionSupportingText: "#a9c7e3",
    optionShadow: "#071a2e",
    progressTrack: "#234564",
    shadow: "#000000",
    stroke: "#ffffff",
  },
  light: {
    accent: "#2563eb",
    accentAlt: "#2da3ff",
    accentSoft: "#dbeafe",
    backgroundEnd: "#60a5fa",
    backgroundMiddle: "#bfdbfe",
    backgroundStart: "#eff6ff",
    cardEnd: "#dbeafe",
    cardMiddle: "#f8fbff",
    cardStart: "#ffffff",
    footerBackground: "#ffffff",
    footerBorder: "#cbd5e1",
    footerButton: "#2563eb",
    footerButtonText: "#f4f8ff",
    foreground: "#0f172a",
    muted: "#475569",
    optionBackground: "#eff6ff",
    optionBorder: "#cbd5e1",
    optionSupportingText: "#52708e",
    optionShadow: "#bfdbfe",
    progressTrack: "#d7e3ef",
    shadow: "#1e3a8a",
    stroke: "#93c5fd",
  },
} as const;

const logoDataUrlPromises = new Map<ShareImageTheme, Promise<string>>();

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

function loadLogoDataUrl(theme: ShareImageTheme) {
  let logoDataUrlPromise = logoDataUrlPromises.get(theme);

  if (!logoDataUrlPromise) {
    logoDataUrlPromise = fetch(theme === "dark" ? "/logo-dark.png" : "/logo.png")
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
    logoDataUrlPromises.set(theme, logoDataUrlPromise);
  }

  return logoDataUrlPromise;
}

function buildShareImage(
  poll: FeaturedPoll,
  percentages: string[],
  shareUrl: string,
  theme: ShareImageTheme,
  logoDataUrl?: string | null,
) {
  const palette = SHARE_IMAGE_PALETTES[theme];
  const results = poll.options
    .map((option, index) => ({
      option,
      originalIndex: index,
      percent: parsePercent(percentages[index] ?? option.previewWidth),
    }))
    .sort((a, b) => b.percent - a.percent);
  const questionLines = wrapText(poll.question, 27).slice(0, 4);
  const optionCount = results.length;
  const optionGap = 12 + PROGRESS_BAR_MARGIN_BOTTOM;
  const optionHeight = optionCount > 6 ? 104 : 114;
  const questionLastLineY =
    QUESTION_FIRST_LINE_Y + Math.max(0, questionLines.length - 1) * QUESTION_LINE_HEIGHT;
  const startY =
    Math.max(DEFAULT_OPTIONS_START_Y, questionLastLineY + QUESTION_TO_OPTIONS_GAP) +
    OPTIONS_MARGIN_TOP;
  const contentHeight = startY + optionCount * (optionHeight + optionGap);
  const footerY = Math.max(1290, contentHeight + 40);
  const cardHeight = footerY + SHARE_FOOTER_HEIGHT + SHARE_FOOTER_BOTTOM_PADDING - 72;
  const imageHeight = Math.max(MIN_IMAGE_HEIGHT, 72 + cardHeight + SHARE_IMAGE_BOTTOM_MARGIN);
  const optionsPanelHeight = optionCount * optionHeight + Math.max(0, optionCount - 1) * optionGap + 28;
  const optionsSvg = results
    .map(({ option, percent }, index) => {
      const y = startY + index * (optionHeight + optionGap);
      const barWidth = Math.max(12, Math.round((percent / 100) * 744));
      const labelLines = wrapText(option.label, 39).slice(0, 1);
      const descriptionLines = wrapText(option.description, 56).slice(0, 1);
      const rank = String(index + 1).padStart(2, "0");

      return `
        <g transform="translate(130 ${y})">
          ${index > 0 ? `<line x1="22" y1="-7" x2="918" y2="-7" stroke="${palette.optionBorder}" stroke-width="2"/>` : ""}
          <rect x="22" y="17" width="5" height="40" rx="2.5" fill="url(#optionGradient${index})"/>
          <text x="48" y="43" fill="${palette.muted}" font-family="Inter, Arial, sans-serif" font-size="16" font-weight="700" letter-spacing="1.5">${rank}</text>
          ${labelLines
          .map(
            (line, lineIndex) =>
              `<text x="92" y="${37 + lineIndex * 27}" fill="${palette.foreground}" font-family="Inter, Arial, sans-serif" font-size="28" font-weight="700">${escapeXml(line)}</text>`,
          )
          .join("")}
          ${descriptionLines[0]
          ? `<text x="92" y="70" fill="${palette.optionSupportingText}" font-family="Inter, Arial, sans-serif" font-size="19" font-weight="600">${escapeXml(descriptionLines[0])}</text>`
          : ""
        }
          <text x="900" y="31" text-anchor="end" fill="${palette.muted}" font-family="Inter, Arial, sans-serif" font-size="13" font-weight="700" letter-spacing="1.2">RESULTS</text>
          <text x="900" y="62" text-anchor="end" fill="${palette.accent}" font-family="Inter, Arial, sans-serif" font-size="32" font-weight="700">${percent}%</text>
          <rect x="92" y="${optionHeight - 18 + SUPPORTING_TEXT_TO_PROGRESS_GAP}" width="744" height="12" rx="6" fill="${palette.progressTrack}"/>
          <rect x="92" y="${optionHeight - 18 + SUPPORTING_TEXT_TO_PROGRESS_GAP}" width="${barWidth}" height="12" rx="6" fill="url(#optionGradient${index})"/>
          <defs>
            <linearGradient id="optionGradient${index}" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stop-color="${palette.accent}"/>
              <stop offset="100%" stop-color="${palette.accentAlt}"/>
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
          <stop offset="0%" stop-color="${palette.backgroundStart}"/>
          <stop offset="48%" stop-color="${palette.backgroundMiddle}"/>
          <stop offset="100%" stop-color="${palette.backgroundEnd}"/>
        </linearGradient>
        <linearGradient id="cardGradient" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${palette.cardStart}"/>
          <stop offset="58%" stop-color="${palette.cardMiddle}"/>
          <stop offset="100%" stop-color="${palette.cardEnd}"/>
        </linearGradient>
        <pattern id="dotPattern" width="44" height="44" patternUnits="userSpaceOnUse">
          <circle cx="6" cy="6" r="2.6" fill="${palette.foreground}" opacity="0.12"/>
        </pattern>
        <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="30" stdDeviation="38" flood-color="${palette.shadow}" flood-opacity="0.26"/>
        </filter>
        <filter id="logoShadow" x="-20%" y="-40%" width="140%" height="180%">
          <feDropShadow dx="0" dy="8" stdDeviation="8" flood-color="${palette.shadow}" flood-opacity="0.18"/>
        </filter>
      </defs>
      <rect width="1200" height="${imageHeight}" fill="url(#bgGradient)"/>
      <rect width="1200" height="${imageHeight}" fill="url(#dotPattern)"/>
      <circle cx="1030" cy="160" r="260" fill="#7c5cff" opacity="0.18"/>
      <circle cx="120" cy="${imageHeight - 140}" r="300" fill="#2da3ff" opacity="0.18"/>
      <path d="M88 416 C230 306 332 420 468 294 S696 198 848 314" fill="none" stroke="#22d3c5" stroke-width="9" stroke-linecap="round" opacity="0.24"/>
      <rect x="74" y="72" width="1052" height="${cardHeight}" rx="54" fill="url(#cardGradient)" stroke="${palette.stroke}" stroke-opacity="0.55" stroke-width="2" filter="url(#softShadow)"/>
      <circle cx="1010" cy="396" r="112" fill="none" stroke="${palette.foreground}" stroke-width="20" opacity="0.08"/>
      <circle cx="928" cy="292" r="10" fill="#22d3c5"/>
      <circle cx="962" cy="334" r="6" fill="#7c5cff"/>
      <circle cx="1028" cy="292" r="7" fill="#2da3ff"/>

      <g transform="translate(118 106)" filter="url(#logoShadow)">
        ${logoDataUrl
      ? `<image href="${logoDataUrl}" x="0" y="0" width="520" height="146" preserveAspectRatio="xMinYMid meet"/>`
      : `<rect x="0" y="36" width="520" height="74" rx="22" fill="#d8e7fb" opacity="0.3"/>`
    }
      </g>
      <g transform="translate(794 138)">
        <rect width="278" height="64" rx="32" fill="#22d3c5" opacity="0.1" stroke="#22d3c5" stroke-opacity="0.28"/>
        <circle cx="37" cy="32" r="8" fill="#22d3c5"/>
        <path d="M66 32 H88 L98 18 L108 46 L120 32 H198" fill="none" stroke="#22d3c5" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
        <text x="214" y="40" fill="#22d3c5" font-family="Inter, Arial, sans-serif" font-size="18" font-weight="700" letter-spacing="2">LIVE</text>
      </g>

      <g transform="translate(130 340)">
        <rect x="0" y="-36" width="${Math.max(220, poll.category.length * 17 + 92)}" height="54" rx="27" fill="${palette.progressTrack}" opacity="0.45"/>
        <text x="34" y="0" fill="${palette.muted}" font-family="Inter, Arial, sans-serif" font-size="21" font-weight="700" letter-spacing="4">${escapeXml(poll.category.toUpperCase())}</text>
        ${questionLines
      .map(
        (line, index) =>
          `<text x="0" y="${80 + CATEGORY_PILL_MARGIN_BOTTOM + index * 57}" fill="${palette.foreground}" font-family="Inter, Arial, sans-serif" font-size="52" font-weight="700">${escapeXml(line)}</text>`,
      )
      .join("")}
      </g>

      <g filter="url(#softShadow)">
        <rect x="112" y="${startY - 14}" width="976" height="${optionsPanelHeight}" rx="34" fill="${palette.optionBackground}" stroke="${palette.optionBorder}" stroke-width="2"/>
        ${optionsSvg}
      </g>

      <g transform="translate(130 ${footerY})">
        <rect width="940" height="${SHARE_FOOTER_HEIGHT}" rx="30" fill="${palette.footerBackground}" stroke="${palette.footerBorder}" stroke-width="2"/>
        <circle cx="54" cy="66" r="22" fill="${palette.accentSoft}"/>
        <path d="M44 66 H65 M58 57 L67 66 L58 75" fill="none" stroke="${palette.accent}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
        <text x="94" y="55" fill="${palette.foreground}" font-family="Inter, Arial, sans-serif" font-size="25" font-weight="700">Make your voice count</text>
        <text x="94" y="86" fill="${palette.muted}" font-family="Inter, Arial, sans-serif" font-size="20" font-weight="650">${escapeXml(shareUrl.replace("https://", ""))}</text>
        <rect x="684" y="35" width="214" height="62" rx="22" fill="${palette.footerButton}"/>
        <text x="764" y="74" text-anchor="middle" fill="${palette.footerButtonText}" font-family="Inter, Arial, sans-serif" font-size="20" font-weight="700">Vote now</text>
        <path d="M842 66 H868 M858 56 L868 66 L858 76" fill="none" stroke="${palette.footerButtonText}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
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
  const { effectiveTheme } = useTheme();
  const [isMounted, setIsMounted] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [logoDataUrl, setLogoDataUrl] = useState<string | null>(null);
  const shareUrl = useMemo(() => buildShareUrl(poll.id), [poll.id]);
  const caption = useMemo(() => buildCaption(poll, shareUrl), [poll, shareUrl]);
  const shareImage = useMemo(
    () => buildShareImage(poll, percentages, shareUrl, effectiveTheme, logoDataUrl),
    [poll, percentages, shareUrl, effectiveTheme, logoDataUrl],
  );
  const previewUrl = useMemo(() => svgToPreviewUrl(shareImage.svg), [shareImage.svg]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    let alive = true;

    void loadLogoDataUrl(effectiveTheme)
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
  }, [effectiveTheme]);

  useEffect(() => {
    if (!isOpen) {
      setStatus(null);
      return undefined;
    }

    if (!status) {
      return undefined;
    }

    const timeout = window.setTimeout(() => setStatus(null), 5000);
    return () => window.clearTimeout(timeout);
  }, [isOpen, status]);

  async function createShareImage() {
    const logo = logoDataUrl ?? (await loadLogoDataUrl(effectiveTheme));
    return buildShareImage(poll, percentages, shareUrl, effectiveTheme, logo);
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

  if (!isMounted || typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-[80] flex items-start justify-center overflow-y-auto bg-black/50 p-3 py-4 backdrop-blur-xl sm:items-center sm:p-4"
          exit={{ opacity: 0 }}
          initial={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="relative grid max-h-[calc(100dvh-2rem)] w-full max-w-5xl overflow-y-auto overflow-x-hidden rounded-[1.25rem] border border-poll-option-border bg-poll-auth-modal-bg text-poll-auth-modal-text shadow-[0_30px_90px_var(--shadow-soft)] sm:max-h-[min(900px,92vh)] sm:rounded-[1.5rem] md:grid-cols-[0.95fr_1.05fr]"
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
              <LuX aria-hidden="true" className="size-4" />
            </button>

            <div className="min-h-0 p-4 pb-10 sm:p-6 sm:pb-14">
              <div className="mb-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-poll-card-subtle">
                    Share results
                  </p>
                  <h3 className="mt-2 text-2xl font-bold leading-tight text-poll-auth-modal-text">
                    Share this poll with the world
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-poll-auth-modal-muted">
                    The image includes branding, percentages, every option, and the poll link.
                  </p>
                </div>
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                <AppButton
                  className="font-bold"
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
                <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-poll-card-subtle">
                  Platforms
                </p>
                <div className="grid grid-cols-2 gap-2">
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
                          <span className="block text-sm font-bold text-poll-option-text">
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
                <p className="text-sm font-bold text-poll-option-text">Instagram</p>
                <p className="mt-1 text-xs leading-5 text-poll-option-muted">
                  Instagram does not support direct web sharing. Download the image and copy the caption.
                </p>
              </div>

              {status && (
                <p className="mt-2 mb-4 rounded-2xl border border-poll-option-border bg-poll-option-bg px-4 py-4 text-sm font-semibold text-poll-option-text sm:mb-2">
                  {status}
                </p>
              )}

              <div className="h-2" />

            </div>

            <div className="min-h-0 bg-poll-option-bg p-3 sm:p-6">
              <div className="mx-auto max-w-sm overflow-hidden rounded-[1.1rem] border border-poll-option-border bg-poll-card-bg shadow-[0_18px_50px_var(--shadow-soft)] sm:rounded-[1.3rem]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  alt="Generated Plebiq poll result share image preview"
                  className="max-h-[42svh] w-full object-contain md:max-h-full"
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
