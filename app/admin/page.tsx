'use client';

import { useEffect, useState } from 'react';

interface Stat {
  id: number;
  viewDate: string;
  episodeId: number;
  sceneId: string;
  totalDuration: number;
  viewCount: number;
}

export default function RawStatsPage() {
  const [stats, setStats] = useState<Stat[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/stats/raw');
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    // 5초마다 자동 갱신 (선택 사항)
    const interval = setInterval(fetchStats, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div style={{ padding: '20px', color: 'white' }}>로딩 중...</div>;

  return (
    <div style={{ backgroundColor: '#f5f5f5', minHeight: '100vh', padding: '40px' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto', backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
        <h1 style={{ marginBottom: '20px', fontSize: '24px', color: '#333' }}>📊 웹툰 장면별 체류 시간 통계 (Raw Data)</h1>
        
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: '#333', color: 'white' }}>
              <th style={thStyle}>날짜</th>
              <th style={thStyle}>에피소드</th>
              <th style={thStyle}>장면 ID</th>
              <th style={thStyle}>총 체류시간 (초)</th>
              <th style={thStyle}>조회수</th>
              <th style={thStyle}>평균 체류시간</th>
            </tr>
          </thead>
          <tbody>
            {stats.map((stat) => (
              <tr key={stat.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={tdStyle}>{new Date(stat.viewDate).toLocaleDateString()}</td>
                <td style={tdStyle}>제 {stat.episodeId}화</td>
                <td style={tdStyle}>
                  <span style={{ backgroundColor: '#e1f5fe', padding: '2px 8px', borderRadius: '4px', color: '#01579b', fontSize: '12px' }}>
                    {stat.sceneId}
                  </span>
                </td>
                <td style={tdStyle}><strong>{stat.totalDuration.toFixed(2)}s</strong></td>
                <td style={tdStyle}>{stat.viewCount}회</td>
                <td style={tdStyle}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {(stat.totalDuration / stat.viewCount).toFixed(2)}s
                    {/* 간단한 시각화 바 */}
                    <div style={{ width: '50px', height: '8px', backgroundColor: '#eee', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ 
                        width: `${Math.min((stat.totalDuration / stat.viewCount) * 10, 100)}%`, 
                        height: '100%', 
                        backgroundColor: '#4caf50' 
                      }} />
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {stats.length === 0 && (
          <p style={{ textAlign: 'center', padding: '40px', color: '#999' }}>데이터가 아직 없습니다.</p>
        )}
      </div>
    </div>
  );
}

const thStyle = { padding: '12px 15px', fontWeight: '600' };
const tdStyle = { padding: '12px 15px', color: '#444' };