'use client';

import { useEffect, useState } from 'react';

export default function HeatmapDashboard() {
  const [stats, setStats] = useState<any[]>([]);
  const episodeId = 1;

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch('/api/stats/summary');
      const data = await res.json();
      const currentEp = data.find((d: any) => d.episodeId === episodeId);
      
      if (currentEp?.scenes) {
        // [중요] scene_1, scene_2 순서대로 정렬 (문자열 숫자 추출 정렬)
        const sortedScenes = [...currentEp.scenes].sort((a, b) => {
          const numA = parseInt(a.sceneId.replace('scene_', ''));
          const numB = parseInt(b.sceneId.replace('scene_', ''));
          return numA - numB;
        });
        setStats(sortedScenes);
      }
    };
    fetchData();
    const interval = setInterval(fetchData, 5000); // 5초마다 자동 갱신
    return () => clearInterval(interval);
  }, []);

  // 체류 시간에 따른 열지수 색상 (빨간색 = 많이 봄, 파란색 = 빨리 지나침)
  const getHeatColor = (avg: number) => {
    const opacity = Math.min(avg / 10, 0.7); // 최대 투명도 0.7
    if (avg > 5) return `rgba(255, 0, 0, ${opacity})`;    // Hot (레드)
    if (avg > 3) return `rgba(255, 165, 0, ${opacity})`;  // Warm (오렌지)
    if (avg > 1) return `rgba(255, 255, 0, ${opacity})`;  // Normal (옐로우)
    return `rgba(0, 100, 255, ${opacity})`;              // Cold (블루)
  };

  return (
    <div style={{ display: 'flex', backgroundColor: '#000', color: '#fff', minHeight: '100vh' }}>
      
      {/* 좌측: 웹툰 히트맵 뷰어 (중앙 정렬) */}
      <div style={{ flex: 1, overflowY: 'auto', height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', borderRight: '1px solid #333' }}>
        <div style={{ width: '100%', maxWidth: '600px', position: 'relative' }}>
          
          <div style={stickyHeader}>
            <h3>🔥 에피소드 {episodeId} 실시간 히트맵</h3>
            <p style={{ fontSize: '12px', color: '#888' }}>장면 순서대로 분석 중 (Total: {stats.length} scenes)</p>
          </div>

          <div style={{ position: 'relative' }}>
            {/* 원본 웹툰 이미지 */}
            <img 
              src="https://placehold.co/600x25000/222/white?text=WEBTOON+CONTENT" 
              alt="webtoon" 
              style={{ width: '100%', display: 'block' }} 
            />

            {/* 히트맵 레이어 (순서대로 배치) */}
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
              {stats.map((scene) => {
                const avg = scene.totalDuration / scene.viewCount;
                return (
                  <div
                    key={scene.sceneId}
                    style={{
                      height: `${100 / 50}%`, // 50등분
                      backgroundColor: getHeatColor(avg),
                      borderBottom: '1px solid rgba(255,255,255,0.05)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      paddingLeft: '20px',
                      transition: 'background-color 1s ease'
                    }}
                  >
                    <span style={{ fontSize: '10px', fontWeight: 'bold' }}>{scene.sceneId}</span>
                    <span style={{ fontSize: '14px' }}>{avg.toFixed(1)}s</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 우측: 요약 리포트 패널 */}
      <div style={{ width: '350px', padding: '30px', overflowY: 'auto', height: '100vh', backgroundColor: '#111' }}>
        <h2 style={{ fontSize: '20px', marginBottom: '20px' }}>데이터 요약</h2>
        
        <div style={infoBox}>
          <p style={label}>평균 정독 시간</p>
          <h3 style={{ margin: 0 }}>
            {(stats.reduce((acc, s) => acc + (s.totalDuration / s.viewCount), 0) / (stats.length || 1)).toFixed(2)}초
          </h3>
        </div>

        <div style={{ marginTop: '30px' }}>
          <h4 style={{ color: '#ff4757' }}>📊 정독률 TOP 3</h4>
          {[...stats].sort((a,b) => (b.totalDuration/b.viewCount) - (a.totalDuration/a.viewCount)).slice(0, 3).map((s, i) => (
            <div key={i} style={rankItem}>
              <span>{i+1}. {s.sceneId}</span>
              <span>{(s.totalDuration/s.viewCount).toFixed(1)}s</span>
            </div>
          ))}
        </div>

        <div style={{ marginTop: '40px', fontSize: '13px', color: '#666', lineHeight: '1.6' }}>
          <p>✅ **분석 가이드**</p>
          <p>• 빨간색일수록 독자가 화면을 멈추고 집중했습니다.</p>
          <p>• 파란색일수록 스크롤 속도가 매우 빨랐습니다.</p>
          <p>• 특정 구간에서 갑자기 파란색이 많아진다면 지루함이나 이탈 징후일 수 있습니다.</p>
        </div>
      </div>
    </div>
  );
}

// 스타일 객체
const stickyHeader: any = { position: 'sticky', top: 0, backgroundColor: 'rgba(0,0,0,0.9)', padding: '15px 20px', zIndex: 100, borderBottom: '1px solid #333' };
const infoBox: any = { backgroundColor: '#222', padding: '20px', borderRadius: '12px' };
const label: any = { fontSize: '12px', color: '#888', margin: '0 0 5px 0' };
const rankItem: any = { display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #333', fontSize: '14px' };