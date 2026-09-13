import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StatusIndicator } from '@/components/ui/status-indicator';
import { Shield, Layers, Clock, AlertCircle } from 'lucide-react';

interface PlaceholderScreenProps {
  screenNumber: number;
  totalScreens: number;
  dashboardType: 'Official Command Center' | 'Volunteer Response Center';
  screenName: string;
  routePath: string;
  loopStage: 'OBSERVE' | 'ASSESS' | 'PLAN' | 'EXECUTE' | 'MONITOR' | 'REPLAN';
  description: string;
  features: string[];
  children?: React.ReactNode;
}

export const PlaceholderScreen: React.FC<PlaceholderScreenProps> = ({
  screenNumber,
  totalScreens,
  dashboardType,
  screenName,
  routePath,
  loopStage,
  description,
  features,
  children,
}) => {
  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 md:px-6 py-6">
      {/* Top Breadcrumb & Operational Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-200">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-sans text-slate-500">
            <span className="font-medium text-slate-700">{dashboardType}</span>
            <span>/</span>
            <span className="text-slate-900 font-semibold">{screenName}</span>
            <Badge variant="outline" className="ml-2 font-sans font-normal text-[11px] text-slate-600 bg-white">
              Screen {screenNumber} of {totalScreens}
            </Badge>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            {screenName}
          </h1>
          <p className="text-sm text-slate-600 font-sans max-w-3xl">
            {description}
          </p>
        </div>

        <div className="flex items-center gap-3 self-start md:self-auto">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-slate-200 bg-white shadow-xs">
            <StatusIndicator status="active" />
            <span className="text-xs font-medium text-slate-700">Operational Loop:</span>
            <Badge variant="info" className="font-mono text-[11px]">
              {loopStage}
            </Badge>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {children ? (
        children
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Operational Panel */}
          <Card className="lg:col-span-2 border-slate-200">
            <CardHeader className="bg-slate-50/50">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-slate-900">
                  <Layers className="w-4 h-4 text-slate-700" />
                  Operational Capabilities & Features
                </CardTitle>
                <Badge variant="success">Module Ready</Badge>
              </div>
              <CardDescription>
                Primary functional components active within this response module.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 pt-5">
              <div className="space-y-2">
                {features.map((feature, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 p-3 rounded-md bg-slate-50 border border-slate-200 text-xs font-sans text-slate-800"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-900 mt-1.5 shrink-0" />
                    <span className="leading-relaxed font-medium">{feature}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Side Operational Context */}
          <div className="space-y-6">
            <Card className="border-slate-200">
              <CardHeader className="bg-slate-50/50">
                <CardTitle className="flex items-center gap-2 text-slate-900 text-sm">
                  <Shield className="w-4 h-4 text-slate-700" />
                  Role & Execution Protocol
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs font-sans space-y-3 pt-4 text-slate-700">
                <div className="p-3 rounded-md bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-xs font-semibold text-slate-900 block">Agent System Protocol</span>
                  <p className="text-slate-600 text-xs leading-normal">
                    System observation loop performs continuous situational assessment, dispatch planning, and replanning within operational authority.
                  </p>
                </div>
                <div className="p-3 rounded-md bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-xs font-semibold text-slate-900 block">Human Authority Interface</span>
                  <p className="text-slate-600 text-xs leading-normal">
                    {dashboardType === 'Official Command Center'
                      ? 'Officials monitor response progress and intervene only for out-of-bound exceptional actions.'
                      : 'Responders execute assigned field missions and report ground truth observations.'}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 bg-amber-50/50 border-amber-200">
              <CardContent className="p-4 flex items-start gap-3 text-xs text-amber-900 font-sans">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-semibold text-amber-950 block">Dashboard Phase Ready</span>
                  <p className="text-amber-800 leading-normal">
                    This screen represents the functional structure for {screenName}. Full interactive data widgets will load upon backend integration.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};
