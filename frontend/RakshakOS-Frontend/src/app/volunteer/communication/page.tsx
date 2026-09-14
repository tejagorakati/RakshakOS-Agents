'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { DetailModal, ModalContentData } from '@/components/official/DetailModal';
import { mockMissionMessages, mockVolunteerMission, MissionMessage } from '@/lib/mock/volunteer-operations-data';
import { useVolunteerSession } from '@/lib/volunteer-session';
import { getVolunteerSession } from '@/lib/volunteer-session';
import { getIncidentMessages, postIncidentMessage } from '@/lib/api';
import { MessageSquare, Send, Clock, RefreshCw } from 'lucide-react';

// Derives a senderType from the stored sender string for display badge colouring.
function inferSenderType(sender: string): MissionMessage['senderType'] {
  const s = sender.toLowerCase();
  if (s.includes('agent') || s.includes('system') || s.includes('dispatch') || s.includes('rakshak')) return 'AGENT';
  if (s.includes('leader') || s.includes('commander') || s.includes('eoc')) return 'LEADER';
  return 'VOLUNTEER';
}

/** Map a backend IncidentMessage to the MissionMessage shape the existing UI uses. */
function mapBackendMessage(m: { id: string; sender: string; message: string; created_at: string }): MissionMessage {
  const ts = new Date(m.created_at);
  const timestamp = isNaN(ts.getTime())
    ? m.created_at.slice(11, 16)
    : ts.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return {
    id: m.id,
    sender: m.sender,
    senderType: inferSenderType(m.sender),
    message: m.message,
    timestamp,
    relatedContext: undefined,
  };
}

