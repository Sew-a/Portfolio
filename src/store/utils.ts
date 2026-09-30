import type { SetStateAction } from "react";

/** Resolves a React-style `SetStateAction` so store setters keep the `setX(prev => ...)` API. */
export function resolveUpdate<T>(value: SetStateAction<T>, prev: T): T {
  return typeof value === "function" ? (value as (prev: T) => T)(prev) : value;
}
