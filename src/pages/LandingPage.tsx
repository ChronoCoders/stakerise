import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AnimatedSection } from '@/components/ui/animated-section';
import { Logo } from '@/components/ui/logo';
import { PriceChart } from '@/components/ui/price-chart';
import { 
  ArrowRight, Shield, Clock, Coins, TrendingUp, 
  CheckCircle2, Users, Globe2, Lock, AlertTriangle
} from 'lucide-react';

const STAKING_OPTIONS = [
  {
    token: 'STR',
    durations: [
      { months: 12, apy: 12.5, minAmount: '500 STR', penalty: 15 },
      { months: 24, apy: 18, minAmount: '250 STR', penalty: 10 }
    ]
  },
  {
    token: 'BTC',
    durations: [
      { months: 6, apy: 5, minAmount: '0.1 BTC', penalty: 20 },
      { months: 12, apy: 7.5, minAmount: '0.05 BTC', penalty: 15 }
    ]
  },
  {
    token: 'ETH',
    durations: [
      { months: 6, apy: 6, minAmount: '1 ETH', penalty: 20 },
      { months: 12, apy: 9, minAmount: '0.5 ETH', penalty: 15 }
    ]
  },
  {
    token: 'LTC',
    durations: [
      { months: 6, apy: 5.5, minAmount: '5 LTC', penalty: 20 },
      { months: 12, apy: 8, minAmount: '2.5 LTC', penalty: 15 }
    ]
  },
  {
    token: 'USDT/USDC',
    durations: [
      { months: 6, apy: 6, minAmount: '1,000 USDT/USDC', penalty: 15 },
      { months: 12, apy: 8, minAmount: '500 USDT/USDC', penalty: 10 }
    ]
  }
];

