import React from 'react';
import { PageProps } from '../../types';
import { Icon } from '../../constants';
import { getMonitorItemById, MonitorItem, MonitorMetric, MonitorIncident, MonitorWatcher } from './monitorData';

const formatDateTime = (value: string) => {
  try {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch {
    return value;
  }
};

const StatusChip: React.FC<{ level?: MonitorItem['statusLevel']; label?: string; icon?: string }> = ({ level, label, icon }) => {
  if (!level && !label) return null;
  const palette: Record<NonNullable<MonitorItem['statusLevel']>, string> = {
    operational: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    degraded: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    outage: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    informational: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
  };
  const className = level ? palette[level] : 'bg-slate-500/20 text-slate-300 border-slate-500/40';
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full border ${className}`}>
      {icon ? <Icon name={icon as any} className="w-3.5 h-3.5" /> : null}
      <span>{label ?? level}</span>
    </span>
  );
};

const MetricsGrid: React.FC<{ metrics?: MonitorMetric[] }> = ({ metrics }) => {
  if (!metrics || metrics.length === 0) return null;
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {metrics.map(metric => (
        <div key={metric.label} className="rounded border border-white/10 bg-white/[0.02] p-3 flex flex-col gap-1">
          <div className="text-sm text-gray-400">{metric.label}</div>
          <div className="text-lg font-semibold text-white">{metric.value}</div>
          {(metric.change || metric.trend) && (
            <div className="text-xs text-gray-400">
              {metric.change ? metric.change : ''}
              {metric.change && metric.trend ? ' · ' : ''}
              {metric.trend === 'up' && '상승'}
              {metric.trend === 'down' && '하락'}
              {metric.trend === 'flat' && '유지'}
            </div>
          )}
          {metric.helper && <div className="text-xs text-gray-500">{metric.helper}</div>}
        </div>
      ))}
    </div>
  );
};

const IncidentsList: React.FC<{ incidents?: MonitorIncident[] }> = ({ incidents }) => {
  if (!incidents || incidents.length === 0) return null;
  return (
    <div className="space-y-3">
      {incidents.map(incident => (
        <div key={incident.id} className="rounded border border-white/10 bg-white/[0.02] p-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="font-medium text-white text-sm">{incident.title}</div>
              <div className="text-xs text-gray-400">
                시작 {formatDateTime(incident.startedAt)}
                {incident.resolvedAt ? ` · 복구 ${formatDateTime(incident.resolvedAt)}` : ''}
              </div>
            </div>
            <StatusChip level={incident.status === 'resolved' ? 'informational' : incident.status === 'monitoring' ? 'operational' : 'degraded'} label={incident.status} />
          </div>
          <div className="mt-2 text-sm text-gray-300 whitespace-pre-wrap leading-relaxed">{incident.summary}</div>
        </div>
      ))}
    </div>
  );
};

const WatchersList: React.FC<{ watchers?: MonitorWatcher[] }> = ({ watchers }) => {
  if (!watchers || watchers.length === 0) return null;
  return (
    <div className="space-y-3">
      {watchers.map(watcher => (
        <div key={watcher.label} className="rounded border border-white/10 bg-white/[0.02] p-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="font-medium text-white text-sm">{watcher.label}</div>
              <div className="text-xs text-gray-400">마지막 확인 {formatDateTime(watcher.lastChecked)}</div>
            </div>
            <a
              href={watcher.url}
              className="text-xs px-2 py-1 rounded bg-white/10 hover:bg-white/20 text-gray-200"
              target="_blank"
              rel="noopener noreferrer"
            >
              보기
            </a>
          </div>
          {watcher.highlights && <div className="mt-2 text-sm text-gray-300 whitespace-pre-wrap leading-relaxed">{watcher.highlights}</div>}
        </div>
      ))}
    </div>
  );
};

const MonitorPage: React.FC<PageProps> = ({ routeParams }) => {
  const activeItemId = routeParams?.itemId ?? '';
  const selectedItem = activeItemId ? getMonitorItemById(activeItemId) : getMonitorItemById('huny-site-status');

  if (!selectedItem) {
    return (
      <div className="text-sm text-gray-400">모니터링 항목이 없습니다.</div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-white">{selectedItem.name}</h2>
          <p className="text-sm text-gray-300 max-w-3xl leading-relaxed">{selectedItem.summary}</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <StatusChip level={selectedItem.statusLevel} label={selectedItem.statusLabel} icon={selectedItem.statusIcon} />
          <span>업데이트 {formatDateTime(selectedItem.updatedAt)}</span>
        </div>
      </div>

      <MetricsGrid metrics={selectedItem.metrics} />
      <IncidentsList incidents={selectedItem.incidents} />
      <WatchersList watchers={selectedItem.watchers} />

      {selectedItem.notes && (
        <section className="rounded border border-white/10 bg-white/[0.02] p-4">
          <h3 className="text-sm font-medium text-white mb-2">추가 메모</h3>
          <p className="text-sm text-gray-300 whitespace-pre-wrap leading-relaxed">{selectedItem.notes}</p>
        </section>
      )}
    </div>
  );
};

export default MonitorPage;
