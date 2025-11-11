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

const PageSpeedPanel: React.FC<{ item: MonitorItem }> = ({ item }) => {
  const data = item.pageSpeedData;
  
  return (
    <>
      {/* 주요 성능 지표 */}
      <section className="rounded border border-emerald-500/20 bg-emerald-500/5 p-4">
        <h3 className="text-sm font-semibold text-emerald-200 mb-2">Core Web Vitals</h3>
        <p className="text-xs text-emerald-100/80 mb-3">
          사용자 경험에 영향을 미치는 핵심 성능 지표입니다.
        </p>
        <MetricsGrid metrics={item.metrics} />
      </section>

      {/* 최적화 기회 */}
      <section className="rounded border border-amber-500/20 bg-amber-500/5 p-4">
        <h3 className="text-sm font-semibold text-amber-200 mb-3">최적화 기회</h3>
        <div className="space-y-3">
          <div className="rounded border border-white/10 bg-white/[0.02] p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium text-white">렌더링 차단 리소스</div>
              <span className="text-xs text-amber-300">50ms 절감 가능</span>
            </div>
            <div className="text-xs text-gray-400">
              CSS 파일 2개가 초기 렌더링을 차단하고 있습니다.
            </div>
            <div className="mt-2 space-y-1">
              <div className="text-xs text-gray-500">
                • /assets/index-CQn2ygQK.css (11.6 KB)
              </div>
              <div className="text-xs text-gray-500">
                • /assets/hljs-BEHUn5zE.css (1.2 KB)
              </div>
            </div>
          </div>

          <div className="rounded border border-white/10 bg-white/[0.02] p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium text-white">사용하지 않는 JavaScript</div>
              <span className="text-xs text-emerald-300">774 KB 감소 가능</span>
            </div>
            <div className="text-xs text-gray-400">
              번들에서 사용하지 않는 코드를 제거하여 네트워크 활동을 줄일 수 있습니다.
            </div>
            <div className="mt-2 space-y-1">
              <div className="text-xs text-gray-500 flex justify-between">
                <span>• vendor-CcxX9bYI.js</span>
                <span>650 KB</span>
              </div>
              <div className="text-xs text-gray-500 flex justify-between">
                <span>• react-vendor-BTvE2GG7.js</span>
                <span>70 KB</span>
              </div>
              <div className="text-xs text-gray-500 flex justify-between">
                <span>• index-C7P2OhUK.js</span>
                <span>34 KB</span>
              </div>
            </div>
          </div>

          <div className="rounded border border-white/10 bg-white/[0.02] p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium text-white">캐시 정책</div>
              <span className="text-xs text-sky-300">3 KB 절감</span>
            </div>
            <div className="text-xs text-gray-400">
              정적 리소스에 효율적인 캐시 정책을 설정하여 재방문 시 로딩 속도를 개선합니다.
            </div>
            <div className="mt-2 text-xs text-gray-500">
              • beacon.min.js (24시간 TTL → 1년 권장)
            </div>
          </div>
        </div>
      </section>

      {/* 진단 정보 */}
      <section className="rounded border border-sky-500/20 bg-sky-500/5 p-4">
        <h3 className="text-sm font-semibold text-sky-200 mb-3">진단 정보</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          <div className="rounded border border-white/10 bg-white/[0.02] p-3">
            <div className="text-sm font-medium text-white mb-1">JavaScript 실행 시간</div>
            <div className="text-xs text-gray-400 mb-2">메인 스레드 작업 분석</div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-gray-300">react-vendor-BTvE2GG7.js</span>
                <span className="text-white">3.3s</span>
              </div>
              <div className="h-1.5 rounded bg-white/10 overflow-hidden">
                <div className="h-full bg-sky-400" style={{ width: '100%' }}></div>
              </div>
            </div>
          </div>

          <div className="rounded border border-white/10 bg-white/[0.02] p-3">
            <div className="text-sm font-medium text-white mb-1">네트워크 요청</div>
            <div className="text-xs text-gray-400 mb-2">리소스 로딩 현황</div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <div className="text-gray-400">총 요청</div>
                <div className="text-white font-semibold">14개</div>
              </div>
              <div>
                <div className="text-gray-400">전송 크기</div>
                <div className="text-white font-semibold">422 KB</div>
              </div>
            </div>
          </div>

          <div className="rounded border border-white/10 bg-white/[0.02] p-3">
            <div className="text-sm font-medium text-white mb-1">메인 스레드 작업</div>
            <div className="text-xs text-gray-400 mb-2">총 1,634개 작업</div>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-300">50ms 이상</span>
                <span className="text-amber-300">3개</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">100ms 이상</span>
                <span className="text-rose-300">1개</span>
              </div>
            </div>
          </div>

          <div className="rounded border border-white/10 bg-white/[0.02] p-3">
            <div className="text-sm font-medium text-white mb-1">서버 응답</div>
            <div className="text-xs text-gray-400 mb-2">백엔드 지연 시간</div>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-300">huny.dev</span>
                <span className="text-emerald-300">1ms</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">cloudflareinsights.com</span>
                <span className="text-emerald-300">0ms</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 리소스 요약 */}
      <section className="rounded border border-white/10 bg-white/[0.02] p-4">
        <h3 className="text-sm font-medium text-white mb-3">리소스 요약</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-2 px-3 font-medium text-gray-400">타입</th>
                <th className="text-right py-2 px-3 font-medium text-gray-400">요청 수</th>
                <th className="text-right py-2 px-3 font-medium text-gray-400">전송 크기</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              <tr>
                <td className="py-2 px-3 text-gray-300">Script</td>
                <td className="py-2 px-3 text-right text-white">9</td>
                <td className="py-2 px-3 text-right text-white">398 KB</td>
              </tr>
              <tr>
                <td className="py-2 px-3 text-gray-300">Stylesheet</td>
                <td className="py-2 px-3 text-right text-white">2</td>
                <td className="py-2 px-3 text-right text-white">12.8 KB</td>
              </tr>
              <tr>
                <td className="py-2 px-3 text-gray-300">Image</td>
                <td className="py-2 px-3 text-right text-white">1</td>
                <td className="py-2 px-3 text-right text-white">8.4 KB</td>
              </tr>
              <tr>
                <td className="py-2 px-3 text-gray-300">Document</td>
                <td className="py-2 px-3 text-right text-white">1</td>
                <td className="py-2 px-3 text-right text-white">2.0 KB</td>
              </tr>
              <tr className="font-semibold">
                <td className="py-2 px-3 text-white">Total</td>
                <td className="py-2 px-3 text-right text-white">14</td>
                <td className="py-2 px-3 text-right text-white">422 KB</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {item.notes ? (
        <section className="rounded border border-white/10 bg-white/[0.02] p-4">
          <h3 className="text-sm font-medium text-white mb-2">메모</h3>
          <p className="text-sm text-gray-300 whitespace-pre-wrap leading-relaxed">{item.notes}</p>
        </section>
      ) : null}
    </>
  );
};

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
    case 'pagespeed':
      return <PageSpeedPanel item={item} />;
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