export default function LandingPage() {
  const navigate = useNavigate();

  const stats = [
    {
      value: "$2.8B+",
      label: "Total Value Locked",
      sublabel: "in STR tokens"
    },
    {
      value: "185,000+",
      label: "Active Stakers",
      sublabel: "across 52 countries"
    },
    {
      value: "1.2B+",
      label: "STR Tokens Staked",
      sublabel: "48% of total supply"
    },
    {
      value: "$425M+",
      label: "Rewards Distributed",
      sublabel: "since launch"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Logo className="hover:opacity-80 transition-opacity cursor-pointer" onClick={() => navigate('/')} />
            <Button variant="outline" onClick={() => navigate('/user')}>
              Launch App
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/10 -z-10" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-5xl font-bold tracking-tight text-primary mb-6">
              Maximize Your Crypto Returns with StakeRise
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Secure, flexible, and rewarding staking platform for your digital assets. 
              Earn up to 18% APY on your favorite cryptocurrencies.
            </p>
            <Button 
              size="lg" 
              onClick={() => navigate('/user')}
              className="text-lg px-8 py-6 hover:scale-105 transition-transform"
            >
              Start Staking <ArrowRight className="ml-2" />
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Staking Options Section */}
      <div className="py-24 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <h2 className="text-3xl font-bold text-center mb-4">Staking Options</h2>
            <p className="text-center text-muted-foreground mb-16 max-w-2xl mx-auto">
              Choose from multiple staking durations with competitive APY rates. 
              Longer staking periods offer higher rewards and lower early unstaking penalties.
            </p>
          </AnimatedSection>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
            {STAKING_OPTIONS.map((option) => (
              <AnimatedSection key={option.token}>
                <Card className="h-full">
                  <CardContent className="pt-6">
                    <h3 className="text-2xl font-bold mb-6">{option.token}</h3>
                    <div className="space-y-6">
                      {option.durations.map((duration) => (
                        <div key={duration.months} className="p-4 rounded-lg bg-muted/50">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-semibold">{duration.months} Months</span>
                            <span className="text-primary font-bold">{duration.apy}% APY</span>
                          </div>
                          <div className="text-sm text-muted-foreground space-y-1">
                            <div className="flex justify-between">
                              <span>Minimum Stake:</span>
                              <span>{duration.minAmount}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="flex items-center gap-1">
                                <AlertTriangle className="w-4 h-4 text-yellow-500" />
                                Early Unstaking:
                              </span>
                              <span>{duration.penalty}% Penalty</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </div>

      {/* Price Chart Section */}
      <div className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <h2 className="text-3xl font-bold text-center mb-16">STR Token Performance</h2>
          </AnimatedSection>
          <div className="max-w-3xl mx-auto">
            <PriceChart tokenId="stakerise" name="STR" color="#8884d8" />
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <h2 className="text-3xl font-bold text-center mb-16">Why Choose StakeRise?</h2>
          </AnimatedSection>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Shield, title: "Secure Staking", description: "Enterprise-grade security with multi-signature wallets and regular audits" },
              { icon: Clock, title: "Flexible Duration", description: "Choose from 6, 12, or 24-month staking periods with competitive rewards" },
              { icon: Coins, title: "STR Token", description: "Stake STR tokens and earn rewards through our innovative platform" },
              { icon: TrendingUp, title: "High APY", description: "Earn up to 18% APY with our tiered reward system" }
            ].map((feature, index) => (
              <AnimatedSection key={feature.title} delay={index * 0.2}>
                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6">
                    <feature.icon className="w-12 h-12 text-primary mb-4" />
                    <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <h2 className="text-3xl font-bold text-center mb-16">How StakeRise Works</h2>
          </AnimatedSection>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: 1, title: "Connect Wallet", description: "Link your Web3 wallet to get started with staking" },
              { step: 2, title: "Choose Your Plan", description: "Select your preferred staking duration" },
              { step: 3, title: "Start Earning", description: "Watch your rewards grow with competitive APY rates" }
            ].map((item, index) => (
              <AnimatedSection key={item.step} delay={index * 0.2}>
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-primary">{item.step}</span>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-24 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <h2 className="text-3xl font-bold text-center mb-16">Platform Statistics</h2>
          </AnimatedSection>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <AnimatedSection key={stat.label} delay={index * 0.2}>
                <Card className="text-center p-6 hover:shadow-lg transition-all">
                  <CardContent className="p-0">
                    <p className="text-4xl font-bold text-primary mb-2">{stat.value}</p>
                    <p className="text-lg font-medium mb-1">{stat.label}</p>
                    <p className="text-sm text-muted-foreground">{stat.sublabel}</p>
                  </CardContent>
                </Card>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <h2 className="text-3xl font-bold text-center mb-16">Platform Benefits</h2>
          </AnimatedSection>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              { icon: CheckCircle2, title: "Automated Rewards", description: "Regular reward distributions directly to your wallet" },
              { icon: Users, title: "Community Driven", description: "Active community with governance participation" },
              { icon: Globe2, title: "Global Access", description: "Available worldwide with 24/7 staking support" },
              { icon: Lock, title: "Asset Security", description: "Multi-layer security with insurance coverage" }
            ].map((benefit, index) => (
              <AnimatedSection key={benefit.title} delay={index * 0.2}>
                <div className="flex items-start space-x-4">
                  <benefit.icon className="w-8 h-8 text-primary flex-shrink-0" />
                  <div>
                    <h3 className="text-xl font-semibold mb-2">{benefit.title}</h3>
                    <p className="text-muted-foreground">{benefit.description}</p>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-primary text-primary-foreground py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <AnimatedSection>
            <h2 className="text-3xl font-bold mb-8">Ready to Start Earning?</h2>
            <Button 
              variant="secondary" 
              size="lg"
              onClick={() => navigate('/user')}
              className="text-lg px-8 py-6 hover:scale-105 transition-transform"
            >
              Launch App <ArrowRight className="ml-2" />
            </Button>
          </AnimatedSection>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-background py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <Logo className="mb-4" />
              <p className="text-sm text-muted-foreground">
                The next generation of crypto staking
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Products</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="hover:text-primary cursor-pointer">Staking</li>
                <li className="hover:text-primary cursor-pointer">Rewards</li>
                <li className="hover:text-primary cursor-pointer">Analytics</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Resources</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="hover:text-primary cursor-pointer">Documentation</li>
                <li className="hover:text-primary cursor-pointer">FAQ</li>
                <li className="hover:text-primary cursor-pointer">Support</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="hover:text-primary cursor-pointer">Privacy Policy</li>
                <li className="hover:text-primary cursor-pointer">Terms of Service</li>
                <li className="hover:text-primary cursor-pointer">Compliance</li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-border text-center text-sm text-muted-foreground">
            <p>&copy; 2025 StakeRise. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}