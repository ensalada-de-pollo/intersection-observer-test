'use client';

import { useEffect, useState } from 'react';
import example from '../../../public/example.jpg';

// ─── 히트맵 뷰어 (재사용) ─────────────────────────────────────────────────────
function HeatmapViewer({ label, sublabel, scenes, getHeatColor, accentColor }: {
  label: string;
  sublabel: string;
  scenes: any[];
  getHeatColor: (avg: number) => string;
  accentColor: string;
}) {
  return (
    <div style={{ flex: 1, overflowY: 'auto', borderRight: '1px solid #222', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ width: '100%', maxWidth: '400px' }}>

        <div style={stickyHeader}>
          <h2 style={{ margin: 0, fontSize: '15px', color: accentColor }}>{label}</h2>
          <p style={{ fontSize: '11px', color: '#666', margin: '4px 0 0 0' }}>{sublabel}</p>
        </div>

        <div style={{ position: 'relative' }}>
          <img src={example.src} alt="webtoon" style={{ width: '100%', display: 'block' }} />
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
            {scenes.map((s: any) => (
              <div key={s.sceneId} style={{
                height: `${100 / scenes.length}%`,
                backgroundColor: getHeatColor(s.avg),
                borderBottom: '1px solid rgba(255,255,255,0.03)',
                display: 'flex', alignItems: 'center', paddingLeft: '10px',
                fontSize: '10px', fontWeight: 'bold', color: '#0f0f0f',
                pointerEvents: 'none',
              }}>
                {s.sceneId.split('_')[1]} · {s.avg.toFixed(1)}s
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

// ─── 메인 대시보드 ────────────────────────────────────────────────────────────
export default function IntegratedDashboard() {
  const [episodeData, setEpisodeData] = useState<any>(null);
  const episodeId = 1;

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await fetch('/api/stats/summary');
        if (!res.ok) throw new Error('데이터를 불러올 수 없습니다.');
        const data = await res.json();
        if (data?.scenes) setEpisodeData(data);
      } catch (error) {
        console.error('데이터 로드 실패:', error);
      }
    };

    fetchAnalytics();
    const timer = setInterval(fetchAnalytics, 100000);
    return () => clearInterval(timer);
  }, [episodeId]);

  if (!episodeData) {
    return (
      <div style={loadingContainer}>
        <p>에피소드 {episodeId} 통계 분석 중...</p>
      </div>
    );
  }

  const scenes: any[]    = episodeData.scenes;
  // rawScenes가 없을 경우 scenes로 fallback (API 업데이트 전 안전망)
  const rawScenes: any[] = episodeData.rawScenes ?? scenes;

  const maxAvg = Math.max(...scenes.map((s: any) => s.avg), 0.1);

  // 스무딩 팔레트 (레드 계열)
  const getSmoothedColor = (avg: number) => {
    const o = Math.min(avg / 8, 0.6);
    if (avg > 5) return `rgba(255, 60, 60, ${o})`;
    if (avg > 2) return `rgba(255, 180, 0, ${o})`;
    return `rgba(50, 150, 255, ${o})`;
  };

  // Raw 팔레트 (퍼플 계열 → 스무딩과 시각적으로 명확히 구분)
  const getRawColor = (avg: number) => {
    const o = Math.min(avg / 8, 0.6);
    if (avg > 5) return `rgba(160, 60, 255, ${o})`;
    if (avg > 2) return `rgba(60, 200, 255, ${o})`;
    return `rgba(80, 80, 80, ${o})`;
  };

  return (
    <div style={{ display: 'flex', backgroundColor: '#050505', color: '#eee', height: '100vh', overflow: 'hidden' }}>

      {/* 패널 1: 스무딩 히트맵 */}
      <HeatmapViewer
        label="🔴 스무딩 적용"
        sublabel="Gaussian pull-up smoothing"
        scenes={scenes}
        getHeatColor={getSmoothedColor}
        accentColor="#ff4757"
      />

      {/* 패널 2: 원본(Raw) 히트맵 */}
      <HeatmapViewer
        label="🔵 원본 (Raw)"
        sublabel="측정 원시 데이터"
        scenes={rawScenes}
        getHeatColor={getRawColor}
        accentColor="#3d8bff"
      />

      {/* 패널 3: 통계 */}
      <div style={{ width: '380px', padding: '28px', overflowY: 'auto', backgroundColor: '#0f0f0f' }}>
        <h2 style={{ borderBottom: '1px solid #333', paddingBottom: '15px', color: '#fff', marginTop: 0 }}>📊 성과 분석</h2>

        {/* KPI */}
        <div style={kpiGrid}>
          <div style={{ ...kpiCard, borderColor: 'rgba(255,71,87,0.3)' }}>
            <small style={{ color: '#ff4757' }}>스무딩 평균 체류</small>
            <h3 style={{ margin: '5px 0 0 0', color: '#00dc64' }}>{episodeData.avgEpisodeTime.toFixed(1)}s</h3>
          </div>
          <div style={{ ...kpiCard, borderColor: 'rgba(61,139,255,0.3)' }}>
            <small style={{ color: '#3d8bff' }}>Raw 평균 체류</small>
            <h3 style={{ margin: '5px 0 0 0', color: '#00dc64' }}>
              {episodeData.rawAvgEpisodeTime != null ? `${episodeData.rawAvgEpisodeTime.toFixed(1)}s` : '-'}
            </h3>
          </div>
          <div style={{ ...kpiCard, gridColumn: '1 / -1' }}>
            <small style={{ color: '#888' }}>누적 뷰어(섹션 평균)</small>
            <h3 style={{ margin: '5px 0 0 0' }}>{episodeData.totalViews.toLocaleString()}</h3>
          </div>
        </div>

        {/* TOP 3 */}
        <div style={{ marginTop: '30px' }}>
          <h4 style={{ color: '#ff4757', marginBottom: '12px' }}>🏆 몰입 구간 TOP 3 (스무딩 기준)</h4>
          {scenes
            .filter((s: any) => s.avg > 0)
            .sort((a: any, b: any) => b.avg - a.avg)
            .slice(0, 3)
            .map((s: any, i: number) => {
              const rawMatch = rawScenes.find((r: any) => r.sceneId === s.sceneId);
              const diff = s.avg - (rawMatch?.avg ?? s.avg);
              return (
                <div key={i} style={rankRow}>
                  <span style={{ color: '#aaa' }}>{i + 1}. {s.sceneId}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ color: '#ff4757', fontWeight: 'bold' }}>{s.avg.toFixed(1)}s</span>
                    {diff > 0.05 && (
                      <span style={{ color: '#00dc64', fontSize: '11px' }}>+{diff.toFixed(1)}↑</span>
                    )}
                  </span>
                </div>
              );
            })}
        </div>

        {/* 비교 차트 */}
        <div style={{ marginTop: '35px' }}>
          <h4 style={{ marginBottom: '12px', fontSize: '14px' }}>📈 스무딩 vs Raw 비교</h4>
          <div style={chartContainer}>
            {scenes.map((s: any, i: number) => {
              const rawScene = rawScenes[i];
              const sH = Math.min((s.avg / maxAvg) * 100, 100);
              const rH = Math.min(((rawScene?.avg ?? 0) / maxAvg) * 100, 100);
              return (
                <div key={s.sceneId} title={`${s.sceneId}\n스무딩: ${s.avg.toFixed(1)}s\nRaw: ${rawScene?.avg.toFixed(1)}s`}
                  style={{ flex: 1, display: 'flex', alignItems: 'flex-end', gap: '1px', height: '100%' }}>
                  <div style={{ flex: 1, height: `${sH}%`, backgroundColor: '#ff4757', borderRadius: '1px 1px 0 0', minHeight: sH > 0 ? '1px' : '0' }} />
                  <div style={{ flex: 1, height: `${rH}%`, backgroundColor: '#3d8bff', borderRadius: '1px 1px 0 0', minHeight: rH > 0 ? '1px' : '0' }} />
                </div>
              );
            })}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#555', marginTop: '6px' }}>
            <span>시작</span><span>중반부</span><span>엔딩</span>
          </div>
          {/* 범례 */}
          <div style={{ display: 'flex', gap: '16px', marginTop: '10px', fontSize: '11px', color: '#888' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ width: '10px', height: '10px', backgroundColor: '#ff4757', borderRadius: '2px', display: 'inline-block' }} />
              스무딩
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ width: '10px', height: '10px', backgroundColor: '#3d8bff', borderRadius: '2px', display: 'inline-block' }} />
              Raw
            </span>
          </div>
        </div>

        {/* 인사이트 */}
        <div style={footerNote}>
          <p style={{ fontWeight: 'bold', color: '#00dc64', margin: '0 0 8px 0' }}>💡 데이터 인사이트</p>
          <p style={{ margin: 0, color: '#bbb' }}>
            가장 지루해하는 구간은 <strong style={{ color: '#fff' }}>{episodeData.worstScene?.sceneId}</strong>
            ({episodeData.worstScene?.avg.toFixed(1)}s)입니다.
            해당 컷의 연출을 더 임팩트 있게 수정하거나 대사 길이를 조절해 보세요.
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── 스타일 ───────────────────────────────────────────────────────────────────
const stickyHeader: any = { position: 'sticky', top: 0, backgroundColor: 'rgba(5,5,5,0.95)', padding: '16px 20px', zIndex: 100, borderBottom: '1px solid #1a1a1a', backdropFilter: 'blur(10px)' };
const kpiGrid: any      = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '16px' };
const kpiCard: any      = { backgroundColor: '#1a1a1a', padding: '16px', borderRadius: '12px', textAlign: 'center', border: '1px solid #222' };
const rankRow: any      = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #1e1e1e', fontSize: '13px' };
const chartContainer: any = { display: 'flex', alignItems: 'flex-end', gap: '2px', height: '90px', backgroundColor: '#111', padding: '8px', borderRadius: '8px', border: '1px solid #222' };
const footerNote: any   = { marginTop: '40px', padding: '16px', backgroundColor: 'rgba(0,220,100,0.05)', borderRadius: '12px', fontSize: '13px', border: '1px solid rgba(0,220,100,0.1)', lineHeight: '1.6' };
const loadingContainer: any = { padding: '50px', color: '#888', backgroundColor: '#000', height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' };
