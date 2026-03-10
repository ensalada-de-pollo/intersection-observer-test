'use client';

import { useEffect, useState } from 'react';

export default function EpisodeDashboard() {
  const [episodes, setEpisodes] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch('/api/stats/summary');
      const data = await res.json();
      setEpisodes(data);
    };
    fetchData();
    const timer = setInterval(fetchData, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div style={{ padding: '40px', backgroundColor: '#f0f2f5', minHeight: '100vh' }}>
      <h1 style={{ marginBottom: '30px', textAlign: 'center' }}>📈 에피소드별 독자 체류 분석</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(450px, 1fr))', gap: '20px' }}>
        {episodes.map((ep) => (
          <div key={ep.episodeId} style={cardStyle}>
            <div style={headerStyle}>
              <h2 style={{ margin: 0 }}>제 {ep.episodeId}화</h2>
            </div>

            <h4 style={{ marginTop: '20px', color: '#666' }}>🎬 장면별 집중도 (평균 초)</h4>
            <div style={{ marginTop: '10px' }}>
              {ep.scenes.map((scene: any) => {
                const avg = scene.totalDuration / scene.viewCount;
                return (
                  <div key={scene.sceneId} style={barWrapper}>
                    <span style={{ width: '70px', fontSize: '13px' }}>{scene.sceneId}</span>
                    <div style={trackStyle}>
                      <div style={{ 
                        ...barStyle, 
                        width: `${Math.min(avg * 10, 100)}%`, // 시간에 비례한 길이
                        backgroundColor: avg > 5 ? '#ff4757' : '#2ed573' // 5초 이상 머물면 붉은색 표시
                      }} />
                    </div>
                    <span style={{ marginLeft: '10px', fontSize: '12px', fontWeight: 'bold' }}>{avg.toFixed(1)}s</span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// 스타일 정의 (이해를 돕기 위한 인라인 스타일)
const cardStyle: any = { backgroundColor: 'white', borderRadius: '15px', padding: '25px', boxShadow: '0 10px 20px rgba(0,0,0,0.05)' };
const headerStyle: any = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #f0f0f0', paddingBottom: '15px', marginBottom: '15px' };
const badgeStyle: any = { backgroundColor: '#333', color: 'white', padding: '4px 12px', borderRadius: '20px', fontSize: '12px' };
const summaryGrid: any = { display: 'grid', gridTemplateColumns: '1fr 1fr', backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '10px' };
const labelStyle: any = { fontSize: '12px', color: '#888', margin: 0 };
const valueStyle: any = { fontSize: '20px', fontWeight: 'bold', margin: '5px 0 0 0', color: '#222' };
const barWrapper: any = { display: 'flex', alignItems: 'center', marginBottom: '8px' };
const trackStyle: any = { flex: 1, height: '12px', backgroundColor: '#eee', borderRadius: '6px', overflow: 'hidden' };
const barStyle: any = { height: '100%', transition: 'width 0.5s ease-in-out' };