'use client';

import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { DetailModal, ModalContentData } from '@/components/official/DetailModal';
import { mockVolunteerMission, MissionResourceItem } from '@/lib/mock/volunteer-operations-data';
import { Box, MapPin } from 'lucide-react';

export default function VolunteerResourcesPage() {
  const [mission] = useState(mockVolunteerMission);
  const [selectedResource, setSelectedResource] = useState<MissionResourceItem | null>(null);

  const getResourceModalData = (res: MissionResourceItem): ModalContentData => ({
    type: 'STAT_FILTER',
    title: res.name,
    subtitle: `Asset ID: ${res.id}`,
    badgeText: res.status,
    badgeVariant: 'success',
    description: res.operationalNote,
    fields: [
      { label: 'Resource ID', value: res.id, mono: true },
      { label: 'Resource Name', value: res.name },
      { label: 'Category Type', value: res.type },
      { label: 'Allocation Status', value: res.status, mono: true },
      { label: 'Staging Location', value: res.location },
      { label: 'Target Mission', value: mission.id, mono: true },
    ],
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 md:px-6 py-6 font-sans">
      {/* Header */}
      <Card className="p-5 md:p-6 border-slate-200 bg-white shadow-2xs space-y-4 rounded-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className="border-slate-300 text-slate-800 font-semibold bg-slate-50">
              <Box className="w-3.5 h-3.5 mr-1 text-slate-700 inline" />
              Allocated Mission Assets
            </Badge>
            <Badge variant="success" className="text-xs uppercase font-mono">
              {mission.resources.length} Assets Active
            </Badge>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-600 font-mono">
            <MapPin size={13} className="text-slate-400" />
            <span>{mission.location}</span>
          </div>
        </div>

        <div className="space-y-1">
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Allocated Mission Resources
          </h1>
          <p className="text-xs md:text-sm text-slate-600 font-sans">
            Equipment, boats, and medical supplies assigned to Mission <strong className="text-slate-800">{mission.id}</strong>.
          </p>
        </div>
      </Card>

      {/* Resources Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {mission.resources.map((res) => (
          <Card
            key={res.id}
            onClick={() => setSelectedResource(res)}
            className="p-5 border-slate-200 bg-white hover:border-slate-300 transition-all shadow-2xs space-y-4 cursor-pointer rounded-xl"
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                    {res.id}
                  </span>
                  <Badge variant="success" className="text-xs font-mono uppercase">
                    {res.status}
                  </Badge>
                </div>
                <h3 className="text-base font-bold text-slate-900 mt-1.5">{res.name}</h3>
                <p className="text-xs text-slate-500 font-medium">{res.type}</p>
              </div>

              <Button variant="outline" size="sm" className="text-xs text-slate-700 hover:bg-slate-100 cursor-pointer shrink-0">
                Asset Details
              </Button>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Staging Location:</span>
              <p className="font-semibold text-slate-900 flex items-center gap-1">
                <MapPin size={12} className="text-slate-400" /> {res.location}
              </p>
            </div>

            <div className="space-y-1 text-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Operational Directive Note:
              </span>
              <p className="text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-200/80 leading-relaxed font-sans">
                {res.operationalNote}
              </p>
            </div>
          </Card>
        ))}
      </div>

      {/* Resource Modal */}
      {selectedResource && (
        <DetailModal
          isOpen={!!selectedResource}
          onClose={() => setSelectedResource(null)}
          data={getResourceModalData(selectedResource)}
        />
      )}
    </div>
  );
}
