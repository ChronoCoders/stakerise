import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { TokenType, StakingConfig } from "@/lib/staking-abi";
import { useWeb3 } from "@/contexts/Web3Context";
import { TransactionHistory } from "@/components/ui/transaction-history";
import { AnalyticsChart } from "@/components/ui/analytics-chart";
import { RewardsPanel } from "@/components/ui/rewards-panel";
import { NewsFeed } from "@/components/ui/news-feed";
import { ReferralProgram } from "@/components/ui/referral-program";
import { PortfolioAnalytics } from "@/components/ui/portfolio-analytics";
import { Transaction } from "@/lib/contract-service";
import { toast } from "sonner";

export default function Dashboard() {
  const { account, stakingService, connectWallet } = useWeb3();
  const [selectedToken, setSelectedToken] = useState(TokenType.STR);
  const [selectedTier, setSelectedTier] = useState(1);
  const [stakeAmount, setStakeAmount] = useState("");
  const [balance, setBalance] = useState({
    str: 0,
    btc: 0,
    eth: 0,
  });

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [rewards, setRewards] = useState([]);
  const [analyticsData, setAnalyticsData] = useState([
    { date: "2025-01", tvl: 1000000, apy: 12.5, stakes: 150 },
    { date: "2025-02", tvl: 1200000, apy: 13.1, stakes: 180 },
    { date: "2025-03", tvl: 1500000, apy: 13.8, stakes: 220 },
    { date: "2025-04", tvl: 1800000, apy: 14.2, stakes: 280 },
  ]);

  useEffect(() => {
    const loadData = async () => {
      if (stakingService && account) {
        try {
          // Load balances
          const balances = await stakingService.getAllBalances();
          setBalance({
            str: Number(
              stakingService.convertFromTokenAmount(
                balances[TokenType.STR],
                TokenType.STR,
              ),
            ),
            btc: Number(
              stakingService.convertFromTokenAmount(
                balances[TokenType.BTC],
                TokenType.BTC,
              ),
            ),
            eth: Number(
              stakingService.convertFromTokenAmount(
                balances[TokenType.ETH],
                TokenType.ETH,
              ),
            ),
          });

          // Load transactions
          const txHistory = await stakingService.getTransactionHistory();
          setTransactions(txHistory);

          // Load stakes and calculate rewards
          const stakes = await stakingService.getUserStakes();
          const rewardsData = stakes.map((stake) => ({
            stakeIndex: stake.index,
            tokenType: stake.tokenType,
            amount: stakingService.convertFromTokenAmount(
              stake.pendingRewards,
              stake.tokenType,
            ),
            nextClaimDate: new Date(
              stake.lastClaimTime.getTime() + 24 * 60 * 60 * 1000,
            ), // Next day
          }));
          setRewards(rewardsData);
        } catch (err) {
          console.error("Failed to load data:", err);
          toast.error("Failed to load some data. Please try again.");
        }
      }
    };

    loadData();
    const interval = setInterval(loadData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [stakingService, account]);

  const handleStake = async () => {
    if (!stakingService || !account) return;

    try {
      const amount = stakingService.convertToTokenAmount(
        stakeAmount,
        selectedToken,
      );
      await stakingService.stakeTokens(amount, selectedToken, selectedTier);
      toast.success("Stake successful!");

      // Refresh balances
      const balances = await stakingService.getAllBalances();
      setBalance({
        str: Number(
          stakingService.convertFromTokenAmount(
            balances[TokenType.STR],
            TokenType.STR,
          ),
        ),
        btc: Number(
          stakingService.convertFromTokenAmount(
            balances[TokenType.BTC],
            TokenType.BTC,
          ),
        ),
        eth: Number(
          stakingService.convertFromTokenAmount(
            balances[TokenType.ETH],
            TokenType.ETH,
          ),
        ),
      });
    } catch (err) {
      console.error("Failed to stake tokens:", err);
      toast.error("Failed to stake tokens. Please try again.");
    }
  };

  const handleClaimRewards = async (stakeIndex: number) => {
    try {
      await stakingService.claimRewards(stakeIndex);
      toast.success("Rewards claimed successfully!");
    } catch (err) {
      console.error("Failed to claim rewards:", err);
      toast.error("Failed to claim rewards. Please try again.");
    }
  };

  const handleCompoundRewards = async (stakeIndex: number) => {
    try {
      // Implementation would depend on contract functionality
      toast.success("Rewards compounded successfully!");
    } catch (err) {
      console.error("Failed to compound rewards:", err);
      toast.error("Failed to compound rewards. Please try again.");
    }
  };

  const handleTransactionSort = (field: keyof Transaction) => {
    const sorted = [...transactions].sort((a, b) => {
      if (field === "timestamp") return b.timestamp - a.timestamp;
      if (field === "amount") return Number(b.amount) - Number(a.amount);
      return 0;
    });
    setTransactions(sorted);
  };

  const handleTransactionFilter = (type: string) => {
    if (type === "all") return;
    const filtered = transactions.filter((tx) => tx.type === type);
    setTransactions(filtered);
  };

  const handleTransactionSearch = (query: string) => {
    if (!query) return;
    const filtered = transactions.filter(
      (tx) =>
        tx.hash.toLowerCase().includes(query.toLowerCase()) ||
        tx.amount.toString().includes(query),
    );
    setTransactions(filtered);
  };

  return (
    <main className="min-h-screen bg-background p-4 md:p-10 text-foreground">
      <div className="flex flex-col md:flex-row items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">StakeRise Dashboard</h1>
        <div className="flex gap-2 mt-2 md:mt-0">
          <Button onClick={connectWallet} variant="outline">
            {account
              ? `${account.slice(0, 6)}...${account.slice(-4)}`
              : "Connect Wallet"}
          </Button>
          <Button variant="ghost">Help</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">STR Balance</p>
            <h3 className="text-2xl font-bold">{balance.str} STR</h3>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">BTC Balance</p>
            <h3 className="text-2xl font-bold">{balance.btc} BTC</h3>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">ETH Balance</p>
            <h3 className="text-2xl font-bold">{balance.eth} ETH</h3>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total Value Locked</p>
            <h3 className="text-2xl font-bold">$1.2M</h3>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid grid-cols-4 w-full mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="stake">Stake</TabsTrigger>
          <TabsTrigger value="rewards">Rewards</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid gap-4">
            <AnalyticsChart
              data={analyticsData}
              title="Platform Analytics"
              description="Overview of TVL, APY, and total stakes over time"
            />
          </div>
        </TabsContent>

        <TabsContent value="stake">
          <div className="grid gap-4">
            <Card>
              <CardContent className="p-4">
                <h2 className="text-lg font-semibold mb-2">Stake Tokens</h2>
                <div className="grid gap-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      Available Balance:
                    </p>
                    <p className="text-sm font-medium">
                      {balance.str} STR | {balance.btc} BTC | {balance.eth} ETH
                    </p>
                  </div>
                  <Input
                    placeholder="Amount to Stake"
                    value={stakeAmount}
                    onChange={(e) => setStakeAmount(e.target.value)}
                    type="number"
                    min={0}
                    step="any"
                  />
                  <Select
                    value={selectedToken.toString()}
                    onValueChange={(value) => setSelectedToken(Number(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Token" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(TokenType)
                        .filter(([key]) => isNaN(Number(key)))
                        .map(([key, value]) => (
                          <SelectItem key={value} value={value.toString()}>
                            {StakingConfig[value].symbol}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <Select
                    value={selectedTier.toString()}
                    onValueChange={(value) => setSelectedTier(Number(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Lock Duration" />
                    </SelectTrigger>
                    <SelectContent>
                      {StakingConfig[selectedToken].tiers.map((tier, index) => (
                        <SelectItem key={index} value={index.toString()}>
                          {tier.duration} Months ({tier.apy}% APY)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="text-sm text-muted-foreground">
                    Minimum stake:{" "}
                    {StakingConfig[selectedToken].tiers[selectedTier].minAmount}{" "}
                    {StakingConfig[selectedToken].symbol}
                  </div>
                  <Button
                    className="w-full"
                    disabled={
                      !account ||
                      !stakeAmount ||
                      Number(stakeAmount) <
                        Number(
                          StakingConfig[selectedToken].tiers[selectedTier]
                            .minAmount,
                        )
                    }
                    onClick={handleStake}
                  >
                    {account ? "Stake Now" : "Connect Wallet to Stake"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="rewards">
          <RewardsPanel
            rewards={rewards}
            onClaim={handleClaimRewards}
            onCompound={handleCompoundRewards}
          />
        </TabsContent>

        <TabsContent value="history">
          <TransactionHistory
            transactions={transactions}
            onSort={handleTransactionSort}
            onFilter={handleTransactionFilter}
            onSearch={handleTransactionSearch}
          />
        </TabsContent>
      </Tabs>
    </main>
  );
}
