
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Validates a Telegram bot token format
 * Standard format is: 123456789:ABCDefGhIJKlmNoPQRsTUVwxyZ
 */
export function validateBotToken(token: string): string | null {
  // Basic validation - should have numbers, colon, and characters
  if (!token || token.trim() === "") {
    return "Please enter a bot token";
  }

  // Check for basic token format (numbers:letters)
  const tokenRegex = /^\d+:[A-Za-z0-9_-]+$/;
  if (!tokenRegex.test(token)) {
    return "Invalid token format. Expected format: 123456789:ABCDefGhIJKlmNoPQRsTUVwxyZ";
  }

  return null;
}

/**
 * Format Unix timestamp to a human-readable date
 */
export function formatDate(unixTimestamp: number): string {
  try {
    const date = new Date(unixTimestamp * 1000);
    
    // Format: YYYY-MM-DD HH:MM:SS
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }).format(date);
  } catch (error) {
    return "Invalid date";
  }
}
