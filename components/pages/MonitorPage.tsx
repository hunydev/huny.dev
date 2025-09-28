import React from 'react';
import { PageProps } from '../../types';
import { Icon } from '../../constants';
import { MONITOR_GROUPS, getMonitorItemById, MonitorItem, MonitorMetric, MonitorIncident, MonitorWatcher } from './monitorData';

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

const StatusOverviewPanel: React.FC<{ item: MonitorItem }> = ({ item }) => (
  <>
    <section className="rounded border border-emerald-500/20 bg-emerald-500/5 p-4">
      <h3 className="text-sm font-semibold text-emerald-200 mb-2">서비스 주요 지표</h3>
      <p className="text-xs text-emerald-100/80 mb-3">
        최근 30일 기준으로 synthetic 모니터링, 지역별 응답 속도, 에러율을 종합한 상태 개요입니다.
      </p>
      <MetricsGrid metrics={item.metrics} />
    </section>
    {item.incidents && item.incidents.length > 0 ? (
      <section className="rounded border border-white/10 bg-white/[0.02] p-4">
        <h3 className="text-sm font-medium text-white mb-3">최근 인시던트</h3>
        <IncidentsList incidents={item.incidents} />
      </section>
    ) : null}
    {item.notes ? (
      <section className="rounded border border-white/10 bg-white/[0.02] p-4">
        <h3 className="text-sm font-medium text-white mb-2">운영 메모</h3>
        <p className="text-sm text-gray-300 whitespace-pre-wrap leading-relaxed">{item.notes}</p>
      </section>
    ) : null}
  </>
);

const NewsMentionsPanel: React.FC<{ item: MonitorItem }> = ({ item }) => (
  <>
    <section className="rounded border border-sky-500/25 bg-sky-500/5 p-4">
      <h3 className="text-sm font-semibold text-sky-200 mb-2">실시간 모니터링 채널</h3>
      <p className="text-xs text-sky-100/80 mb-3">
        주요 커뮤니티와 SNS를 감시하여 huny.dev 관련 언급을 빠르게 파악합니다.
      </p>
      <WatchersList watchers={item.watchers} />
    </section>
    {item.notes ? (
      <section className="rounded border border-white/10 bg-white/[0.02] p-4">
        <h3 className="text-sm font-medium text-white mb-2">요약 & 후속 액션</h3>
        <p className="text-sm text-gray-300 whitespace-pre-wrap leading-relaxed">{item.notes}</p>
      </section>
    ) : null}
  </>
);

const parseMetricRatio = (value: string): number | null => {
  const match = value.match(/([\d.,]+)\s*[A-Za-z%]*\s*\/\s*([\d.,]+)/);
  if (!match) return null;
  const current = parseFloat(match[1].replace(/,/g, ''));
  const total = parseFloat(match[2].replace(/,/g, ''));
  if (!Number.isFinite(current) || !Number.isFinite(total) || total === 0) return null;
  return Math.min(current / total, 1);
};

const UsageQuotasPanel: React.FC<{ item: MonitorItem }> = ({ item }) => (
  <section className="space-y-4">
    {item.metrics?.map(metric => {
      const ratio = parseMetricRatio(metric.value);
      return (
        <div key={metric.label} className="rounded border border-indigo-500/20 bg-indigo-500/5 p-4">
          <div className="flex items-center justify-between gap-3 mb-2">
            <div>
              <div className="text-sm font-medium text-white">{metric.label}</div>
              <div className="text-xs text-gray-400">{metric.helper ?? '최근 수집된 사용량 데이터'}</div>
            </div>
            <div className="text-sm text-indigo-100">{metric.value}</div>
          </div>
          {ratio !== null ? (
            <>
              <div className="h-2 rounded bg-white/10 overflow-hidden">
                <div
                  className="h-full bg-indigo-400"
                  style={{ width: `${(ratio * 100).toFixed(1)}%` }}
                />
              </div>
              <div className="mt-1 flex items-center justify-between text-xs text-gray-400">
                <span>사용률 {(ratio * 100).toFixed(1)}%</span>
                {metric.change ? <span>{metric.change}</span> : null}
              </div>
            </>
          ) : (
            <div className="text-xs text-gray-400">{metric.change ?? metric.trend ?? '추세 정보 없음'}</div>
          )}
        </div>
      );
    })}
    {item.notes ? (
      <section className="rounded border border-white/10 bg-white/[0.02] p-4">
        <h3 className="text-sm font-medium text-white mb-2">운영 메모</h3>
        <p className="text-sm text-gray-300 whitespace-pre-wrap leading-relaxed">{item.notes}</p>
      </section>
    ) : null}
  </section>
);

const DefaultMonitorPanel: React.FC<{ item: MonitorItem }> = ({ item }) => (
  <>
    <MetricsGrid metrics={item.metrics} />
    <IncidentsList incidents={item.incidents} />
    <WatchersList watchers={item.watchers} />
    {item.notes ? (
      <section className="rounded border border-white/10 bg-white/[0.02] p-4">
        <h3 className="text-sm font-medium text-white mb-2">추가 메모</h3>
        <p className="text-sm text-gray-300 whitespace-pre-wrap leading-relaxed">{item.notes}</p>
      </section>
    ) : null}
  </>
);

const renderContentForItem = (item: MonitorItem) => {
  switch (item.category) {
    case 'status':
      return <StatusOverviewPanel item={item} />;
    case 'news':
      return <NewsMentionsPanel item={item} />;
    case 'usage':
      return <UsageQuotasPanel item={item} />;
    default:
      return <DefaultMonitorPanel item={item} />;
  }
};

const MonitorPage: React.FC<PageProps> = ({ routeParams }) => {
  const activeItemId = routeParams?.itemId ?? '';
  const activeItem = activeItemId ? getMonitorItemById(activeItemId) : undefined;

  const selectedItem = activeItem ?? MONITOR_GROUPS[0]?.items[0];

  return (
    <div className="space-y-5">
      {selectedItem ? (
        <>
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

          {renderContentForItem(selectedItem)}
        </>
      ) : (
        <div className="text-sm text-gray-400">선택된 모니터 항목이 없습니다.</div>
      )}
    </div>
  );
};

export default MonitorPage;