export default function VolunteerCommunicationPage() {
  const { session } = useVolunteerSession();
  const [messages, setMessages] = useState<MissionMessage[]>(mockMissionMessages);
  const [isLive, setIsLive] = useState(false);
  const [messageInput, setMessageInput] = useState<string>('');
  const [isSending, setIsSending] = useState(false);
  const [selectedMessageModal, setSelectedMessageModal] = useState<MissionMessage | null>(null);

  // Resolve the incident ID the same way report-situation does.
  const incidentId = (() => {
    const s = getVolunteerSession();
    return s?.currentIncidentId ?? mockVolunteerMission.incidentId;
  })();

  const loadMessages = useCallback(async () => {
    try {
      const res = await getIncidentMessages(incidentId);
      if (res.messages.length > 0) {
        // Most-recent first, consistent with local mock order
        setMessages([...res.messages].reverse().map(mapBackendMessage));
        setIsLive(true);
      }
    } catch {
      // Backend unavailable — keep mock data silently
    }
  }, [incidentId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadMessages();
  }, [loadMessages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim()) return;

    const senderName = session?.fullName ? `${session.fullName} (You)` : 'Volunteer (You)';
    const optimisticMsg: MissionMessage = {
      id: `msg-${Date.now().toString().slice(-4)}`,
      sender: senderName,
      senderType: 'VOLUNTEER',
      message: messageInput.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      relatedContext: 'Field Response Update',
    };

    setIsSending(true);
    const text = messageInput.trim();
    setMessageInput('');

    try {
      await postIncidentMessage(incidentId, { sender: senderName, message: text });
      // Reload to get the server-assigned ID and any new messages
      await loadMessages();
    } catch {
      // API failure — keep optimistic entry in local state
      setMessages((prev) => [optimisticMsg, ...prev]);
    } finally {
      setIsSending(false);
    }
  };

  const getMessageBadgeVariant = (type: string): 'critical' | 'info' | 'success' => {
    switch (type) {
      case 'AGENT':
        return 'critical';
      case 'LEADER':
        return 'info';
      default:
        return 'success';
    }
  };

  const getMessageModalData = (msg: MissionMessage): ModalContentData => ({
    type: 'ALERT',
    title: `Mission Message: ${msg.sender}`,
    subtitle: `Timestamp: ${msg.timestamp}`,
    badgeText: msg.senderType,
    badgeVariant: getMessageBadgeVariant(msg.senderType),
    description: msg.message,
    fields: [
      { label: 'Sender', value: msg.sender },
      { label: 'Sender Category', value: msg.senderType, mono: true },
      { label: 'Timestamp', value: msg.timestamp, mono: true },
      { label: 'Operational Context', value: msg.relatedContext || 'General Directive' },
      { label: 'Associated Mission', value: mockVolunteerMission.id, mono: true },
    ],
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 md:px-6 py-6 font-sans">
      {/* Header */}
      <Card className="p-5 md:p-6 border-slate-200 bg-white shadow-2xs space-y-4 rounded-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className="border-slate-300 text-slate-800 font-semibold bg-slate-50">
              <MessageSquare className="w-3.5 h-3.5 mr-1 text-slate-700 inline" />
              MISSION COMMUNICATIONS
            </Badge>
            <Badge variant="info" className="text-xs font-mono">
              CHANNEL: MSN-018
            </Badge>
          </div>

          <span className="text-xs text-slate-500 font-mono">
            Rescue Team Alpha Tactical Net
          </span>
        </div>

        <div className="space-y-1">
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Mission Directive Stream
          </h1>
          <p className="text-xs md:text-sm text-slate-600 font-sans">
            Tactical team updates, route directives, and field messages for Mission <strong className="text-slate-800">MSN-018</strong>.
          </p>
        </div>
      </Card>

      {/* 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (1 col): Send Message Panel */}
        <Card className="p-5 border-slate-200 bg-white shadow-2xs space-y-4 rounded-xl">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Send className="w-4 h-4 text-blue-600" /> Send Field Message
            </h2>
            <p className="text-xs text-slate-500">
              Transmit tactical field update to Rescue Team Alpha members.
            </p>
          </div>

          <form onSubmit={handleSendMessage} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Message Content *
              </label>
              <textarea
                rows={4}
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder="Enter field update, position report, or status note..."
                className="w-full p-3 text-xs border border-slate-300 rounded-lg font-sans focus:ring-2 focus:ring-slate-900/20 resize-none"
                required
              />
            </div>

            <Button
              type="submit"
              disabled={isSending}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-2.5 cursor-pointer flex items-center justify-center gap-2 shadow-2xs disabled:opacity-60"
            >
              <Send size={14} /> {isSending ? 'Sending…' : 'Send Message to Channel'}
            </Button>
          </form>
        </Card>

        {/* Right Column (2 cols): Message Feed */}
        <Card className="lg:col-span-2 p-5 border-slate-200 bg-white shadow-2xs space-y-4 rounded-xl">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">
              Mission Directives Feed ({messages.length})
            </h3>
            <div className="flex items-center gap-2">
              {isLive && (
                <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> LIVE
                </span>
              )}
              <button
                type="button"
                onClick={loadMessages}
                className="flex items-center gap-1 text-[11px] font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
              >
                <RefreshCw size={11} /> Refresh
              </button>
              <Badge variant="outline" className="text-xs font-mono">
                LIVE BROADCAST
              </Badge>
            </div>
          </div>

          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
            {messages.map((msg) => (
              <div
                key={msg.id}
                onClick={() => setSelectedMessageModal(msg)}
                className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-2 hover:border-slate-300 transition-all cursor-pointer text-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{msg.sender}</span>
                    <Badge variant={getMessageBadgeVariant(msg.senderType)} className="text-[10px] uppercase font-mono">
                      {msg.senderType}
                    </Badge>
                  </div>
                  <span className="text-slate-500 font-mono text-[11px] flex items-center gap-1">
                    <Clock size={11} /> {msg.timestamp}
                  </span>
                </div>

                <p className="text-slate-900 font-medium leading-relaxed font-sans">{msg.message}</p>

                {msg.relatedContext && (
                  <div className="pt-1 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-200/60 font-mono">
                    <span>Context: {msg.relatedContext}</span>
                    <span className="text-blue-700 font-semibold">Inspect Detail →</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Message Modal */}
      {selectedMessageModal && (
        <DetailModal
          isOpen={!!selectedMessageModal}
          onClose={() => setSelectedMessageModal(null)}
          data={getMessageModalData(selectedMessageModal)}
        />
      )}
    </div>
  );
}
