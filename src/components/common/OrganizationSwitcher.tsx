import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import UserContext from "../../contexts/UserContext";
import { roleHomePath } from "../../utils/roleNavigation";

export function OrganizationSwitcher() {
  const { memberships, organizationId, setOrganizationId } =
    useContext(UserContext);
  const navigate = useNavigate();
  if (memberships.length < 2) return null;
  return (
    <label className="sr-only md:not-sr-only md:flex md:items-center md:gap-2 text-xs font-semibold text-slate-500">
      Switch
      <select
        aria-label="Organization"
        value={organizationId || ""}
        onChange={(event) => {
          const membership = memberships.find(
            (item) => item.organization.id === event.target.value,
          );
          setOrganizationId(event.target.value);
          navigate(roleHomePath(membership?.role));
        }}
        className="max-w-48 !min-h-9 !border-0 !bg-transparent !px-2 !py-1 text-sm font-bold !shadow-none"
      >
        {memberships.map((membership) => (
          <option key={membership.id} value={membership.organization.id}>
            {membership.organization.name}
          </option>
        ))}
      </select>
    </label>
  );
}
