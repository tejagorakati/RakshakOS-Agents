'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { PageHeader } from '@/components/official/PageHeader';
import { DetailModal, ModalContentData } from '@/components/official/DetailModal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { mockHumanApprovalsList } from '@/lib/mock/official-operations-data';
import { HumanAttentionItem } from '@/lib/types/official';
import { listApprovalRequests, decideApprovalRequest, ApprovalRequest } from '@/lib/api';
import {
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Filter,
  Check,
  X,
  Edit,
  AlertTriangle,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';

const DEMO_INCIDENT_ID = 'INC-DEMO-001';

export default function ExceptionsApprovalsPage() {
  const [approvalsList, setApprovalsList] = useState<HumanAttentionItem[]>(mockHumanApprovalsList);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedModalItem, setSelectedModalItem] = useState<HumanAttentionItem | null>(null);

  // Live volunteer approval requests from the backend
  const [volunteerApprovals, setVolunteerApprovals] = useState<ApprovalRequest[]>([]);
  const [isLoadingApprovals, setIsLoadingApprovals] = useState(false);
  const [decidingId, setDecidingId] = useState<string | null>(null);

  const loadVolunteerApprovals = useCallback(async () => {
    setIsLoadingApprovals(true);
    try {
      const res = await listApprovalRequests(DEMO_INCIDENT_ID);
      setVolunteerApprovals(res.approval_requests);
    } catch {
      // Non-fatal — section stays empty rather than breaking the page
    } finally {
      setIsLoadingApprovals(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadVolunteerApprovals();
  }, [loadVolunteerApprovals]);

  const handleVolunteerDecide = async (requestId: string, decision: 'approved' | 'rejected') => {
    setDecidingId(requestId);
    try {
      const res = await decideApprovalRequest(requestId, {
        official_id: 'EOC-OFFICIAL',
        decision,
      });
      setVolunteerApprovals((prev) =>
        prev.map((r) => (r.id === requestId ? res.approval_request : r)),
      );
    } catch {
      // Button re-enables on failure
    } finally {
      setDecidingId(null);
    }
  };

  // Handle Approve action
  const handleApprove = (id: string) => {
    setApprovalsList((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              status: 'APPROVED',
            }
          : item
      )
    );
  };

  // Handle Reject action
  const handleReject = (id: string) => {
    setApprovalsList((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              status: 'REJECTED',
            }
          : item
      )
    );
  };

  // Handle Modify action
  const handleModify = (id: string) => {
    setApprovalsList((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              status: 'MODIFIED',
            }
          : item
      )
    );
  };

  const filteredItems = approvalsList.filter((item) => {
    const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      item.title.toLowerCase().includes(q) ||
      item.proposedAction.toLowerCase().includes(q) ||
      item.requestingAgent.toLowerCase().includes(q) ||
      item.id.toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });

  const getRiskBadgeVariant = (risk: string): 'critical' | 'warning' | 'info' | 'default' => {
    switch (risk) {
      case 'HIGH_RISK':
        return 'critical';
      case 'OUT_OF_BOUNDS':
        return 'warning';
      case 'POLICY_OVERRIDE':
        return 'info';
      default:
        return 'default';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <Badge variant="success" className="text-xs uppercase flex items-center gap-1"><Check size={12} /> Approved</Badge>;
      case 'REJECTED':
        return <Badge variant="critical" className="text-xs uppercase flex items-center gap-1"><X size={12} /> Rejected</Badge>;
      case 'MODIFIED':
        return <Badge variant="warning" className="text-xs uppercase flex items-center gap-1"><Edit size={12} /> Modified</Badge>;
      default:
        return <Badge variant="critical" className="text-xs uppercase animate-pulse flex items-center gap-1"><Clock size={12} /> Pending Approval</Badge>;
    }
  };

  const getModalData = (item: HumanAttentionItem): ModalContentData => ({
    type: 'ALERT',
    title: item.title,
    subtitle: `Request ID: ${item.id} | Timestamp: ${item.timestamp}`,
    badgeText: item.riskLevel,
    badgeVariant: getRiskBadgeVariant(item.riskLevel),
    description: item.proposedAction,
    fields: [
      { label: 'Request ID', value: item.id, mono: true },
      { label: 'Requesting Agent', value: item.requestingAgent, mono: true },
      { label: 'Risk Category', value: item.riskLevel, mono: true },
      { label: 'Current Authorization Status', value: item.status, mono: true },
      { label: 'Operational Justification', value: item.reason },
      { label: 'Calculated Risk Impact', value: item.impact },
    ],
  });

  const pendingCount = approvalsList.filter((i) => i.status === 'PENDING').length;
  const approvedCount = approvalsList.filter((i) => i.status === 'APPROVED').length;
  const rejectedCount = approvalsList.filter((i) => i.status === 'REJECTED' || i.status === 'MODIFIED').length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 md:px-6 py-6 font-sans">
      {/* Page Header */}
      <PageHeader
        title="Exceptions & Human Approvals"
        subtitle="Command control authorization gate for high-risk, out-of-bounds, or policy override agent actions"
        scenarioName="Metro City Flood Response — Monsoon Emergency"
        regionLocation="North Command Sector"
        operationStatus="AUTHORIZATION GATE ACTIVE"
        lastUpdated="14:35:00"
      />

      {/* Top Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="p-4 border-slate-200 bg-white shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Pending Authorizations</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-extrabold text-amber-700 font-mono mt-1">{pendingCount}</p>
          <span className="text-[11px] text-amber-600 font-medium">Requires commander review</span>
        </Card>

        <Card className="p-4 border-slate-200 bg-white shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Approved Requests</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-extrabold text-emerald-700 font-mono mt-1">{approvedCount}</p>
          <span className="text-[11px] text-emerald-600 font-medium">Authorized by human</span>
        </Card>

        <Card className="p-4 border-slate-200 bg-white shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Rejected / Modified</span>
            <XCircle className="w-4 h-4 text-slate-500" />
          </div>
          <p className="text-2xl font-extrabold text-slate-800 font-mono mt-1">{rejectedCount}</p>
          <span className="text-[11px] text-slate-500">Overridden or adjusted</span>
        </Card>

        <Card className="p-4 border-slate-200 bg-white shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Control Protocol</span>
            <ShieldAlert className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 font-mono mt-1">Active</p>
          <span className="text-[11px] text-blue-700 font-medium">Human-in-the-loop enabled</span>
        </Card>
      </div>

      {/* Filter & Search Bar */}
      <Card className="p-4 border-slate-200 bg-white shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search approval requests by title, agent ID, or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/20"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
            <span className="text-slate-400 text-[11px] font-bold uppercase tracking-wider mr-1 flex items-center gap-1">
              <Filter size={12} /> Status:
            </span>
            {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-lg font-semibold text-xs cursor-pointer ${
                  statusFilter === status
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Approvals Queue */}
      <div className="space-y-4">
        {filteredItems.length === 0 ? (
          <Card className="p-8 text-center border-slate-200 bg-white space-y-2">
            <CheckCircle2 className="w-8 h-8 text-slate-400 mx-auto" />
            <h4 className="text-sm font-bold text-slate-800">No Exception Requests Found</h4>
            <p className="text-xs text-slate-500">No approval items match your selected filter.</p>
          </Card>
        ) : (
          filteredItems.map((item) => (
            <Card
              key={item.id}
              className={`p-5 border bg-white shadow-2xs space-y-4 transition-all ${
                item.status === 'PENDING'
                  ? 'border-amber-300 ring-1 ring-amber-200'
                  : 'border-slate-200'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                    {item.id}
                  </span>
                  <Badge variant={getRiskBadgeVariant(item.riskLevel)} className="text-xs uppercase">
                    {item.riskLevel}
                  </Badge>
                  {getStatusBadge(item.status)}
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 font-mono">
                    Requested by <strong className="text-slate-900">{item.requestingAgent}</strong> at {item.timestamp}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedModalItem(item)}
                    className="text-xs text-slate-700 hover:bg-slate-100 h-7 px-2 cursor-pointer"
                  >
                    Full Analysis
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-base font-bold text-slate-900">{item.title}</h3>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs leading-relaxed space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Proposed Action:</span>
                  <p className="text-slate-900 font-medium">{item.proposedAction}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-amber-50/50 rounded-lg border border-amber-200/60 space-y-1">
                  <span className="text-[10px] font-bold text-amber-800 uppercase block">Operational Reason:</span>
                  <p className="text-amber-950 font-medium">{item.reason}</p>
                </div>

                <div className="p-3 bg-blue-50/50 rounded-lg border border-blue-200/60 space-y-1">
                  <span className="text-[10px] font-bold text-blue-800 uppercase block">Impact Assessment:</span>
                  <p className="text-blue-950 font-medium">{item.impact}</p>
                </div>
              </div>

              {/* Command Decision Buttons */}
              <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                <div className="text-xs text-slate-500 font-sans">
                  {item.status === 'PENDING' ? (
                    <span className="text-amber-700 font-semibold flex items-center gap-1">
                      <AlertTriangle size={13} /> Requires official authorization to execute.
                    </span>
                  ) : (
                    <span className="text-slate-700 font-semibold flex items-center gap-1">
                      <CheckCircle2 size={13} className="text-emerald-600" /> Decision recorded by Command Authority.
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {item.status === 'PENDING' ? (
                    <>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleApprove(item.id)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3 h-8 cursor-pointer flex items-center gap-1.5"
                      >
                        <Check size={14} /> Approve Action
                      </Button>

                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleReject(item.id)}
                        className="font-bold text-xs px-3 h-8 cursor-pointer flex items-center gap-1.5"
                      >
                        <X size={14} /> Reject Action
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleModify(item.id)}
                        className="text-slate-700 font-semibold text-xs px-3 h-8 cursor-pointer flex items-center gap-1.5"
                      >
                        <Edit size={13} /> Modify Parameters
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setApprovalsList((prev) =>
                          prev.map((i) => (i.id === item.id ? { ...i, status: 'PENDING' } : i))
                        )
                      }
                      className="text-xs text-slate-600 hover:bg-slate-100 h-8 px-3 cursor-pointer"
                    >
                      Reset Decision
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Live Volunteer Resource Approval Requests */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-600" />
            Volunteer Resource Approval Requests
            <Badge variant="outline" className="text-xs font-mono ml-1">LIVE</Badge>
          </h2>
          <button
            type="button"
            onClick={loadVolunteerApprovals}
            disabled={isLoadingApprovals}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw size={12} className={isLoadingApprovals ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>

        {isLoadingApprovals && volunteerApprovals.length === 0 ? (
          <Card className="p-5 border-slate-200 bg-white shadow-2xs">
            <div className="flex items-center gap-2 text-slate-500 text-xs">
              <RefreshCw size={13} className="animate-spin shrink-0" />
              <span>Loading volunteer approval requests…</span>
            </div>
          </Card>
        ) : volunteerApprovals.length === 0 ? (
          <Card className="p-6 text-center border-slate-200 bg-white shadow-2xs space-y-1">
            <CheckCircle2 className="w-7 h-7 text-slate-300 mx-auto" />
            <p className="text-xs text-slate-500">No volunteer resource requests for this incident.</p>
          </Card>
        ) : (
          volunteerApprovals.map((req) => (
            <Card
              key={req.id}
              className={`p-4 border bg-white shadow-2xs space-y-3 transition-all ${
                req.status === 'pending'
                  ? 'border-amber-300 ring-1 ring-amber-200'
                  : 'border-slate-200'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                    {req.id}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase ${
                    req.status === 'approved'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : req.status === 'rejected'
                      ? 'bg-rose-100 text-rose-800 border border-rose-300'
                      : 'bg-amber-100 text-amber-800 border border-amber-300'
                  }`}>
                    {req.status}
                  </span>
                </div>
                <span className="text-[11px] text-slate-500 font-mono">
                  Requester: <strong className="text-slate-800">{req.requester_id}</strong>
                  {' · '}
                  {new Date(req.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              <div className="space-y-1 text-xs">
                <p className="font-bold text-slate-900">{req.item}</p>
                {req.details && (
                  <p className="text-slate-600 leading-relaxed">{req.details}</p>
                )}
              </div>

              {req.decided_at && (
                <p className="text-[11px] text-slate-500 font-mono">
                  Decided: {new Date(req.decided_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  {req.official_id ? ` · by ${req.official_id}` : ''}
                </p>
              )}

              {req.status === 'pending' && (
                <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                  <button
                    type="button"
                    disabled={decidingId === req.id}
                    onClick={() => handleVolunteerDecide(req.id, 'approved')}
                    className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold disabled:opacity-50 cursor-pointer transition-colors flex items-center gap-1.5"
                  >
                    <Check size={13} /> {decidingId === req.id ? '…' : 'Approve'}
                  </button>
                  <button
                    type="button"
                    disabled={decidingId === req.id}
                    onClick={() => handleVolunteerDecide(req.id, 'rejected')}
                    className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold disabled:opacity-50 cursor-pointer transition-colors flex items-center gap-1.5"
                  >
                    <X size={13} /> {decidingId === req.id ? '…' : 'Reject'}
                  </button>
                </div>
              )}
            </Card>
          ))
        )}
      </div>

      {/* Modal Inspector */}
      {selectedModalItem && (
        <DetailModal
          isOpen={!!selectedModalItem}
          onClose={() => setSelectedModalItem(null)}
          data={getModalData(selectedModalItem)}
        />
      )}
    </div>
  );
}
