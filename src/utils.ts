import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { getCookie, deleteCookie } from "cookies-next";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getAuthToken = (): string | null => {
  const token = getCookie("token") as unknown;

  if (typeof token === "string") {
    return token;
  }

  if (token && typeof token === "object") {
    const stringValue = Object.values(token).find(
      (value) => typeof value === "string"
    );
    if (stringValue) {
      return stringValue;
    }
  }

  return null;
};

export const deleteAuthToken = (): void => {
  deleteCookie("token");
};
