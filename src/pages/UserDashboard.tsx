import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useWeb3 } from "@/contexts/Web3Context";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { TokenType } from "@/lib/staking-abi";
import { PriceDisplay } from "@/components/ui/price-display";
import { PriceChart } from "@/components/ui/price-chart";
import { KYCStatus } from "@/components/ui/kyc-status";
import { StakingInterface } from "@/components/ui/staking-interface";
import { ActivityLogPanel } from "@/components/ui/activity-log";
import { NotificationSettingsPanel } from "@/components/ui/notification-settings";
import { kycService } from "@/lib/kyc-service";
import { toast } from "sonner";
import { LayoutDashboard, Coins, Shield, Activity, Bell } from "lucide-react";

const TOKEN_MAPPINGS = {
  [TokenType.STR]: { id: "stakerise", color: "#8884d8" },
  [TokenType.BTC]: { id: "bitcoin", color: "#f7931a" },
  [TokenType.ETH]: { id: "ethereum", color: "#627eea" },
};

export default function UserDashboard() {
  const { account, connecting, stakingService, connectWallet } = useWeb3();
  const [kycStatus, setKycStatus] = useState(null);
  const [balances, setBalances] = useState({
    str: "0",
    btc: "0",
    eth: "0",
  });
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const loadData = async () => {
      if (stakingService && account) {
        try {
          setLoading(true);

          // Load KYC status
          const status = await kycService.getStatus();
          setKycStatus(status);

          // Load balances
          const balances = await stakingService.getAllBalances();
          setBalances({
            str: stakingService.convertFromTokenAmount(
              balances[TokenType.STR],
              TokenType.STR,
            ),
            btc: stakingService.convertFromTokenAmount(
              balances[TokenType.BTC],
              TokenType.BTC,
            ),
            eth: stakingService.convertFromTokenAmount(
              balances[TokenType.ETH],
              TokenType.ETH,
            ),
          });
        } catch (err) {
          console.error("Failed to load data:", err);
          toast.error("Failed to load account data");
        } finally {
          setLoading(false);
        }
      }
    };

    loadData();
  }, [stakingService, account]);

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-2xl font-bold">StakeRise Dashboard</h1>
            <div className="flex items-center gap-4">
              {account ? (
                <>
                  <p className="text-sm">
                    Connected: {account.slice(0, 6)}...{account.slice(-4)}
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => window.location.reload()}
                  >
                    Disconnect
                  </Button>
                </>
              ) : (
                <Button onClick={connectWallet} disabled={connecting}>
                  {connecting ? "Connecting..." : "Connect Wallet"}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex">
        <div className="w-64 border-r min-h-[calc(100vh-4rem)] p-4">
          <nav className="space-y-2">
            <Button
              variant={activeTab === "overview" ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActiveTab("overview")}
            >
              <LayoutDashboard className="w-4 h-4 mr-2" />
              Overview
            </Button>
            <Button
              variant={activeTab === "stake" ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActiveTab("stake")}
            >
              <Coins className="w-4 h-4 mr-2" />
              Stake
            </Button>
            <Button
              variant={activeTab === "kyc" ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActiveTab("kyc")}
            >
              <Shield className="w-4 h-4 mr-2" />
              KYC Status
            </Button>
            <Button
              variant={activeTab === "activity" ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActiveTab("activity")}
            >
              <Activity className="w-4 h-4 mr-2" />
              Activity
            </Button>
            <Button
              variant={activeTab === "notifications" ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActiveTab("notifications")}
            >
              <Bell className="w-4 h-4 mr-2" />
              Notifications
            </Button>
          </nav>
        </div>

        <div className="flex-1 p-6">
          {!account ? (
            <Card className="mb-6">
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">
                  Connect your wallet to view your balances and start staking
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              {activeTab === "overview" && (
                <>
                  {/* Token Balances */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <Card>
                      <CardContent className="pt-6">
                        <h2 className="text-lg font-semibold mb-2">STR</h2>
                        <div className="flex justify-between items-center mb-2">
                          <PriceDisplay
                            tokenId={TOKEN_MAPPINGS[TokenType.STR].id}
                            symbol="STR"
                          />
                          <span className="text-sm text-muted-foreground">
                            Balance: {loading ? "Loading..." : balances.str}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <h2 className="text-lg font-semibold mb-2">BTC</h2>
                        <div className="flex justify-between items-center mb-2">
                          <PriceDisplay
                            tokenId={TOKEN_MAPPINGS[TokenType.BTC].id}
                            symbol="BTC"
                          />
                          <span className="text-sm text-muted-foreground">
                            Balance: {loading ? "Loading..." : balances.btc}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <h2 className="text-lg font-semibold mb-2">ETH</h2>
                        <div className="flex justify-between items-center mb-2">
                          <PriceDisplay
                            tokenId={TOKEN_MAPPINGS[TokenType.ETH].id}
                            symbol="ETH"
                          />
                          <span className="text-sm text-muted-foreground">
                            Balance: {loading ? "Loading..." : balances.eth}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Price Charts */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    {Object.entries(TOKEN_MAPPINGS).map(
                      ([token, { id, color }]) => (
                        <PriceChart
                          key={id}
                          tokenId={id}
                          name={TokenType[token as unknown as TokenType]}
                          color={color}
                        />
                      ),
                    )}
                  </div>
                </>
              )}

              {activeTab === "stake" && <StakingInterface />}
              {activeTab === "kyc" && <KYCStatus />}
              {activeTab === "activity" && <ActivityLogPanel />}
              {activeTab === "notifications" && <NotificationSettingsPanel />}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
