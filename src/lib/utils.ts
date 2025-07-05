import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function handleError(error: unknown): { success: false; errorMessage: string } {
  const message =
    error instanceof Error
      ? error.message
      : typeof error === "string"
      ? error
      : "Terjadi kesalahan yang tidak diketahui";

  return {
    success: false,
    errorMessage: message,
  };
}