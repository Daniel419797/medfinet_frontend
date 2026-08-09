import { webcrypto } from "node:crypto";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { NfcScanResult } from "./medfinetNfcApi";
import {
  cacheOfflineNfcSnapshot,
  resolveOfflineNfcSnapshot,
} from "./nfcOfflineStore";

const secureStore = vi.hoisted(() => {
  const values = new Map<string, unknown>();
  return {
    values,
    readEncryptedValue: vi.fn(async (name: string) => values.get(name) ?? null),
    writeEncryptedValue: vi.fn(async (name: string, value: unknown) => {
      values.set(name, structuredClone(value));
    }),
    removeEncryptedValue: vi.fn(async (name: string) => {
      values.delete(name);
    }),
  };
});

vi.mock("./secureOfflineStore", () => secureStore);

const result: NfcScanResult = {
  assurance: "REGISTERED_DEVICE",
  child: {
    id: "child-1",
    medfinetId: "MED-001",
    firstName: "Synthetic",
    lastName: "Child",
  },
  limitations: [],
  clinicalSummary: {
    clinicalAccess: "ALLOWED",
    allergies: [],
    vaccination: {
      dueCount: 0,
      overdueCount: 0,
      recordedDoses: 1,
      recommendations: [],
    },
    consent: { status: "GRANTED", expiresAt: null },
  },
  actions: { emergencyAccess: "/emergency" },
};

const baseInput = {
  organizationId: "org-1",
  subjectId: "worker-1",
  deviceId: "device-1",
  card: {
    publicId: "abcdefghijklmnopqrstuvwx",
    cardToken: "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQ",
    uc: "04112233445566x000001",
  },
};

describe("offline NFC snapshots", () => {
  beforeEach(() => {
    Object.defineProperty(globalThis, "crypto", {
      configurable: true,
      value: webcrypto,
    });
    secureStore.values.clear();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-08-09T12:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("resolves a recently verified card only when its NTAG counter advances", async () => {
    await cacheOfflineNfcSnapshot({ ...baseInput, result });

    const snapshot = await resolveOfflineNfcSnapshot({
      ...baseInput,
      card: { ...baseInput.card, uc: "04112233445566x000002" },
    });

    expect(snapshot.result.child.id).toBe("child-1");
    expect(snapshot.lastCounter).toBe(2);
    await expect(
      resolveOfflineNfcSnapshot({
        ...baseInput,
        card: { ...baseInput.card, uc: "04112233445566x000002" },
      }),
    ).rejects.toThrow("not newer");
  });

  it("rejects a copied token and an expired snapshot", async () => {
    await cacheOfflineNfcSnapshot({ ...baseInput, result });

    await expect(
      resolveOfflineNfcSnapshot({
        ...baseInput,
        card: { ...baseInput.card, cardToken: "different-token" },
      }),
    ).rejects.toThrow("does not match");

    vi.setSystemTime(new Date("2026-08-10T01:00:01Z"));
    await expect(
      resolveOfflineNfcSnapshot({
        ...baseInput,
        card: { ...baseInput.card, uc: "04112233445566x000002" },
      }),
    ).rejects.toThrow("expired");
    expect(secureStore.removeEncryptedValue).toHaveBeenCalled();
  });
});
