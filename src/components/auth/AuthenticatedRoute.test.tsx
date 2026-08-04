import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import UserContext from "../../contexts/UserContext";
import type { OrganizationMembership } from "../../services/medfinetSessionApi";
import { AuthenticatedRoute } from "./AuthenticatedRoute";

afterEach(cleanup);

const organization = {
  id: "org-1",
  name: "Central Clinic",
  slug: "central-clinic",
  status: "ACTIVE" as const,
};

function membership(
  role: OrganizationMembership["role"],
): OrganizationMembership {
  return {
    id: "membership-1",
    role,
    status: "ACTIVE",
    scopeMode: "GLOBAL",
    organization,
  };
}

function renderGuard({
  user = {
    id: "user-1",
    name: "Ada",
    email: "ada@example.test",
    role: "ADMIN",
  },
  currentMembership = membership("ADMIN"),
  sessionReady = true,
  sessionError = null as string | null,
  roles,
  allowWithoutMembership = false,
}: {
  user?: { id: string; name: string; email: string; role: string } | null;
  currentMembership?: OrganizationMembership | null;
  sessionReady?: boolean;
  sessionError?: string | null;
  roles?: OrganizationMembership["role"][];
  allowWithoutMembership?: boolean;
} = {}) {
  return render(
    <UserContext.Provider
      value={{
        user,
        organizationId: currentMembership?.organization.id || null,
        memberships: currentMembership ? [currentMembership] : [],
        currentMembership,
        sessionReady,
        sessionError,
        logout: vi.fn(),
        setOrganizationId: vi.fn(),
        refreshSession: vi.fn(),
      }}
    >
      <MemoryRouter initialEntries={["/admin/users"]}>
        <Routes>
          <Route
            path="/admin/users"
            element={
              <AuthenticatedRoute
                roles={roles}
                allowWithoutMembership={allowWithoutMembership}
              >
                <h1>Protected workspace</h1>
              </AuthenticatedRoute>
            }
          />
          <Route path="/login" element={<h1>Sign in</h1>} />
          <Route path="/onboarding" element={<h1>Onboarding</h1>} />
          <Route path="/dashboard" element={<h1>Caregiver home</h1>} />
        </Routes>
      </MemoryRouter>
    </UserContext.Provider>,
  );
}

describe("AuthenticatedRoute", () => {
  it("shows a stable restoration state before authorization is known", () => {
    renderGuard({ sessionReady: false });
    expect(screen.getByText("Restoring your secure session...")).toHaveAttribute(
      "class",
      expect.stringContaining("min-h-screen"),
    );
  });

  it("redirects a signed-out visitor to sign in", () => {
    renderGuard({ user: null });
    expect(
      screen.getByRole("heading", { name: "Sign in" }),
    ).toBeInTheDocument();
  });

  it("redirects a user without membership to onboarding", () => {
    renderGuard({ currentMembership: null });
    expect(
      screen.getByRole("heading", { name: "Onboarding" }),
    ).toBeInTheDocument();
  });

  it("renders membership onboarding without redirecting to itself", () => {
    renderGuard({
      currentMembership: null,
      allowWithoutMembership: true,
    });
    expect(
      screen.getByRole("heading", { name: "Protected workspace" }),
    ).toBeInTheDocument();
  });

  it("redirects an unauthorized caregiver to the caregiver workspace", () => {
    renderGuard({
      currentMembership: membership("CAREGIVER"),
      roles: ["ADMIN"],
    });
    expect(
      screen.getByRole("heading", { name: "Caregiver home" }),
    ).toBeInTheDocument();
  });

  it("fails visibly when session restoration failed", () => {
    renderGuard({ sessionError: "Identity provider unavailable" });
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Identity provider unavailable",
    );
  });

  it("renders the protected page for an allowed role", () => {
    renderGuard({ roles: ["ADMIN"] });
    expect(
      screen.getByRole("heading", { name: "Protected workspace" }),
    ).toBeInTheDocument();
  });
});
