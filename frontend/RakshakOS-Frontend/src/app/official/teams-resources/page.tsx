'use client';

import React, { useState } from 'react';
import { PageHeader } from '@/components/official/PageHeader';
import { DetailModal, ModalContentData } from '@/components/official/DetailModal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  mockDetailedTeams,
  mockDetailedResources,
} from '@/lib/mock/official-operations-data';
import { ResponseTeamItem, ResourceItem } from '@/lib/types/official';
import {
  Users,
  Box,
  Search,
  Filter,
  MapPin,
  Activity,
  CheckCircle2,
} from 'lucide-react';

export default function TeamsResourcesPage() {
  const [activeTab, setActiveTab] = useState<'TEAMS' | 'RESOURCES'>('TEAMS');

  // Teams filter state
  const [teamStatusFilter, setTeamStatusFilter] = useState<string>('ALL');
  const [teamSearchQuery, setTeamSearchQuery] = useState<string>('');

  // Resources filter state
  const [resourceCategoryFilter, setResourceCategoryFilter] = useState<string>('ALL');
  const [resourceSearchQuery, setResourceSearchQuery] = useState<string>('');

  // Modal inspection state
  const [selectedModalTeam, setSelectedModalTeam] = useState<ResponseTeamItem | null>(null);
  const [selectedModalResource, setSelectedModalResource] = useState<ResourceItem | null>(null);

  // Filtered Teams
  const filteredTeams = mockDetailedTeams.filter((team) => {
    const matchesStatus = teamStatusFilter === 'ALL' || team.status === teamStatusFilter;
    const q = teamSearchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      team.name.toLowerCase().includes(q) ||
      team.code.toLowerCase().includes(q) ||
      team.type.toLowerCase().includes(q) ||
      team.location.toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });

  // Filtered Resources
  const filteredResources = mockDetailedResources.filter((res) => {
    const matchesCategory = resourceCategoryFilter === 'ALL' || res.category === resourceCategoryFilter;
    const q = resourceSearchQuery.toLowerCase().trim();
    const matchesSearch = !q || res.name.toLowerCase().includes(q) || res.category.toLowerCase().includes(q);
    return matchesCategory && matchesSearch;
  });

  const getTeamModalData = (team: ResponseTeamItem): ModalContentData => ({
    type: 'TEAM',
    title: `${team.name} (${team.code})`,
    subtitle: team.type,
    badgeText: team.status,
    badgeVariant: team.status === 'DEPLOYED' ? 'critical' : 'success',
    description: `Currently assigned to: ${team.currentAssignment}`,
    fields: [
      { label: 'Team Code', value: team.code, mono: true },
      { label: 'Team Type', value: team.type },
      { label: 'Personnel Count', value: `${team.membersCount} Responders` },
      { label: 'Current Sector Location', value: team.location },
      { label: 'Deployment Status', value: team.status, mono: true },
      { label: 'Primary Mission', value: team.currentAssignment },
    ],
    listItems: team.equipment.map((eq) => ({
      title: eq,
      detail: 'Assigned Gear Asset',
    })),
  });

  const getResourceModalData = (res: ResourceItem): ModalContentData => ({
    type: 'STAT_FILTER',
    title: res.name,
    subtitle: `Category: ${res.category}`,
    badgeText: res.status,
    badgeVariant: res.status === 'HIGH_DEMAND' ? 'warning' : 'success',
    description: `Inventory Utilization: ${res.deployedCount} of ${res.totalCount} ${res.unit} currently deployed.`,
    fields: [
      { label: 'Asset Name', value: res.name },
      { label: 'Resource Category', value: res.category, mono: true },
      { label: 'Total Inventory Stock', value: `${res.totalCount} ${res.unit}` },
      { label: 'Deployed in Field', value: `${res.deployedCount} ${res.unit}` },
      { label: 'Available Stock', value: `${res.totalCount - res.deployedCount} ${res.unit}` },
      { label: 'Demand Status', value: res.status, mono: true },
    ],
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 md:px-6 py-6 font-sans">
      {/* Page Header */}
      <PageHeader
        title="Teams & Resource Operations"
        subtitle="Registered response team rosters, personnel availability, vehicle inventory, and asset dispatch tracking"
        scenarioName="Metro City Flood Response — Monsoon Emergency"
        regionLocation="North Command Sector"
        operationStatus="TEAMS & FLEET DEPLOYED"
        lastUpdated="14:35:00"
      />

      {/* Top Summary Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="p-4 border-slate-200 bg-white shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Response Teams</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 font-mono mt-1">{mockDetailedTeams.length}</p>
          <span className="text-[11px] text-slate-600 font-medium">Registered units</span>
        </Card>

        <Card className="p-4 border-slate-200 bg-white shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Teams Deployed</span>
            <Activity className="w-4 h-4 text-red-600" />
          </div>
          <p className="text-2xl font-extrabold text-red-700 font-mono mt-1">
            {mockDetailedTeams.filter((t) => t.status === 'DEPLOYED').length}
          </p>
          <span className="text-[11px] text-red-600 font-medium">Active in disaster zone</span>
        </Card>

        <Card className="p-4 border-slate-200 bg-white shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Teams Standby</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-extrabold text-emerald-700 font-mono mt-1">
            {mockDetailedTeams.filter((t) => t.status === 'STANDBY').length}
          </p>
          <span className="text-[11px] text-emerald-600 font-medium">Ready for immediate dispatch</span>
        </Card>

        <Card className="p-4 border-slate-200 bg-white shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">High Demand Assets</span>
            <Box className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-extrabold text-amber-700 font-mono mt-1">
            {mockDetailedResources.filter((r) => r.status === 'HIGH_DEMAND').length}
          </p>
          <span className="text-[11px] text-amber-600 font-medium">&gt; 75% inventory deployed</span>
        </Card>
      </div>

      {/* View Switcher Bar */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('TEAMS')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-xs transition-colors cursor-pointer ${
              activeTab === 'TEAMS'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            <Users size={15} /> Registered Teams ({mockDetailedTeams.length})
          </button>

          <button
            onClick={() => setActiveTab('RESOURCES')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-xs transition-colors cursor-pointer ${
              activeTab === 'RESOURCES'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            <Box size={15} /> Resource Inventory ({mockDetailedResources.length})
          </button>
        </div>
      </div>

      {/* TEAMS TAB CONTENT */}
      {activeTab === 'TEAMS' && (
        <div className="space-y-4">
          {/* Filter & Search Bar */}
          <Card className="p-4 border-slate-200 bg-white shadow-2xs space-y-3">
            <div className="flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search teams by name, code, type, or sector location..."
                  value={teamSearchQuery}
                  onChange={(e) => setTeamSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/20"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
                <span className="text-slate-400 text-[11px] font-bold uppercase tracking-wider mr-1 flex items-center gap-1">
                  <Filter size={12} /> Status:
                </span>
                {['ALL', 'DEPLOYED', 'STANDBY'].map((status) => (
                  <button
                    key={status}
                    onClick={() => setTeamStatusFilter(status)}
                    className={`px-3 py-1.5 rounded-lg font-semibold text-xs cursor-pointer ${
                      teamStatusFilter === status
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

          {/* Teams Roster Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTeams.map((team) => (
              <Card
                key={team.id}
                className="p-5 border-slate-200 bg-white hover:border-slate-300 transition-all shadow-2xs space-y-4"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        {team.code}
                      </span>
                      <Badge variant={team.status === 'DEPLOYED' ? 'critical' : 'success'} className="text-xs uppercase">
                        {team.status}
                      </Badge>
                    </div>
                    <h3 className="text-base font-bold text-slate-900 mt-1">{team.name}</h3>
                    <p className="text-xs text-slate-500 font-medium">{team.type}</p>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedModalTeam(team)}
                    className="text-xs text-slate-700 hover:bg-slate-100 cursor-pointer shrink-0"
                  >
                    Roster Details
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold uppercase block">Personnel</span>
                    <span className="font-bold text-slate-900">{team.membersCount} Responders</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold uppercase block">Current Location</span>
                    <span className="font-semibold text-slate-800 flex items-center gap-1">
                      <MapPin size={11} className="text-slate-400" /> {team.location}
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Current Assignment:
                  </span>
                  <p className="text-xs font-semibold text-slate-800 bg-blue-50/60 text-blue-900 p-2 rounded-lg border border-blue-100">
                    {team.currentAssignment}
                  </p>
                </div>

                <div className="space-y-1.5 pt-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Assigned Equipment ({team.equipment.length}):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {team.equipment.map((eq, i) => (
                      <span
                        key={i}
                        className="text-[11px] font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200"
                      >
                        {eq}
                      </span>
                    ))}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* RESOURCES TAB CONTENT */}
      {activeTab === 'RESOURCES' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <Card className="p-4 border-slate-200 bg-white shadow-2xs space-y-3">
            <div className="flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search equipment, boats, pumps, vehicles..."
                  value={resourceSearchQuery}
                  onChange={(e) => setResourceSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/20"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
                <span className="text-slate-400 text-[11px] font-bold uppercase tracking-wider mr-1 flex items-center gap-1">
                  <Filter size={12} /> Category:
                </span>
                {['ALL', 'BOAT', 'VEHICLE', 'EQUIPMENT', 'MEDICAL'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setResourceCategoryFilter(cat)}
                    className={`px-3 py-1.5 rounded-lg font-semibold text-xs cursor-pointer ${
                      resourceCategoryFilter === cat
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </Card>

          {/* Resources Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredResources.map((res) => {
              const percentage = Math.round((res.deployedCount / res.totalCount) * 100);
              return (
                <Card
                  key={res.id}
                  className="p-5 border-slate-200 bg-white hover:border-slate-300 transition-all shadow-2xs space-y-4"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs uppercase font-mono">
                          {res.category}
                        </Badge>
                        <Badge
                          variant={res.status === 'HIGH_DEMAND' ? 'warning' : 'success'}
                          className="text-xs uppercase"
                        >
                          {res.status}
                        </Badge>
                      </div>
                      <h3 className="text-base font-bold text-slate-900 mt-1.5">{res.name}</h3>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedModalResource(res)}
                      className="text-xs text-slate-700 hover:bg-slate-100 cursor-pointer shrink-0"
                    >
                      Utilization
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-600">Field Deployed</span>
                      <span className="text-slate-900 font-mono">
                        {res.deployedCount} / {res.totalCount} {res.unit} ({percentage}%)
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          percentage > 75 ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                      <span className="text-[10px] text-slate-500 font-bold uppercase block">Deployed Count</span>
                      <span className="font-bold text-slate-900 font-mono text-sm">{res.deployedCount}</span>
                    </div>
                    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                      <span className="text-[10px] text-slate-500 font-bold uppercase block">Available Reserve</span>
                      <span className="font-bold text-emerald-700 font-mono text-sm">
                        {res.totalCount - res.deployedCount}
                      </span>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Team Detail Modal */}
      {selectedModalTeam && (
        <DetailModal
          isOpen={!!selectedModalTeam}
          onClose={() => setSelectedModalTeam(null)}
          data={getTeamModalData(selectedModalTeam)}
        />
      )}

      {/* Resource Detail Modal */}
      {selectedModalResource && (
        <DetailModal
          isOpen={!!selectedModalResource}
          onClose={() => setSelectedModalResource(null)}
          data={getResourceModalData(selectedModalResource)}
        />
      )}
    </div>
  );
}
