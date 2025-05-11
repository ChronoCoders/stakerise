import React from 'react';
import { Card, CardContent } from './card';
import { Button } from './button';
import { Newspaper, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface NewsItem {
  id: string;
  title: string;
  summary: string;
  category: 'update' | 'market' | 'token' | 'community';
  date: string;
  url?: string;
}

const SAMPLE_NEWS: NewsItem[] = [
  {
    id: '1',
    title: 'StakeRise Platform Update v2.0',
    summary: 'New features including improved staking analytics and enhanced security measures',
    category: 'update',
    date: '2025-03-15'
  },
  {
    id: '2',
    title: 'STR Token Listed on Major Exchange',
    summary: 'StakeRise token now available for trading on leading cryptocurrency exchange',
    category: 'token',
    date: '2025-03-14'
  },
  {
    id: '3',
    title: 'Community Governance Proposal #12 Passed',
    summary: 'New staking tiers and reward structure approved by community vote',
    category: 'community',
    date: '2025-03-13'
  }
];

const categoryColors = {
  update: 'bg-blue-100 text-blue-800',
  market: 'bg-green-100 text-green-800',
  token: 'bg-purple-100 text-purple-800',
  community: 'bg-orange-100 text-orange-800'
};

export function NewsFeed() {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Newspaper className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold">Latest Updates</h2>
          </div>
          <Button variant="ghost" size="sm">
            View All <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </div>
        <div className="space-y-4">
          {SAMPLE_NEWS.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-4 rounded-lg border bg-card/50 hover:bg-card/80 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${categoryColors[item.category]}`}>
                      {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
                    </span>
                    <span className="text-sm text-muted-foreground">{item.date}</span>
                  </div>
                  <h3 className="font-medium mb-1">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.summary}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}