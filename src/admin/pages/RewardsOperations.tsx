import { useCallback, useContext, useEffect, useState } from "react";
import { Plus } from "lucide-react";
import UserContext from "../../contexts/UserContext";
import { Modal } from "../../components/common/Modal";
import { ActionReasonModal } from "../../components/common/ActionReasonModal";
import { ConfirmActionModal } from "../../components/common/ConfirmActionModal";
import { PageFeedback } from "../../components/common/PageFeedback";
import { medfinetIdentityApi } from "../../services/medfinetIdentityApi";
import { medfinetOperationsApi } from "../../services/medfinetOperationsApi";
import { medfinetRewardsApi } from "../../services/medfinetRewardsApi";

type Campaign = Awaited<
  ReturnType<typeof medfinetRewardsApi.listCampaigns>
>["items"][number];
type Merchant = Awaited<
  ReturnType<typeof medfinetRewardsApi.listMerchants>
>["items"][number];
type Settlement = Awaited<
  ReturnType<typeof medfinetRewardsApi.listSettlements>
>["items"][number];
const inDays = (days: number) =>
  new Date(Date.now() + days * 86_400_000).toISOString().slice(0, 16);

export default function RewardsOperations() {
  const { organizationId } = useContext(UserContext);
  const [tab, setTab] = useState<
    "campaigns" | "merchants" | "settlements" | "accounts"
  >("campaigns");
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [accounts, setAccounts] = useState<Array<Record<string, unknown>>>([]);
  const [redemptions, setRedemptions] = useState<
    Array<Record<string, unknown>>
  >([]);
  const [programmes, setProgrammes] = useState<
    Awaited<ReturnType<typeof medfinetIdentityApi.listProgrammes>>
  >([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [campaignOpen, setCampaignOpen] = useState(false);
  const [campaignTarget, setCampaignTarget] = useState<{
    item: Campaign;
    status: string;
  } | null>(null);
  const [merchantTarget, setMerchantTarget] = useState<{
    item: Merchant;
    action: "approve" | "suspend";
  } | null>(null);
  const [merchantOpen, setMerchantOpen] = useState(false);
  const [settlementMerchant, setSettlementMerchant] = useState<Merchant | null>(
    null,
  );
  const [transition, setTransition] = useState<Settlement | null>(null);
  const [campaignForm, setCampaignForm] = useState({
    name: "",
    sponsorName: "",
    programmeId: "",
    startsAt: inDays(0),
    endsAt: inDays(30),
    creditBudget: "10000",
    milestoneCode: "",
    sourceRecordType: "IMMUNIZATION",
    credits: "100",
  });
  const [merchantForm, setMerchantForm] = useState({
    name: "",
    code: "",
    eligibleCategories: "",
  });
  const [settlementForm, setSettlementForm] = useState({
    periodStart: inDays(-30),
    periodEnd: inDays(0),
  });
  const [transitionForm, setTransitionForm] = useState({
    status: "PROCESSING",
    evidence: "",
  });

  const load = useCallback(async () => {
    if (!organizationId) return;
    setLoading(true);
    setError("");
    try {
      const [
        campaignPage,
        merchantPage,
        settlementPage,
        accountRows,
        redemptionRows,
        programmeRows,
      ] = await Promise.all([
        medfinetRewardsApi.listCampaigns(organizationId),
        medfinetRewardsApi.listMerchants(organizationId),
        medfinetRewardsApi.listSettlements(organizationId),
        medfinetOperationsApi.rewardAccounts(organizationId),
        medfinetOperationsApi.rewardRedemptions(organizationId),
        medfinetIdentityApi.listProgrammes(organizationId),
      ]);
      setCampaigns(campaignPage.items);
      setMerchants(merchantPage.items);
      setSettlements(settlementPage.items);
      setAccounts(accountRows);
      setRedemptions(redemptionRows);
      setProgrammes(programmeRows);
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Unable to load rewards operations",
      );
    } finally {
      setLoading(false);
    }
  }, [organizationId]);
  useEffect(() => {
    void load();
  }, [load]);

  async function createCampaign(event: React.FormEvent) {
    event.preventDefault();
    if (!organizationId) return;
    setBusy(true);
    try {
      await medfinetRewardsApi.createCampaign(organizationId, {
        name: campaignForm.name,
        sponsorName: campaignForm.sponsorName,
        programmeId: campaignForm.programmeId || undefined,
        startsAt: new Date(campaignForm.startsAt).toISOString(),
        endsAt: new Date(campaignForm.endsAt).toISOString(),
        creditBudget: Number(campaignForm.creditBudget),
        milestoneRules: [
          {
            milestoneCode: campaignForm.milestoneCode,
            sourceRecordType: campaignForm.sourceRecordType as "IMMUNIZATION",
            credits: Number(campaignForm.credits),
          },
        ],
      });
      setCampaignOpen(false);
      setNotice("Reward campaign created as a draft.");
      await load();
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : "Unable to create campaign",
      );
    } finally {
      setBusy(false);
    }
  }

  async function campaignStatus(item: Campaign, status: string) {
    if (!organizationId) return;
    setBusy(true);
    try {
      await medfinetRewardsApi.transitionCampaign(organizationId, item.id, {
        status,
      });
      setNotice(`Campaign moved to ${status}.`);
      await load();
      setCampaignTarget(null);
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : "Campaign transition failed",
      );
    } finally {
      setBusy(false);
    }
  }

  async function createMerchant(event: React.FormEvent) {
    event.preventDefault();
    if (!organizationId) return;
    setBusy(true);
    try {
      await medfinetRewardsApi.createMerchant(organizationId, {
        name: merchantForm.name,
        code: merchantForm.code,
        eligibleCategories: merchantForm.eligibleCategories
          .split(",")
          .map((value) => value.trim())
          .filter(Boolean),
      });
      setMerchantOpen(false);
      setNotice("Merchant created pending approval.");
      await load();
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : "Unable to create merchant",
      );
    } finally {
      setBusy(false);
    }
  }

  async function merchantAction(
    item: Merchant,
    action: "approve" | "suspend",
    evidence: string,
  ) {
    if (!organizationId) return;
    if (!evidence) return;
    setBusy(true);
    try {
      if (action === "approve")
        await medfinetRewardsApi.approveMerchant(organizationId, item.id, {
          settlementAccountRef: evidence,
        });
      else
        await medfinetRewardsApi.suspendMerchant(organizationId, item.id, {
          reason: evidence,
        });
      setNotice(`Merchant ${action}d.`);
      await load();
      setMerchantTarget(null);
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : "Merchant action failed",
      );
    } finally {
      setBusy(false);
    }
  }

  async function createSettlement(event: React.FormEvent) {
    event.preventDefault();
    if (!organizationId || !settlementMerchant) return;
    setBusy(true);
    try {
      await medfinetRewardsApi.createSettlement(
        organizationId,
        settlementMerchant.id,
        {
          periodStart: new Date(settlementForm.periodStart).toISOString(),
          periodEnd: new Date(settlementForm.periodEnd).toISOString(),
        },
      );
      setSettlementMerchant(null);
      setNotice(
        "Settlement draft created. Another administrator must approve it.",
      );
      await load();
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Unable to create settlement",
      );
    } finally {
      setBusy(false);
    }
  }

  async function settlementAction(
    item: Settlement,
    action: "approve" | "transition",
  ) {
    if (!organizationId) return;
    setBusy(true);
    try {
      if (action === "approve")
        await medfinetRewardsApi.approveSettlement(organizationId, item.id);
      else
        await medfinetRewardsApi.transitionSettlement(organizationId, item.id, {
          status: transitionForm.status,
          ...(transitionForm.status === "PAID"
            ? { paymentReference: transitionForm.evidence }
            : {}),
          ...(transitionForm.status === "FAILED"
            ? { failureReason: transitionForm.evidence }
            : {}),
        });
      setTransition(null);
      setNotice("Settlement updated.");
      await load();
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : "Settlement action failed",
      );
    } finally {
      setBusy(false);
    }
  }

  const activeRows =
    tab === "campaigns"
      ? campaigns
      : tab === "merchants"
        ? merchants
        : tab === "settlements"
          ? settlements
          : accounts;
  return (
    <main className="p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-cyan-700">Benefits ledger</p>
          <h1 className="text-3xl font-bold text-slate-950">
            Rewards and merchants
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Non-cash campaigns, balances, merchant approval, redemptions and
            maker-checker settlements.
          </p>
        </div>
        {tab === "campaigns" && (
          <button
            type="button"
            onClick={() => setCampaignOpen(true)}
            className="rounded-lg bg-cyan-700 px-4 py-2.5 text-sm font-semibold text-white"
          >
            <Plus className="mr-2 inline h-4 w-4" />
            Create campaign
          </button>
        )}
        {tab === "merchants" && (
          <button
            type="button"
            onClick={() => setMerchantOpen(true)}
            className="rounded-lg bg-cyan-700 px-4 py-2.5 text-sm font-semibold text-white"
          >
            <Plus className="mr-2 inline h-4 w-4" />
            Add merchant
          </button>
        )}
      </div>
      {notice && (
        <div
          role="status"
          className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800"
        >
          {notice}
        </div>
      )}
      <div className="mt-6 flex gap-2 overflow-x-auto">
        {(["campaigns", "merchants", "settlements", "accounts"] as const).map(
          (value) => (
            <button
              type="button"
              key={value}
              onClick={() => setTab(value)}
              className={`rounded-full px-4 py-2 text-sm font-semibold ${tab === value ? "bg-slate-950 text-white" : "border bg-white"}`}
            >
              {value}
            </button>
          ),
        )}
      </div>
      <div className="mt-5">
        <PageFeedback
          loading={loading}
          error={error}
          empty={!activeRows.length}
          onRetry={() => void load()}
        >
          {tab === "campaigns" ? (
            <div className="grid gap-4 lg:grid-cols-2">
              {campaigns.map((item) => (
                <article
                  key={item.id}
                  className="rounded-2xl border bg-white p-5"
                >
                  <div className="flex justify-between">
                    <div>
                      <h2 className="font-bold">{item.name}</h2>
                      <p className="text-sm text-slate-600">
                        {item.sponsorName} · {item.creditBudget} credits
                      </p>
                    </div>
                    <span className="text-xs font-semibold">{item.status}</span>
                  </div>
                  <div className="mt-4 flex gap-2">
                    {item.status === "DRAFT" && (
                      <button
                        type="button"
                        onClick={() =>
                          setCampaignTarget({ item, status: "ACTIVE" })
                        }
                        className="rounded-lg bg-emerald-700 px-3 py-2 text-sm font-semibold text-white"
                      >
                        Activate
                      </button>
                    )}
                    {item.status === "ACTIVE" && (
                      <button
                        type="button"
                        onClick={() =>
                          setCampaignTarget({ item, status: "PAUSED" })
                        }
                        className="rounded-lg border px-3 py-2 text-sm font-semibold"
                      >
                        Pause
                      </button>
                    )}
                    {item.status === "PAUSED" && (
                      <button
                        type="button"
                        onClick={() =>
                          setCampaignTarget({ item, status: "ACTIVE" })
                        }
                        className="rounded-lg bg-cyan-700 px-3 py-2 text-sm font-semibold text-white"
                      >
                        Resume
                      </button>
                    )}
                  </div>
                </article>
              ))}
            </div>
          ) : tab === "merchants" ? (
            <div className="grid gap-4 lg:grid-cols-2">
              {merchants.map((item) => (
                <article
                  key={item.id}
                  className="rounded-2xl border bg-white p-5"
                >
                  <div className="flex justify-between">
                    <div>
                      <h2 className="font-bold">{item.name}</h2>
                      <p className="text-sm text-slate-600">
                        {item.code} · {item.eligibleCategories.join(", ")}
                      </p>
                    </div>
                    <span className="text-xs font-semibold">{item.status}</span>
                  </div>
                  <div className="mt-4 flex gap-2">
                    {item.status === "PENDING" && (
                      <button
                        type="button"
                        onClick={() =>
                          setMerchantTarget({ item, action: "approve" })
                        }
                        className="rounded-lg bg-emerald-700 px-3 py-2 text-sm font-semibold text-white"
                      >
                        Approve
                      </button>
                    )}
                    {item.status === "ACTIVE" && (
                      <>
                        <button
                          type="button"
                          onClick={() => setSettlementMerchant(item)}
                          className="rounded-lg bg-cyan-700 px-3 py-2 text-sm font-semibold text-white"
                        >
                          Create settlement
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setMerchantTarget({ item, action: "suspend" })
                          }
                          className="rounded-lg border px-3 py-2 text-sm font-semibold"
                        >
                          Suspend
                        </button>
                      </>
                    )}
                  </div>
                </article>
              ))}
            </div>
          ) : tab === "settlements" ? (
            <div className="space-y-3">
              {settlements.map((item) => (
                <article
                  key={item.id}
                  className="flex flex-col justify-between gap-3 rounded-xl border bg-white p-4 sm:flex-row sm:items-center"
                >
                  <div>
                    <p className="font-semibold">
                      {item.merchant.name} · {item.totalCredits} credits
                    </p>
                    <p className="text-xs text-slate-500">
                      {item.status} ·{" "}
                      {new Date(item.periodStart).toLocaleDateString()}–
                      {new Date(item.periodEnd).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {item.status === "DRAFT" && (
                      <button
                        type="button"
                        onClick={() => void settlementAction(item, "approve")}
                        className="rounded-lg bg-emerald-700 px-3 py-2 text-sm font-semibold text-white"
                      >
                        Approve
                      </button>
                    )}
                    {["APPROVED", "PROCESSING", "FAILED"].includes(
                      item.status,
                    ) && (
                      <button
                        type="button"
                        onClick={() => {
                          setTransition(item);
                          setTransitionForm({
                            status:
                              item.status === "APPROVED" ||
                              item.status === "FAILED"
                                ? "PROCESSING"
                                : "PAID",
                            evidence: "",
                          });
                        }}
                        className="rounded-lg border px-3 py-2 text-sm font-semibold"
                      >
                        Update status
                      </button>
                    )}
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {accounts.map((item) => (
                <article
                  key={String(item.id)}
                  className="rounded-xl border bg-white p-4"
                >
                  <p className="font-semibold">
                    {String(
                      (
                        item.caregiver as {
                          firstName?: string;
                          lastName?: string;
                        }
                      )?.firstName || "",
                    )}{" "}
                    {String(
                      (item.caregiver as { lastName?: string })?.lastName || "",
                    )}
                  </p>
                  <p className="text-sm text-slate-600">
                    Available: {String(item.balance)} · Reserved:{" "}
                    {String(item.reservedBalance)}
                  </p>
                </article>
              ))}
              <div className="lg:col-span-2">
                <h2 className="mb-3 font-bold">Recent redemptions</h2>
                {redemptions.map((item) => (
                  <p key={String(item.id)} className="border-t py-3 text-sm">
                    {String(
                      (item.merchant as { name?: string })?.name || "Merchant",
                    )}{" "}
                    · {String(item.amount)} credits · {String(item.status)}
                  </p>
                ))}
              </div>
            </div>
          )}
        </PageFeedback>
      </div>
      <Modal
        open={campaignOpen}
        title="Create reward campaign"
        onClose={() => setCampaignOpen(false)}
      >
        <form onSubmit={createCampaign} className="grid gap-4 sm:grid-cols-2">
          {(["name", "sponsorName", "milestoneCode"] as const).map((field) => (
            <label key={field} className="text-sm font-medium">
              {field.replace(/([A-Z])/g, " $1")}
              <input
                required
                value={campaignForm[field]}
                onChange={(event) =>
                  setCampaignForm({
                    ...campaignForm,
                    [field]: event.target.value,
                  })
                }
                className="mt-1 w-full rounded-lg border px-3 py-2"
              />
            </label>
          ))}
          <label className="text-sm font-medium">
            Programme
            <select
              value={campaignForm.programmeId}
              onChange={(event) =>
                setCampaignForm({
                  ...campaignForm,
                  programmeId: event.target.value,
                })
              }
              className="mt-1 w-full rounded-lg border px-3 py-2"
            >
              <option value="">All programmes</option>
              {programmes.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm font-medium">
            Credit budget
            <input
              required
              min="1"
              type="number"
              value={campaignForm.creditBudget}
              onChange={(event) =>
                setCampaignForm({
                  ...campaignForm,
                  creditBudget: event.target.value,
                })
              }
              className="mt-1 w-full rounded-lg border px-3 py-2"
            />
          </label>
          <label className="text-sm font-medium">
            Milestone credits
            <input
              required
              min="1"
              type="number"
              value={campaignForm.credits}
              onChange={(event) =>
                setCampaignForm({
                  ...campaignForm,
                  credits: event.target.value,
                })
              }
              className="mt-1 w-full rounded-lg border px-3 py-2"
            />
          </label>
          <label className="text-sm font-medium">
            Starts
            <input
              required
              type="datetime-local"
              value={campaignForm.startsAt}
              onChange={(event) =>
                setCampaignForm({
                  ...campaignForm,
                  startsAt: event.target.value,
                })
              }
              className="mt-1 w-full rounded-lg border px-3 py-2"
            />
          </label>
          <label className="text-sm font-medium">
            Ends
            <input
              required
              type="datetime-local"
              value={campaignForm.endsAt}
              onChange={(event) =>
                setCampaignForm({ ...campaignForm, endsAt: event.target.value })
              }
              className="mt-1 w-full rounded-lg border px-3 py-2"
            />
          </label>
          <button
            disabled={busy}
            className="sm:col-span-2 rounded-lg bg-cyan-700 px-4 py-2.5 font-semibold text-white"
          >
            Create campaign
          </button>
        </form>
      </Modal>
      <Modal
        open={merchantOpen}
        title="Add merchant"
        onClose={() => setMerchantOpen(false)}
      >
        <form onSubmit={createMerchant} className="space-y-4">
          <label className="block text-sm font-medium">
            Name
            <input
              required
              value={merchantForm.name}
              onChange={(event) =>
                setMerchantForm({ ...merchantForm, name: event.target.value })
              }
              className="mt-1 w-full rounded-lg border px-3 py-2"
            />
          </label>
          <label className="block text-sm font-medium">
            Code
            <input
              required
              value={merchantForm.code}
              onChange={(event) =>
                setMerchantForm({ ...merchantForm, code: event.target.value })
              }
              className="mt-1 w-full rounded-lg border px-3 py-2"
            />
          </label>
          <label className="block text-sm font-medium">
            Eligible categories, separated by commas
            <input
              required
              value={merchantForm.eligibleCategories}
              onChange={(event) =>
                setMerchantForm({
                  ...merchantForm,
                  eligibleCategories: event.target.value,
                })
              }
              className="mt-1 w-full rounded-lg border px-3 py-2"
            />
          </label>
          <button
            disabled={busy}
            className="w-full rounded-lg bg-cyan-700 px-4 py-2.5 font-semibold text-white"
          >
            Add merchant
          </button>
        </form>
      </Modal>
      <Modal
        open={Boolean(settlementMerchant)}
        title="Create settlement"
        onClose={() => setSettlementMerchant(null)}
      >
        <form onSubmit={createSettlement} className="space-y-4">
          <label className="block text-sm font-medium">
            Period start
            <input
              required
              type="datetime-local"
              value={settlementForm.periodStart}
              onChange={(event) =>
                setSettlementForm({
                  ...settlementForm,
                  periodStart: event.target.value,
                })
              }
              className="mt-1 w-full rounded-lg border px-3 py-2"
            />
          </label>
          <label className="block text-sm font-medium">
            Period end
            <input
              required
              type="datetime-local"
              value={settlementForm.periodEnd}
              onChange={(event) =>
                setSettlementForm({
                  ...settlementForm,
                  periodEnd: event.target.value,
                })
              }
              className="mt-1 w-full rounded-lg border px-3 py-2"
            />
          </label>
          <button
            disabled={busy}
            className="w-full rounded-lg bg-cyan-700 px-4 py-2.5 font-semibold text-white"
          >
            Create draft
          </button>
        </form>
      </Modal>
      <Modal
        open={Boolean(transition)}
        title="Update settlement status"
        onClose={() => setTransition(null)}
      >
        <form
          onSubmit={(event) => {
            event.preventDefault();
            if (transition) void settlementAction(transition, "transition");
          }}
          className="space-y-4"
        >
          <label className="block text-sm font-medium">
            Status
            <select
              value={transitionForm.status}
              onChange={(event) =>
                setTransitionForm({
                  ...transitionForm,
                  status: event.target.value,
                })
              }
              className="mt-1 w-full rounded-lg border px-3 py-2"
            >
              <option>PROCESSING</option>
              <option>PAID</option>
              <option>FAILED</option>
              <option>CANCELLED</option>
            </select>
          </label>
          {["PAID", "FAILED"].includes(transitionForm.status) && (
            <label className="block text-sm font-medium">
              {transitionForm.status === "PAID"
                ? "Payment reference"
                : "Failure reason"}
              <input
                required
                value={transitionForm.evidence}
                onChange={(event) =>
                  setTransitionForm({
                    ...transitionForm,
                    evidence: event.target.value,
                  })
                }
                className="mt-1 w-full rounded-lg border px-3 py-2"
              />
            </label>
          )}
          <button
            disabled={busy}
            className="w-full rounded-lg bg-cyan-700 px-4 py-2.5 font-semibold text-white"
          >
            Save status
          </button>
        </form>
      </Modal>
      <ConfirmActionModal
        open={Boolean(campaignTarget)}
        title="Change reward campaign status"
        description={`Move ${campaignTarget?.item.name || "this campaign"} to ${campaignTarget?.status || "the selected status"}? Reward eligibility will follow the new status immediately.`}
        confirmLabel={`Move to ${campaignTarget?.status || "status"}`}
        destructive={campaignTarget?.status === "PAUSED"}
        busy={busy}
        onClose={() => setCampaignTarget(null)}
        onConfirm={() => {
          if (campaignTarget)
            return campaignStatus(campaignTarget.item, campaignTarget.status);
        }}
      />
      <ActionReasonModal
        open={Boolean(merchantTarget)}
        title={
          merchantTarget?.action === "approve"
            ? "Approve merchant"
            : "Suspend merchant"
        }
        description={
          merchantTarget?.action === "approve"
            ? "Enter the managed settlement account reference. Secrets must not be entered here."
            : "Suspension immediately prevents new redemptions."
        }
        reasonLabel={
          merchantTarget?.action === "approve"
            ? "Managed settlement account reference"
            : "Suspension reason"
        }
        confirmLabel={
          merchantTarget?.action === "approve"
            ? "Approve merchant"
            : "Suspend merchant"
        }
        destructive={merchantTarget?.action === "suspend"}
        busy={busy}
        onClose={() => setMerchantTarget(null)}
        onConfirm={(evidence) => {
          if (merchantTarget)
            return merchantAction(
              merchantTarget.item,
              merchantTarget.action,
              evidence,
            );
        }}
      />
    </main>
  );
}
