'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { HumanAttentionItem } from '@/lib/types/official';
import { AlertOctagon, Check, X, Edit3, ShieldAlert, CheckCircle2 } from 'lucide-react';

interface HumanAttentionPanelProps {
  items: HumanAttentionItem[];
}

export const HumanAttentionPanel: React.FC<HumanAttentionPanelProps> = ({ items: initialItems }) => {
  const [items, setItems] = useState<HumanAttentionItem[]>(initialItems);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  const handleAction = (itemId: string, decision: 'APPROVED' | 'REJECTED' | 'MODIFIED') => {
    setItems((prev) => prev.filter((i) => i.id !== itemId));
    setActionFeedback(`Action ${decision.toLowerCase()} successfully. Operation updated in EOC control loop.`);
    setTimeout(() => setActionFeedback(null), 4000);
  };

  return (
    <Card className="border-slate-200 bg-white">
      <CardHeader className="bg-slate-50/50 p-5 border-b border-slate-100 flex flex-row items-center justify-between">
        <div className="space-y-1">
          <CardTitle className="flex items-center gap-2 text-slate-900 text-sm font-bold">
            <AlertOctagon className="w-4 h-4 text-amber-600" />
            Human Authority & Exceptional Approvals ({items.length})
          </CardTitle>
          <CardDescription>
            Out-of-bounds agent actions requiring explicit human command authorization.
          </CardDescription>
        </div>
        <Badge variant={items.length > 0 ? 'warning' : 'outline'}>
          {items.length > 0 ? 'Action Required' : 'All Clear'}
        </Badge>
      </CardHeader>

      <CardContent className="p-5 space-y-4 font-sans text-xs">
        {actionFeedback && (
          <div className="p-3 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-700 shrink-0" />
            <span>{actionFeedback}</span>
          </div>
        )}

        {items.length === 0 ? (
          <div className="p-6 text-center border border-dashed border-slate-200 rounded-md bg-slate-50 space-y-1">
            <CheckCircle2 size={24} className="mx-auto text-emerald-600 mb-1" />
            <span className="text-xs font-bold text-slate-800 uppercase block">No Exceptional Actions Pending</span>
            <p className="text-xs text-slate-500 font-sans">
              All routine response dispatches are executing autonomously within agent authority bounds.
            </p>
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-lg border border-amber-200 bg-amber-50/40 space-y-3 shadow-2xs"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-200/60 pb-2">
                <div className="flex items-center gap-2">
                  <Badge variant="warning" className="font-sans font-bold">
                    {item.riskLevel.replace('_', ' ')}
                  </Badge>
                  <h4 className="font-bold text-slate-900 text-xs">{item.title}</h4>
                </div>
                <div className="flex items-center gap-2 text-[11px] font-mono text-slate-500">
                  <span>Agent: <strong className="text-slate-800">{item.requestingAgent}</strong></span>
                  <span>•</span>
                  <span>{item.timestamp}</span>
                </div>
              </div>

              <div className="space-y-2 text-slate-800 text-xs">
                <div>
                  <span className="font-semibold text-slate-900 block">Proposed Action:</span>
                  <p className="text-slate-700 leading-normal">{item.proposedAction}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1 font-sans text-xs">
                  <div className="p-2.5 rounded bg-white border border-slate-200">
                    <span className="font-semibold text-slate-900 block text-[11px] uppercase">Reason:</span>
                    <p className="text-slate-700 leading-normal">{item.reason}</p>
                  </div>
                  <div className="p-2.5 rounded bg-white border border-slate-200">
                    <span className="font-semibold text-slate-900 block text-[11px] uppercase">Impact Assessment:</span>
                    <p className="text-slate-700 leading-normal">{item.impact}</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-amber-200/60">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleAction(item.id, 'MODIFIED')}
                  className="gap-1.5 text-slate-700 border-slate-300"
                >
                  <Edit3 size={13} />
                  Modify & Approve
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleAction(item.id, 'REJECTED')}
                  className="gap-1.5"
                >
                  <X size={13} />
                  Reject Action
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleAction(item.id, 'APPROVED')}
                  className="gap-1.5 bg-emerald-700 hover:bg-emerald-600 border-emerald-800 text-white"
                >
                  <Check size={13} />
                  Approve Action
                </Button>
              </div>
            </div>
          ))
        )}
      </CardContent>

      <CardFooter className="p-4 border-t border-slate-100 bg-slate-50/50 rounded-b-lg text-[11px] text-slate-500 font-sans">
        Routine dispatches execute autonomously without approval. Only out-of-bound exceptional actions appear here.
      </CardFooter>
    </Card>
  );
};
