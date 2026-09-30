import React from 'react';
import { ExternalLink } from 'lucide-react';

/**
 * Telegram Instant View Utility & Helper
 * Conforms to Telegram Instant View specifications: https://instantview.telegram.org/
 * 
 * Telegram Instant View allows users to read articles from around the web
 * in a consistent, distraction-free format with zero loading time.
 */

export const TELEGRAM_IV_DOCS_URL = 'https://instantview.telegram.org/';

export interface TelegramShareOptions {
  url?: string | null;
  title?: string;
  excerpt?: string;
  source?: string;
  date?: string;
  time?: string;
  rhash?: string;
}

/**
 * Checks if a given string is a valid HTTP/HTTPS URL
 */
export function isValidUrl(url?: string | null): boolean {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) return false;
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Generates the Instant View URL wrapper if an rhash is provided or configured,
 * otherwise returns the clean canonical article URL for Telegram's bot to match with its template registry.
 */
export function getInstantViewUrl(articleUrl: string, customRhash?: string): string {
  if (!isValidUrl(articleUrl)) return articleUrl;
  const rhash = customRhash || process.env.NEXT_PUBLIC_TELEGRAM_IV_RHASH;
  if (rhash) {
    return `https://t.me/iv?url=${encodeURIComponent(articleUrl)}&rhash=${rhash}`;
  }
  return articleUrl;
}

/**
 * Builds the Telegram Share URL according to Telegram Instant View standards.
 * Formats the text and passes the URL parameter so Telegram can generate the Instant View preview.
 */
export function buildTelegramShareUrl(options: TelegramShareOptions): string {
  const { url, title = '', excerpt = '', source = '', date = '', time = '', rhash } = options;
  const hasUrl = isValidUrl(url);

  let targetShareUrl = '';
  if (hasUrl && url) {
    targetShareUrl = getInstantViewUrl(url, rhash);
  }

  const textLines: string[] = [];
  if (title) {
    textLines.push(`📰 *${title.trim()}*`);
  }
  if (excerpt) {
    textLines.push('', excerpt.trim());
  }
  
  const metaParts: string[] = [];
  if (source) metaParts.push(`📌 *Fuente:* ${source.trim()}`);
  if (date || time) {
    const timeStr = [date, time].filter(Boolean).join(' · ');
    metaParts.push(`🕒 *Fecha:* ${timeStr}`);
  }
  if (metaParts.length > 0) {
    textLines.push('', metaParts.join('\n'));
  }

  if (hasUrl && url) {
    textLines.push('', `⚡ *Vista Rápida (Instant View):*`, `🔗 ${url.trim()}`);
  }

  const messageText = textLines.join('\n');

  if (targetShareUrl) {
    return `https://t.me/share/url?url=${encodeURIComponent(targetShareUrl)}&text=${encodeURIComponent(messageText)}`;
  } else {
    // If no valid URL, share as text only
    return `https://t.me/share/url?url=&text=${encodeURIComponent(messageText)}`;
  }
}

/**
 * Opens the Telegram share dialog in a new secure window
 */
export function shareToTelegram(options: TelegramShareOptions): void {
  const shareUrl = buildTelegramShareUrl(options);
  if (typeof window !== 'undefined') {
    window.open(shareUrl, '_blank', 'noopener,noreferrer');
  }
}

/**
 * Explainer badge for Instant View linking directly to https://instantview.telegram.org/
 */
export function InstantViewExplainerBadge({ 
  className = '',
  compact = false 
}: { 
  className?: string;
  compact?: boolean;
}) {
  return (
    <a
      href={TELEGRAM_IV_DOCS_URL}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => e.stopPropagation()}
      className={`inline-flex items-center gap-1.5 font-semibold text-sky-400 hover:text-sky-300 transition-all bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/25 rounded-lg ${
        compact ? 'text-[10px] px-2 py-0.5' : 'text-xs px-3 py-1.5'
      } ${className}`}
      title="Instant Views Explained: abre las noticias al instante en Telegram con cero tiempos de carga (instantview.telegram.org)"
    >
      <span className="text-amber-400 font-bold">⚡</span>
      <span>Instant Views Explained</span>
      <ExternalLink className={compact ? 'w-2.5 h-2.5 opacity-70' : 'w-3 h-3 opacity-70'} />
    </a>
  );
}
