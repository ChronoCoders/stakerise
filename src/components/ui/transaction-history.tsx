import React from 'react';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Transaction } from '@/lib/contract-service';
import { StakingConfig, TokenType } from '@/lib/staking-abi';
import { ArrowUpDown, Search } from 'lucide-react';

interface TransactionHistoryProps {
  transactions: Transaction[];
  onSort: (field: keyof Transaction) => void;
  onFilter: (type: string) => void;
  onSearch: (query: string) => void;
}

export function TransactionHistory({ transactions, onSort, onFilter, onSearch }: TransactionHistoryProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Select defaultValue="all" onValueChange={onFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Transactions</SelectItem>
              <SelectItem value="stake">Stakes</SelectItem>
              <SelectItem value="unstake">Unstakes</SelectItem>
              <SelectItem value="claim">Claims</SelectItem>
            </SelectContent>
          </Select>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search transactions..."
              className="pl-9"
              onChange={(e) => onSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <Button variant="ghost" onClick={() => onSort('timestamp')} className="h-8 flex items-center gap-1">
                  Date <ArrowUpDown className="h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Token</TableHead>
              <TableHead>
                <Button variant="ghost" onClick={() => onSort('amount')} className="h-8 flex items-center gap-1">
                  Amount <ArrowUpDown className="h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Hash</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((tx) => (
              <TableRow key={tx.id}>
                <TableCell>{new Date(tx.timestamp).toLocaleString()}</TableCell>
                <TableCell className="capitalize">{tx.type}</TableCell>
                <TableCell>{StakingConfig[tx.tokenType].symbol}</TableCell>
                <TableCell>{tx.amount}</TableCell>
                <TableCell>
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    tx.status === 'completed' ? 'bg-green-100 text-green-800' :
                    tx.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {tx.status}
                  </span>
                </TableCell>
                <TableCell>
                  <a
                    href={`https://etherscan.io/tx/${tx.hash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline font-mono text-sm"
                  >
                    {tx.hash.slice(0, 6)}...{tx.hash.slice(-4)}
                  </a>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}