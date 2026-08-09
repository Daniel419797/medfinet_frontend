import { afterEach, describe, expect, it, vi } from "vitest";
import {
  OFFLINE_QUEUE_CHANGED_EVENT,
  OFFLINE_SYNC_REQUEST_EVENT,
  requestBackgroundSync,
} from "./pwaBackgroundSync";

describe("requestBackgroundSync", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("notifies the active app immediately when an online queue changes", async () => {
    Object.defineProperty(navigator, "onLine", {
      configurable: true,
      value: true,
    });
    const changed = vi.fn();
    const syncRequested = vi.fn();
    window.addEventListener(OFFLINE_QUEUE_CHANGED_EVENT, changed, {
      once: true,
    });
    window.addEventListener(OFFLINE_SYNC_REQUEST_EVENT, syncRequested, {
      once: true,
    });

    await requestBackgroundSync();

    expect(changed).toHaveBeenCalledTimes(1);
    expect(syncRequested).toHaveBeenCalledTimes(1);
  });
});
