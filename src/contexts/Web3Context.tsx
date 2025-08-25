import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { StakingService } from "@/lib/contract-service";
import { toast } from "sonner";

interface Web3ContextType {
  account: string | null;
  connecting: boolean;
  stakingService: StakingService | null;
  connectWallet: () => Promise<void>;
  error: string | null;
}

const Web3Context = createContext<Web3ContextType>({
  account: null,
  connecting: false,
  stakingService: null,
  connectWallet: async () => {},
  error: null,
});

export function Web3Provider({ children }: { children: React.ReactNode }) {
  const [account, setAccount] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [stakingService, setStakingService] = useState<StakingService | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);

  const initializeStakingService = useCallback(async () => {
    try {
      const service = new StakingService();
      await service.initialize();
      setStakingService(service);
      return true;
    } catch (err) {
      console.error("Failed to initialize staking service:", err);
      toast.error("Failed to initialize staking service");
      return false;
    }
  }, []);

  const connectWallet = async () => {
    if (!window.ethereum) {
      const errorMsg = "Please install MetaMask to use this application";
      setError(errorMsg);
      toast.error(errorMsg);
      return;
    }

    try {
      setConnecting(true);
      setError(null);

      // Request account access
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      if (!accounts || accounts.length === 0) {
        throw new Error("No accounts found");
      }

      // Initialize service
      const success = await initializeStakingService();
      if (!success) {
        throw new Error("Failed to initialize services");
      }

      setAccount(accounts[0]);
      toast.success("Wallet connected successfully");
    } catch (err: any) {
      console.error("Failed to connect wallet:", err);
      const errorMsg = err.message || "Failed to connect wallet";
      setError(errorMsg);
      toast.error(errorMsg);
      setAccount(null);
      setStakingService(null);
    } finally {
      setConnecting(false);
    }
  };

  useEffect(() => {
    // Check if already connected
    const checkConnection = async () => {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({
            method: "eth_accounts",
          });
          if (accounts && accounts.length > 0) {
            setAccount(accounts[0]);
            await initializeStakingService();
          }
        } catch (err) {
          console.error("Error checking wallet connection:", err);
        }
      }
    };

    checkConnection();

    if (window.ethereum) {
      // Setup event listeners
      window.ethereum.on("accountsChanged", async (accounts: string[]) => {
        if (accounts.length === 0) {
          setAccount(null);
          setStakingService(null);
          toast.info("Wallet disconnected");
        } else {
          setAccount(accounts[0]);
          await initializeStakingService();
          toast.success("Wallet account changed");
        }
      });

      window.ethereum.on("chainChanged", () => {
        window.location.reload();
      });

      window.ethereum.on("disconnect", () => {
        setAccount(null);
        setStakingService(null);
        toast.info("Wallet disconnected");
      });
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener("accountsChanged", () => {});
        window.ethereum.removeListener("chainChanged", () => {});
        window.ethereum.removeListener("disconnect", () => {});
      }
    };
  }, [initializeStakingService]);

  return (
    <Web3Context.Provider
      value={{
        account,
        connecting,
        stakingService,
        connectWallet,
        error,
      }}
    >
      {children}
    </Web3Context.Provider>
  );
}

export function useWeb3() {
  return useContext(Web3Context);
}
