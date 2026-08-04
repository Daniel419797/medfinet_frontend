import { medfinetRequest as request } from "./medfinetApiClient";

export const medfinetRewardsApi = {
  // Campaigns
  listCampaigns(orgId: string) {
    return request<{
      items: Array<{
        id: string;
        name: string;
        sponsorName: string;
        programmeId?: string;
        status: string;
        startsAt: string;
        endsAt: string;
        creditBudget: string;
        milestoneRules: Array<{
          milestoneCode: string;
          sourceRecordType: string;
          credits: string;
        }>;
      }>;
      nextCursor?: string;
    }>("/reward-campaigns", { organizationId: orgId, purpose: "rewards-view" });
  },
  createCampaign(
    orgId: string,
    body: {
      name: string;
      sponsorName: string;
      programmeId?: string;
      startsAt: string;
      endsAt: string;
      creditBudget: number;
      milestoneRules: Array<{
        milestoneCode: string;
        sourceRecordType: "IMMUNIZATION" | "GROWTH" | "APPOINTMENT";
        credits: number;
        criteria?: Record<string, unknown>;
      }>;
    },
  ) {
    return request<{ id: string }>("/reward-campaigns", {
      method: "POST",
      body,
      organizationId: orgId,
      purpose: "rewards-management",
    });
  },
  transitionCampaign(
    orgId: string,
    campaignId: string,
    body: { status: string },
  ) {
    return request(
      `/reward-campaigns/${encodeURIComponent(campaignId)}/status`,
      {
        method: "PATCH",
        body,
        organizationId: orgId,
        purpose: "rewards-management",
      },
    );
  },
  grantMilestone(
    orgId: string,
    campaignId: string,
    childId: string,
    body: {
      milestoneCode: string;
      sourceRecordId: string;
    },
  ) {
    return request(
      `/reward-campaigns/${encodeURIComponent(campaignId)}/children/${encodeURIComponent(childId)}/grants`,
      {
        method: "POST",
        body,
        organizationId: orgId,
        purpose: "reward-grant",
      },
    );
  },

  // Reward Accounts
  getAccount(orgId: string, accountId: string) {
    return request<{
      id: string;
      caregiverId: string;
      balance: number;
      reservedBalance: number;
    }>(`/reward-accounts/${encodeURIComponent(accountId)}`, {
      organizationId: orgId,
      purpose: "rewards-view",
    });
  },
  getMyAccount(orgId: string) {
    return request<null | {
      account: {
        id: string;
        balance: string;
        reservedBalance: string;
        status: string;
        caregiver: { id: string; firstName: string; lastName: string };
      };
      transactions: {
        items: Array<{
          id: string;
          type: string;
          amount: string;
          balanceAfter: string;
          reservedBalanceAfter: string;
          createdAt: string;
        }>;
        nextCursor: string | null;
      };
    }>("/me/reward-account", {
      organizationId: orgId,
      purpose: "rewards-view",
    });
  },
  createReservation(
    orgId: string,
    accountId: string,
    body: {
      merchantId: string;
      amount: number;
      category: string;
      expiresInMinutes: number;
      idempotencyKey: string;
    },
  ) {
    return request<{
      reservation: {
        id: string;
        amount: string;
        category: string;
        expiresAt: string;
      };
      redemptionToken: string;
      idempotentReplay: boolean;
    }>(`/reward-accounts/${encodeURIComponent(accountId)}/reservations`, {
      method: "POST",
      body,
      organizationId: orgId,
      purpose: "reward-redemption",
    });
  },
  releaseExpiredReservation(orgId: string, reservationId: string) {
    return request(
      `/reward-reservations/${encodeURIComponent(reservationId)}/release-expired`,
      {
        method: "POST",
        organizationId: orgId,
        purpose: "reward-redemption",
      },
    );
  },

  // Merchants
  listMerchants(orgId: string) {
    return request<{
      items: Array<{
        id: string;
        name: string;
        code: string;
        status: string;
        approvedAt?: string;
        eligibleCategories: string[];
        settlementAccountRef?: string;
      }>;
      nextCursor?: string;
    }>("/merchants", { organizationId: orgId, purpose: "merchant-management" });
  },
  listMyMerchants(orgId: string) {
    return request<
      Array<{
        id: string;
        role: "OWNER" | "CASHIER" | "SETTLEMENT";
        merchant: {
          id: string;
          name: string;
          code: string;
          status: string;
          eligibleCategories: string[];
        };
      }>
    >("/me/merchants", {
      organizationId: orgId,
      purpose: "merchant-workspace",
    });
  },
  createMerchant(
    orgId: string,
    body: { name: string; code: string; eligibleCategories: string[] },
  ) {
    return request<{ id: string }>("/merchants", {
      method: "POST",
      body,
      organizationId: orgId,
      purpose: "merchant-management",
    });
  },
  approveMerchant(
    orgId: string,
    merchantId: string,
    body: { settlementAccountRef: string },
  ) {
    return request(`/merchants/${encodeURIComponent(merchantId)}/approve`, {
      method: "POST",
      body,
      organizationId: orgId,
      purpose: "merchant-management",
    });
  },
  suspendMerchant(orgId: string, merchantId: string, body: { reason: string }) {
    return request(`/merchants/${encodeURIComponent(merchantId)}/suspend`, {
      method: "POST",
      body,
      organizationId: orgId,
      purpose: "merchant-management",
    });
  },
  upsertMerchantMember(
    orgId: string,
    merchantId: string,
    body: {
      subjectId: string;
      role: "OWNER" | "CASHIER" | "SETTLEMENT";
    },
  ) {
    return request(`/merchants/${encodeURIComponent(merchantId)}/members`, {
      method: "PUT",
      body,
      organizationId: orgId,
      purpose: "merchant-management",
    });
  },

  // Redemptions
  redeem(
    orgId: string,
    merchantId: string,
    body: {
      reservationToken: string;
      amount: number;
      reference?: string;
    },
  ) {
    return request<{ id: string }>(
      `/merchants/${encodeURIComponent(merchantId)}/redemptions`,
      {
        method: "POST",
        body,
        organizationId: orgId,
        purpose: "redemption",
      },
    );
  },
  reverseRedemption(
    orgId: string,
    redemptionId: string,
    body: { reason: string },
  ) {
    return request(
      `/reward-redemptions/${encodeURIComponent(redemptionId)}/reverse`,
      {
        method: "POST",
        body,
        organizationId: orgId,
        purpose: "redemption-reversal",
      },
    );
  },

  // Settlements
  createSettlement(
    orgId: string,
    merchantId: string,
    body: {
      periodStart: string;
      periodEnd: string;
    },
  ) {
    return request<{ id: string }>(
      `/merchants/${encodeURIComponent(merchantId)}/settlements`,
      {
        method: "POST",
        body,
        organizationId: orgId,
        purpose: "settlement-management",
      },
    );
  },
  listMerchantSettlements(orgId: string, merchantId: string) {
    return request<{
      items: Array<{
        id: string;
        periodStart: string;
        periodEnd: string;
        totalCredits: string;
        status: string;
      }>;
      nextCursor?: string;
    }>(`/merchants/${encodeURIComponent(merchantId)}/settlements`, {
      organizationId: orgId,
      purpose: "settlement-view",
    });
  },
  approveSettlement(orgId: string, settlementId: string) {
    return request(`/settlements/${encodeURIComponent(settlementId)}/approve`, {
      method: "POST",
      organizationId: orgId,
      purpose: "settlement-approval",
    });
  },
  listSettlements(orgId: string) {
    return request<{
      items: Array<{
        id: string;
        merchantId: string;
        merchant: { name: string; code: string };
        periodStart: string;
        periodEnd: string;
        totalCredits: string;
        status: string;
      }>;
      nextCursor?: string;
    }>("/settlements", { organizationId: orgId, purpose: "settlement-view" });
  },
  transitionSettlement(
    orgId: string,
    settlementId: string,
    body: { status: string; paymentReference?: string; failureReason?: string },
  ) {
    return request(`/settlements/${encodeURIComponent(settlementId)}/status`, {
      method: "PATCH",
      body,
      organizationId: orgId,
      purpose: "settlement-management",
    });
  },
};
