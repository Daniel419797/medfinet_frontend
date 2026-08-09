import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MedfinetApiError, medfinetRequest } from "./medfinetApiClient";

const auth = vi.hoisted(() => ({
  getSession: vi.fn(),
  signOut: vi.fn(),
}));

vi.mock("./supabaseClient", () => ({ supabase: { auth } }));

describe("medfinetRequest", () => {
  beforeEach(() => {
    vi.stubEnv("VITE_MEDFINET_API_URL", "https://api.example.test/api/v1/");
    auth.getSession.mockResolvedValue({
      data: { session: { access_token: "session-token" } },
      error: null,
    });
    auth.signOut.mockResolvedValue({ error: null });
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("sends the verified session, tenant, purpose, and JSON body", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          success: true,
          data: { id: "record-1" },
        }),
        { status: 200, headers: { "content-type": "application/json" } },
      ),
    );
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      medfinetRequest<{ id: string }>("/records", {
        method: "POST",
        organizationId: "org-1",
        purpose: "clinical-recording",
        body: { value: 1 },
      }),
    ).resolves.toEqual({ id: "record-1" });

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    const headers = init.headers as Headers;
    expect(url).toBe("https://api.example.test/api/v1/records");
    expect(headers.get("authorization")).toBe("Bearer session-token");
    expect(headers.get("x-organization-id")).toBe("org-1");
    expect(headers.get("x-access-purpose")).toBe("clinical-recording");
    expect(init.cache).toBe("no-store");
    expect(init.body).toBe('{"value":1}');
  });

  it("fails closed before making a request when the session is absent", async () => {
    auth.getSession.mockResolvedValue({
      data: { session: null },
      error: null,
    });
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    await expect(medfinetRequest("/records")).rejects.toThrow(
      "session has expired",
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("signs out on an unauthorized API response and preserves the request id", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            success: false,
            code: "TOKEN_EXPIRED",
            message: "Token expired",
          }),
          { status: 401, headers: { "x-request-id": "request-123" } },
        ),
      ),
    );

    const error = await medfinetRequest("/records").catch((reason) => reason);
    expect(error).toBeInstanceOf(MedfinetApiError);
    expect(error).toMatchObject({
      status: 401,
      code: "TOKEN_EXPIRED",
      requestId: "request-123",
    });
    expect(auth.signOut).toHaveBeenCalledTimes(1);
  });
});
