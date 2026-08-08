import { useCallback, useContext, useEffect, useState } from "react";
import UserContext from "../contexts/UserContext";
import { medfinetBlockchainApi } from "../services/medfinetBlockchainApi";

export type BlockchainAvailability = {
  enabled: boolean;
  reachable: boolean;
  network?: string;
  loading: boolean;
  error: string | null;
};

const initialState: BlockchainAvailability = {
  enabled: false,
  reachable: false,
  loading: true,
  error: null,
};

export function useBlockchainAvailability() {
  const { organizationId } = useContext(UserContext);
  const [state, setState] = useState<BlockchainAvailability>(initialState);

  const refresh = useCallback(async () => {
    if (!organizationId) {
      setState({ ...initialState, loading: false });
      return;
    }

    setState((current) => ({ ...current, loading: true, error: null }));
    try {
      const health = await medfinetBlockchainApi.health(organizationId);
      setState({
        enabled: health.enabled,
        reachable: Boolean(health.reachable),
        network: health.network,
        loading: false,
        error: null,
      });
    } catch (reason) {
      setState({
        enabled: false,
        reachable: false,
        loading: false,
        error: reason instanceof Error ? reason.message : "Unable to check blockchain availability.",
      });
    }
  }, [organizationId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { ...state, refresh };
}
