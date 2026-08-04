import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import UserContext from "../../contexts/UserContext";
import type { OrganizationMembership } from "../../services/medfinetSessionApi";
import { OrganizationSwitcher } from "./OrganizationSwitcher";

function membership(
  id: string,
  name: string,
  role: OrganizationMembership["role"],
): OrganizationMembership {
  return {
    id: `membership-${id}`,
    role,
    status: "ACTIVE",
    scopeMode: "GLOBAL",
    organization: {
      id,
      name,
      slug: name.toLowerCase().replaceAll(" ", "-"),
      status: "ACTIVE",
    },
  };
}

function renderSwitcher(memberships: OrganizationMembership[]) {
  const setOrganizationId = vi.fn();
  const current = memberships[0] || null;
  render(
    <UserContext.Provider
      value={{
        user: null,
        organizationId: current?.organization.id || null,
        memberships,
        currentMembership: current,
        sessionReady: true,
        sessionError: null,
        logout: vi.fn(),
        setOrganizationId,
        refreshSession: vi.fn(),
      }}
    >
      <MemoryRouter initialEntries={["/dashboard"]}>
        <OrganizationSwitcher />
        <Routes>
          <Route path="/dashboard" element={<p>Caregiver workspace</p>} />
          <Route path="/admin/dashboard" element={<p>Admin workspace</p>} />
        </Routes>
      </MemoryRouter>
    </UserContext.Provider>,
  );
  return setOrganizationId;
}

describe("OrganizationSwitcher", () => {
  it("does not add an unnecessary control for a single membership", () => {
    renderSwitcher([membership("org-1", "Community Clinic", "CAREGIVER")]);
    expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
  });

  it("switches organization and navigates to the selected role workspace", () => {
    const setOrganizationId = renderSwitcher([
      membership("org-1", "Community Clinic", "CAREGIVER"),
      membership("org-2", "Regional Office", "ADMIN"),
    ]);

    fireEvent.change(screen.getByRole("combobox", { name: "Organization" }), {
      target: { value: "org-2" },
    });

    expect(setOrganizationId).toHaveBeenCalledWith("org-2");
    expect(screen.getByText("Admin workspace")).toBeInTheDocument();
  });
});
