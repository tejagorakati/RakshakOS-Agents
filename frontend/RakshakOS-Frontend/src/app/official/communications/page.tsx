'use client';

import React, { useState } from 'react';
import { PageHeader } from '@/components/official/PageHeader';
import { DetailModal, ModalContentData } from '@/components/official/DetailModal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  mockContactsDirectory,
  mockBroadcastFeed,
  DetailedContact,
  OperationalBroadcastMessage,
} from '@/lib/mock/official-operations-data';
import {
  Radio,
  Phone,
  Send,
  Search,
  Filter,
  Users,
  MapPin,
  CheckCircle2,
  Megaphone,
  ShieldCheck,
} from 'lucide-react';

export default function CommunicationsPage() {
  const [contactsList] = useState<DetailedContact[]>(mockContactsDirectory);
  const [broadcastFeed, setBroadcastFeed] = useState<OperationalBroadcastMessage[]>(mockBroadcastFeed);

  // Contact filters
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [contactSearch, setContactSearch] = useState<string>('');

  // Broadcast Form state
  const [selectedAudience, setSelectedAudience] = useState<string>('All Response Teams & Coordinators');
  const [broadcastText, setBroadcastText] = useState<string>('');
  const [dispatchSuccessNotice, setDispatchSuccessNotice] = useState<boolean>(false);

  // Modal inspection
  const [selectedModalContact, setSelectedModalContact] = useState<DetailedContact | null>(null);

  const filteredContacts = contactsList.filter((contact) => {
    const matchesCategory = categoryFilter === 'ALL' || contact.category === categoryFilter;
    const q = contactSearch.toLowerCase().trim();
    const matchesSearch =
      !q ||
      contact.name.toLowerCase().includes(q) ||
      contact.organization.toLowerCase().includes(q) ||
      contact.contactPerson.toLowerCase().includes(q) ||
      contact.radioFrequency.toLowerCase().includes(q) ||
      contact.currentLocation.toLowerCase().includes(q);
    return matchesCategory && matchesSearch;
  });

  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastText.trim()) return;

    const newBroadcast: OperationalBroadcastMessage = {
      id: `bcast-${Date.now().toString().slice(-4)}`,
      audience: selectedAudience,
      message: broadcastText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      sender: 'EOC Command Desk',
      status: 'DISPATCHED',
    };

    setBroadcastFeed([newBroadcast, ...broadcastFeed]);
    setBroadcastText('');
    setDispatchSuccessNotice(true);
    setTimeout(() => setDispatchSuccessNotice(false), 4000);
  };

  const getContactModalData = (contact: DetailedContact): ModalContentData => ({
    type: 'TEAM',
    title: contact.name,
    subtitle: contact.organization,
    badgeText: contact.availability,
    badgeVariant: contact.availability === 'ON_SITE' || contact.availability === 'EN_ROUTE' ? 'critical' : 'success',
    description: `Current Mission: ${contact.currentMission}`,
    fields: [
      { label: 'Organization', value: contact.organization },
      { label: 'Category', value: contact.category, mono: true },
      { label: 'Point of Contact', value: contact.contactPerson },
      { label: 'Phone Line', value: contact.phone, mono: true },
      { label: 'Radio Frequency', value: contact.radioFrequency, mono: true },
      { label: 'Current Sector Location', value: contact.currentLocation },
      { label: 'Operational Availability', value: contact.availability, mono: true },
    ],
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 md:px-6 py-6 font-sans">
      {/* Page Header */}
      <PageHeader
        title="Official Communications & Directory"
        subtitle="External response team phone/radio directory, inter-agency contacts, and operational broadcast dispatch"
        scenarioName="Metro City Flood Response — Monsoon Emergency"
        regionLocation="North Command Sector"
        operationStatus="DISPATCH & DIRECTORY ACTIVE"
        lastUpdated="14:35:00"
      />

      {/* Important Communication Channel Notice */}
      <Card className="p-4 border-blue-200 bg-blue-50/70 text-blue-950 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <Radio className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
          <div className="space-y-0.5 text-xs">
            <span className="font-bold text-blue-900 uppercase tracking-wider block">
              External Communication Protocol Active:
            </span>
            <p className="text-blue-900 leading-relaxed font-sans">
              Direct external radio channels and phone contact details are maintained below. All tactical team coordination relies on external voice radio nets and broadcast dispatches.
            </p>
          </div>
        </div>
        <span className="text-[11px] font-mono font-bold bg-blue-100 text-blue-900 px-3 py-1 rounded border border-blue-300 shrink-0">
          EOC Frequency: CH-01 156.800 MHz
        </span>
      </Card>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="p-4 border-slate-200 bg-white shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Radio Nets Active</span>
            <Radio className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 font-mono mt-1">4 Nets</p>
          <span className="text-[11px] text-slate-600 font-medium">CH-01, CH-02, CH-04, CH-08</span>
        </Card>

        <Card className="p-4 border-slate-200 bg-white shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Registered Directory</span>
            <Users className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 font-mono mt-1">{mockContactsDirectory.length}</p>
          <span className="text-[11px] text-slate-600 font-medium">Verified field contacts</span>
        </Card>

        <Card className="p-4 border-slate-200 bg-white shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Broadcast Messages</span>
            <Megaphone className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-2xl font-extrabold text-purple-700 font-mono mt-1">{broadcastFeed.length}</p>
          <span className="text-[11px] text-purple-700 font-medium">Dispatched directives</span>
        </Card>

        <Card className="p-4 border-slate-200 bg-white shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Comms Desk</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-extrabold text-emerald-700 font-mono mt-1">Online</p>
          <span className="text-[11px] text-emerald-600 font-medium">Central EOC Dispatch</span>
        </Card>
      </div>

      {/* 2-Column Grid: Broadcast Form & Directory */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (1 col): Operational Broadcast Panel */}
        <div className="space-y-6">
          <Card className="p-5 border-slate-200 bg-white shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-blue-600" /> Operational Broadcast Dispatch
              </h3>
              <Badge variant="info" className="text-xs font-mono">
                ANNOUNCE
              </Badge>
            </div>

            {dispatchSuccessNotice && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-lg text-xs font-semibold flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                <span>Broadcast successfully dispatched to all target channels!</span>
              </div>
            )}

            <form onSubmit={handleSendBroadcast} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block uppercase tracking-wider">
                  Target Audience:
                </label>
                <select
                  value={selectedAudience}
                  onChange={(e) => setSelectedAudience(e.target.value)}
                  className="w-full text-xs p-2 border border-slate-300 rounded-lg bg-slate-50 font-sans focus:ring-2 focus:ring-slate-900/20"
                >
                  <option value="All Response Teams & Coordinators">All Response Teams & Coordinators</option>
                  <option value="Medical Units">Medical Units</option>
                  <option value="Sector Field Coordinators">Sector Field Coordinators</option>
                  <option value="Public Advisory Broadcast">Public Advisory Broadcast</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block uppercase tracking-wider">
                  Broadcast Directive Message:
                </label>
                <textarea
                  rows={4}
                  value={broadcastText}
                  onChange={(e) => setBroadcastText(e.target.value)}
                  placeholder="Enter operational advisory, route closure notice, or emergency directive..."
                  className="w-full p-3 text-xs border border-slate-300 rounded-lg font-sans focus:ring-2 focus:ring-slate-900/20 resize-none"
                  required
                />
              </div>

              <Button
                type="submit"
                variant="default"
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-2.5 cursor-pointer flex items-center justify-center gap-2"
              >
                <Send size={14} /> Send Operational Broadcast
              </Button>
            </form>
          </Card>

          {/* Broadcast Feed Stream */}
          <Card className="p-5 border-slate-200 bg-white shadow-2xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
              Recent Broadcast Dispatches ({broadcastFeed.length})
            </h3>
            <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
              {broadcastFeed.map((bcast) => (
                <div
                  key={bcast.id}
                  className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between text-slate-500 font-mono text-[11px]">
                    <span className="font-bold text-slate-800">{bcast.audience}</span>
                    <span>{bcast.timestamp}</span>
                  </div>
                  <p className="text-slate-900 font-medium leading-relaxed">{bcast.message}</p>
                  <div className="flex justify-between items-center text-[10px] text-slate-500 pt-1">
                    <span>Sender: {bcast.sender}</span>
                    <span className="font-mono text-emerald-600 font-bold">STATUS: DISPATCHED</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Column (2 cols): Contact Directory */}
        <div className="lg:col-span-2 space-y-4">
          {/* Filter & Search Bar */}
          <Card className="p-4 border-slate-200 bg-white shadow-2xs space-y-3">
            <div className="flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search contact directory by name, organization, contact person, or frequency..."
                  value={contactSearch}
                  onChange={(e) => setContactSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/20"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
                <span className="text-slate-400 text-[11px] font-bold uppercase tracking-wider mr-1 flex items-center gap-1">
                  <Filter size={12} /> Category:
                </span>
                {['ALL', 'RESPONSE_TEAMS', 'AGENCIES', 'NGO_COORDINATORS'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={`px-3 py-1.5 rounded-lg font-semibold text-xs cursor-pointer ${
                      categoryFilter === cat
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {cat.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>
          </Card>

          {/* Contacts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredContacts.map((contact) => (
              <Card
                key={contact.id}
                className="p-4 border-slate-200 bg-white hover:border-slate-300 transition-all shadow-2xs space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs uppercase font-mono">
                        {contact.category.replace('_', ' ')}
                      </Badge>
                      <Badge
                        variant={
                          contact.availability === 'ON_SITE' || contact.availability === 'EN_ROUTE'
                            ? 'critical'
                            : 'success'
                        }
                        className="text-xs uppercase"
                      >
                        {contact.availability}
                      </Badge>
                    </div>
                    <h3 className="text-base font-bold text-slate-900 mt-1">{contact.name}</h3>
                    <p className="text-xs text-slate-500 font-medium">{contact.organization}</p>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedModalContact(contact)}
                    className="text-xs text-slate-700 hover:bg-slate-100 cursor-pointer shrink-0"
                  >
                    Details
                  </Button>
                </div>

                <div className="space-y-1.5 text-xs bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-500 uppercase font-bold">Contact Leader:</span>
                    <span className="font-bold text-slate-900">{contact.contactPerson}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-500 uppercase font-bold flex items-center gap-1">
                      <Phone size={11} className="text-slate-400" /> Phone Line:
                    </span>
                    <a
                      href={`tel:${contact.phone}`}
                      className="font-mono font-bold text-blue-700 hover:underline"
                    >
                      {contact.phone}
                    </a>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-500 uppercase font-bold flex items-center gap-1">
                      <Radio size={11} className="text-slate-400" /> Radio Frequency:
                    </span>
                    <span className="font-mono font-bold text-slate-900 bg-white px-1.5 py-0.5 rounded border border-slate-200 text-[11px]">
                      {contact.radioFrequency}
                    </span>
                  </div>
                </div>

                <div className="space-y-1 text-xs pt-0.5">
                  <div className="flex items-center gap-1 text-slate-600">
                    <MapPin size={12} className="text-slate-400" />
                    <span>
                      <strong className="text-slate-800">Location:</strong> {contact.currentLocation}
                    </span>
                  </div>
                  <div className="flex items-start gap-1 text-slate-600">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mt-0.5">
                      Mission:
                    </span>
                    <span className="text-slate-800 font-medium">{contact.currentMission}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Modal Inspector */}
      {selectedModalContact && (
        <DetailModal
          isOpen={!!selectedModalContact}
          onClose={() => setSelectedModalContact(null)}
          data={getContactModalData(selectedModalContact)}
        />
      )}
    </div>
  );
}
