import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { InstallMedfinetButton } from "./InstallMedfinetButton";

describe("InstallMedfinetButton", () => {
  beforeEach(() => {
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      value: vi.fn().mockReturnValue({ matches: false }),
    });
  });

  afterEach(cleanup);

  it("uses the captured browser installation prompt", async () => {
    const prompt = vi.fn().mockResolvedValue(undefined);
    const event = Object.assign(new Event("beforeinstallprompt"), {
      prompt,
      userChoice: Promise.resolve({ outcome: "accepted" as const }),
    });
    render(<InstallMedfinetButton />);
    act(() => window.dispatchEvent(event));

    fireEvent.click(screen.getByRole("button", { name: "Install Medfinet" }));

    await waitFor(() => expect(prompt).toHaveBeenCalledTimes(1));
  });

  it("shows platform instructions when no native prompt is available", () => {
    render(<InstallMedfinetButton />);
    fireEvent.click(screen.getByRole("button", { name: "Install Medfinet" }));

    expect(
      screen.getByRole("dialog", { name: "Install Medfinet" }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Android Chrome:/)).toBeInTheDocument();
  });
});
