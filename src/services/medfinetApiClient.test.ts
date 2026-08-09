import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  MedfinetApiError,
  medfinetDownload,
  medfinetRequest,
} from "./medfinetApiClient";

const storage = new Map<string, string>();
const storageMock = {
  getItem: vi.fn((key: string) => storage.get(key) ?? null),
  setItem: vi.fn((key: string, value: string) => {
    storage.set(key, value);
  }),
  removeItem: vi.fn((key: string) => {
    storage.delete(key);
  }),
  clear: vi.fn(() => {
    storage.clear();
  }),
};

describe("medfinetRequest", () => {
  beforeEach(() => {
    vi.stubEnv("VITE_MEDFINET_API_URL", "https://api.example.test/api/v1/");
    vi.stubGlobal("localStorage", storageMock);
    vi.stubGlobal("window", { ...window, localStorage: storageMock });
    storageMock.setItem("medfinet_auth_token", "session-token");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    storage.clear();
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
    localStorage.removeItem("medfinet_auth_token");
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
    expect(localStorage.getItem("medfinet_auth_token")).toBeNull();
  });

  it("downloads a private certificate with the authenticated tenant context", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(new Blob(["png-data"], { type: "image/png" }), {
        status: 200,
        headers: {
          "content-disposition": 'attachment; filename="child-certificate.png"',
          "content-type": "image/png",
        },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const result = await medfinetDownload("/certificate", {
      organizationId: "org-1",
      purpose: "vaccination-certificate-download",
    });

    expect(result.filename).toBe("child-certificate.png");
    expect(result.blob.type).toBe("image/png");
    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    const headers = init.headers as Headers;
    expect(headers.get("authorization")).toBe("Bearer session-token");
    expect(headers.get("x-organization-id")).toBe("org-1");
    expect(headers.get("x-access-purpose")).toBe(
      "vaccination-certificate-download",
    );
    expect(headers.has("content-type")).toBe(false);
  });
});
