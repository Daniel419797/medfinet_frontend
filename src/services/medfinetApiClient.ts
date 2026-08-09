import { supabase } from "./supabaseClient";

export type MedfinetRequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  organizationId?: string;
  purpose?: string;
  authenticated?: boolean;
  headers?: Record<string, string>;
};

export class MedfinetApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code: string,
    public readonly requestId?: string,
  ) {
    super(message);
    this.name = "MedfinetApiError";
  }
}

export function isMedfinetConnectivityError(error: unknown) {
  if (error instanceof TypeError) return true;
  if (!(error instanceof Error)) return false;
  return [
    "did not respond in time",
    "failed to fetch",
    "networkerror",
    "load failed",
  ].some((message) => error.message.toLowerCase().includes(message));
}

type ApiEnvelope<T> = {
  success: boolean;
  data: T;
  code?: string;
  message?: string;
};

function apiBaseUrl() {
  const configured = import.meta.env.VITE_MEDFINET_API_URL?.trim();
  if (!configured) {
    throw new Error("VITE_MEDFINET_API_URL is required for Medfinet operations");
  }
  return configured.replace(/\/$/, "");
}

async function sessionAccessToken() {
  const { data, error } = await supabase.auth.getSession();
  if (error) {
    throw new Error(`Unable to restore the secure session: ${error.message}`);
  }
  return data.session?.access_token || null;
}

export async function medfinetRequest<T>(
  path: string,
  options: MedfinetRequestOptions = {},
): Promise<T> {
  const headers = new Headers({ "content-type": "application/json" });

  if (options.authenticated !== false) {
    const token = await sessionAccessToken();
    if (!token) {
      throw new Error("Your secure session has expired. Sign in again.");
    }
    headers.set("authorization", `Bearer ${token}`);
  }

  if (options.organizationId) {
    headers.set("x-organization-id", options.organizationId);
  }
  headers.set("x-access-purpose", options.purpose || "medfinet-operation");
  Object.entries(options.headers || {}).forEach(([name, value]) => {
    headers.set(name, value);
  });

  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 20_000);

  let response: Response;
  try {
    response = await fetch(`${apiBaseUrl()}${path}`, {
      method: options.method || "GET",
      headers,
      signal: controller.signal,
      cache: "no-store",
      ...(options.body === undefined
        ? {}
        : { body: JSON.stringify(options.body) }),
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error("The Medfinet service did not respond in time.");
    }
    throw error;
  } finally {
    window.clearTimeout(timeout);
  }

  const payload = (await response.json().catch(() => ({
    success: false,
    code: "INVALID_API_RESPONSE",
    message: "The server returned an unreadable response",
  }))) as ApiEnvelope<T>;

  if (!response.ok || !payload.success) {
    if (response.status === 401) {
      await supabase.auth.signOut().catch(() => undefined);
    }
    throw new MedfinetApiError(
      payload.message || payload.code || "Medfinet operation failed",
      response.status,
      payload.code || "MEDFINET_REQUEST_FAILED",
      response.headers.get("x-request-id") || undefined,
    );
  }

  return payload.data;
}
