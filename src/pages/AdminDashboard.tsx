import React, { useEffect, useState } from 'react';
import { Navigate, Link, Routes, Route } from 'react-router-dom';
import { useWeb3 } from '@/contexts/Web3Context';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Logo } from '@/components/ui/logo';
import { AnalyticsChart } from '@/components/ui/analytics-chart';
import { PoolMetrics } from '@/components/ui/pool-metrics';
import { toast } from 'sonner';
import { kycService, VerificationStatus } from '@/lib/kyc-service';
import { notificationService } from '@/lib/notification-service';
import { 
  UserCheck, AlertTriangle, Search, Filter, RefreshCw,
  LayoutDashboard, Users, Settings, Activity
} from 'lucide-react';

const ADMIN_ADDRESSES = [
  "0x1234567890123456789012345678901234567890", // Replace with actual admin addresses
];

const RISK_LEVELS = [
  { value: 0, label: 'Low Risk' },
  { value: 1, label: 'Medium-Low Risk' },
  { value: 2, label: 'Medium Risk' },
  { value: 3, label: 'Medium-High Risk' },
  { value: 4, label: 'High Risk' },
  { value: 5, label: 'Very High Risk' }
];

function KYCDashboard() {
  const [pendingVerifications, setPendingVerifications] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<VerificationStatus | 'all'>('all');
  const [loading, setLoading] = useState(false);

  const loadVerifications = async () => {
    try {
      setLoading(true);
      const verifications = await kycService.getAllVerifications();
      setPendingVerifications(verifications);
    } catch (error) {
      console.error('Failed to load verifications:', error);
      toast.error('Failed to load verification requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVerifications();
  }, []);

  const handleVerificationAction = async (userId: string, status: VerificationStatus, riskLevel?: number) => {
    try {
      await kycService.updateVerificationStatus(userId, status, riskLevel);

      // Get user's notification settings
      const settings = await notificationService.getUserSettings(userId);
      
      if (settings?.kyc_status_updates && settings?.email) {
        // Send email notification based on status
        if (status === 'approved') {
          await notificationService.sendEmail(
            'kyc_approved',
            settings.email,
            'KYC Verification Approved',
            'Your KYC verification has been approved. You can now access all platform features.'
          );
        } else if (status === 'rejected') {
          await notificationService.sendEmail(
            'kyc_rejected',
            settings.email,
            'KYC Verification Rejected',
            'Your KYC verification has been rejected. Please review and resubmit your documents.'
          );
        }
      }

      toast.success(`Verification ${status} successfully`);
      loadVerifications();
    } catch (error) {
      console.error('Failed to update verification:', error);
      toast.error('Failed to update verification status');
    }
  };

  const filteredVerifications = pendingVerifications
    .filter(v => 
      (statusFilter === 'all' || v.status === statusFilter) &&
      (searchQuery === '' || 
        v.user_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.documents.some(d => 
          d.document_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          d.issuing_country?.toLowerCase().includes(searchQuery.toLowerCase())
        )
      )
    );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <UserCheck className="w-5 h-5 text-primary" />
              <h3 className="font-semibold">Pending Verifications</h3>
            </div>
            <p className="text-2xl font-bold">
              {pendingVerifications.filter(v => v.status === 'pending').length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
              <h3 className="font-semibold">High Risk Users</h3>
            </div>
            <p className="text-2xl font-bold">
              {pendingVerifications.filter(v => v.risk_level >= 4).length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <UserCheck className="w-5 h-5 text-green-500" />
              <h3 className="font-semibold">Approved Today</h3>
            </div>
            <p className="text-2xl font-bold">
              {pendingVerifications.filter(v => 
                v.status === 'approved' && 
                new Date(v.verification_date).toDateString() === new Date().toDateString()
              ).length}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold">KYC Verifications</h2>
            <Button variant="outline" onClick={loadVerifications}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>

          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by user ID, document number, or country..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={(value: VerificationStatus | 'all') => setStatusFilter(value)}
            >
              <SelectTrigger className="w-[180px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in_review">In Review</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User ID</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Risk Level</TableHead>
                  <TableHead>Documents</TableHead>
                  <TableHead>Submission Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVerifications.map((verification) => (
                  <TableRow key={verification.id}>
                    <TableCell className="font-mono">
                      {verification.user_id.slice(0, 6)}...{verification.user_id.slice(-4)}
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium
                        ${verification.status === 'approved' ? 'bg-green-100 text-green-800' :
                        verification.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        verification.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        verification.status === 'in_review' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'}`}>
                        {verification.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={verification.risk_level.toString()}
                        onValueChange={(value) => handleVerificationAction(
                          verification.user_id,
                          verification.status,
                          parseInt(value)
                        )}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {RISK_LEVELS.map((level) => (
                            <SelectItem key={level.value} value={level.value.toString()}>
                              {level.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {verification.documents.map((doc) => (
                          <div key={doc.id} className="text-sm">
                            {doc.document_type}
                            {doc.document_number && ` - ${doc.document_number}`}
                          </div>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      {new Date(verification.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleVerificationAction(verification.user_id, 'approved')}
                          disabled={verification.status === 'approved'}
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleVerificationAction(verification.user_id, 'rejected')}
                          disabled={verification.status === 'rejected'}
                        >
                          Reject
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="pt-6">
            <h2 className="text-lg font-semibold mb-6">Verification Trends</h2>
            <AnalyticsChart
              data={[
                { date: '2025-03', approved: 150, rejected: 20, pending: 45 },
                { date: '2025-04', approved: 180, rejected: 25, pending: 55 },
                { date: '2025-05', approved: 220, rejected: 30, pending: 65 }
              ]}
              title="Monthly Verification Statistics"
            />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <h2 className="text-lg font-semibold mb-6">Risk Distribution</h2>
            <AnalyticsChart
              data={[
                { level: 'Low', count: 450 },
                { level: 'Medium', count: 280 },
                { level: 'High', count: 120 }
              ]}
              title="User Risk Levels"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function PoolDashboard() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Liquidity Pool Management</h2>
      <PoolMetrics />
    </div>
  );
}

export default function AdminDashboard() {
  const { account, connectWallet } = useWeb3();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (account) {
      const hasAccess = ADMIN_ADDRESSES.map(addr => addr.toLowerCase()).includes(account.toLowerCase());
      setIsAdmin(hasAccess);
      if (!hasAccess) {
        toast.error("Unauthorized access attempt");
      }
    }
  }, [account]);

  if (!account) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-[400px]">
          <CardContent className="pt-6">
            <div className="flex justify-center mb-6">
              <Logo />
            </div>
            <h1 className="text-2xl font-bold text-center mb-6">Admin Access</h1>
            <Button className="w-full" onClick={connectWallet}>
              Connect Wallet
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Logo />
              <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            </div>
            <div className="flex items-center gap-4">
              <p className="text-sm text-muted-foreground">
                Connected: {account.slice(0, 6)}...{account.slice(-4)}
              </p>
              <Button variant="outline" onClick={() => window.location.reload()}>
                Disconnect
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex">
        <div className="w-64 border-r min-h-[calc(100vh-4rem)] p-4">
          <nav className="space-y-2">
            <Link to="/admin">
              <Button variant="ghost" className="w-full justify-start">
                <LayoutDashboard className="w-4 h-4 mr-2" />
                Overview
              </Button>
            </Link>
            <Link to="/admin/kyc">
              <Button variant="ghost" className="w-full justify-start">
                <Users className="w-4 h-4 mr-2" />
                KYC Verification
              </Button>
            </Link>
            <Link to="/admin/pool">
              <Button variant="ghost" className="w-full justify-start">
                <Activity className="w-4 h-4 mr-2" />
                Pool Management
              </Button>
            </Link>
            <Link to="/admin/settings">
              <Button variant="ghost" className="w-full justify-start">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
            </Link>
          </nav>
        </div>

        <div className="flex-1 p-6">
          <Routes>
            <Route path="/" element={<KYCDashboard />} />
            <Route path="/kyc" element={<KYCDashboard />} />
            <Route path="/pool" element={<PoolDashboard />} />
            <Route path="/settings" element={<div>Settings</div>} />
          </Routes>
        </div>
      </div>
    </div>
  );
}