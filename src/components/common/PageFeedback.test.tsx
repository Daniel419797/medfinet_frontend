import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { PageFeedback } from "./PageFeedback";

describe("PageFeedback", () => {
  it("announces loading without exposing stale page content", () => {
    render(
      <PageFeedback loading>
        <p>Private records</p>
      </PageFeedback>,
    );
    expect(screen.getByRole("status")).toHaveTextContent("Loading...");
    expect(screen.queryByText("Private records")).not.toBeInTheDocument();
  });

  it("announces an error and invokes retry", () => {
    const retry = vi.fn();
    render(
      <PageFeedback loading={false} error="Network unavailable" onRetry={retry}>
        <p>Records</p>
      </PageFeedback>,
    );
    expect(screen.getByRole("alert")).toHaveTextContent("Network unavailable");
    fireEvent.click(screen.getByRole("button", { name: "Retry" }));
    expect(retry).toHaveBeenCalledOnce();
  });

  it("renders a useful empty state", () => {
    render(
      <PageFeedback
        loading={false}
        empty
        emptyTitle="No appointments"
        emptyDescription="Scheduled visits will appear here."
      >
        <p>Appointments</p>
      </PageFeedback>,
    );
    expect(screen.getByText("No appointments")).toBeInTheDocument();
    expect(
      screen.getByText("Scheduled visits will appear here."),
    ).toBeInTheDocument();
  });

  it("renders page content only in the successful state", () => {
    render(
      <PageFeedback loading={false}>
        <p>Live records</p>
      </PageFeedback>,
    );
    expect(screen.getByText("Live records")).toBeInTheDocument();
  });
});
