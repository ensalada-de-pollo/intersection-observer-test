'use client';

import { useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';

export default function WebtoonPage() {
  const episodeId = 1;
  const SECTION_COUNT = 50;
  const sections = Array.from({ length: SECTION_COUNT }, (_, i) => `scene_${i + 1}`);
  
  // 데이터 저장용 (누적 시간)
  const statsRef = useRef<{ [key: string]: number }>({});
  // 현재 보고 있는 장면 ID
  const currentSceneRef = useRef<string | null>(null);
  // 장면 진입 시간
  const startTimeRef = useRef<number | null>(null);

  // [핵심] 체류 시간을 계산하고 기록하는 함수
  const stopTimer = () => {
    if (currentSceneRef.current && startTimeRef.current) {
      const now = Date.now();
      const duration = (now - startTimeRef.current) / 1000; // 밀리초를 초 단위로 변환
      
      // 1. 누적 데이터 업데이트
      statsRef.current[currentSceneRef.current] = (statsRef.current[currentSceneRef.current] || 0) + duration;
      
      // 2. 콘솔에 출력 (우리가 확인하고 싶은 것!)
      console.log(`⏱️ [시간 기록] ${currentSceneRef.current}번에 ${duration.toFixed(2)}초 머묾 (누적: ${statsRef.current[currentSceneRef.current].toFixed(2)}초)`);
      
      startTimeRef.current = null;
    }
  };

  // 서버로 전송 (탭 닫거나 숨길 때)
  const flushStats = () => {
    const data = statsRef.current;
    if (Object.keys(data).length === 0) return;
    
    console.log('🚀 [서버 전송] 최종 데이터:', data);
    
    const payload = JSON.stringify({ episodeId, stats: data });
    if (navigator.sendBeacon) {
      navigator.sendBeacon('/api/stats/flush', payload);
    } else {
      fetch('/api/stats/flush', { method: 'POST', body: payload, keepalive: true });
    }
    statsRef.current = {}; // 전송 후 초기화
  };

  useEffect(() => {
    console.log('✅ 감지 시스템 가동 중...');

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const sceneId = entry.target.getAttribute('data-scene-id')!;
            
            // 다른 장면으로 교체될 때만 실행
            if (currentSceneRef.current !== sceneId) {
              stopTimer(); // 1. 이전 장면 시간 정산
              
              currentSceneRef.current = sceneId; // 2. 새 장면 설정
              startTimeRef.current = Date.now(); // 3. 새 장면 진입 시간 기록
              
              console.log(`🎯 [현재 장면] ${sceneId} 진입`);
            }
          }
        });
      },
      { rootMargin: '-50% 0px -50% 0px' }
    );

    document.querySelectorAll('.scene-trigger').forEach((el) => observer.observe(el));

    // 페이지를 떠날 때 데이터 저장
    const handleVisibility = () => {
      if (document.visibilityState === 'hidden') {
        stopTimer();
        flushStats();
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    
    return () => {
      stopTimer();
      flushStats();
      observer.disconnect();
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);
  
  return (
    <div style={{ backgroundColor: '#111', minHeight: '100vh', color: 'white', maxWidth: '600px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      
      {/* 화면 중앙 감지 가이드선 (개발 중에만 확인용으로 쓰세요) */}
      <div style={{ position: 'fixed', top: '50%', left: 0, width: '100%', height: '1px', backgroundColor: 'rgba(255, 0, 0, 0.3)', zIndex: 100, pointerEvents: 'none' }} />

      <header style={{ padding: '60px 20px', textAlign: 'center', background: 'linear-gradient(to bottom, #222, #111)' }}>
        <h1 style={{ fontSize: '1.8rem', marginBottom: '10px' }}>웹툰 에피소드 {episodeId}</h1>
        <p style={{ color: '#666' }}>정밀 시선 추적 시스템 가동 중</p>
      </header>

      {/* 웹툰 본문 컨테이너 */}
      <div style={{ position: 'relative', width: '100%' }}>
        <img 
          src="https://placehold.co/600x20000/222/white?text=WEBTOON+CONTENT" 
          alt="webtoon" 
          style={{ width: '100%', display: 'block' }} 
          loading="lazy"
        />

        {/* 투명 감지 레이어 */}
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
          {sections.map((sceneId) => (
            <div
              key={sceneId}
              className="scene-trigger"
              data-scene-id={sceneId}
              style={{ 
                height: `${100 / SECTION_COUNT}%`,
                borderBottom: '1px solid rgba(255,255,255,0.03)',
                pointerEvents: 'none' 
              }}
            />
          ))}
        </div>
      </div>

      {/* 넉넉한 푸터 영역 (중앙선 감지를 위한 여백 확보) */}
      <footer style={{ 
        padding: '100px 20px 60vh 20px', // 아래쪽 여백을 60vh(화면 높이의 60%)로 설정
        textAlign: 'center', 
        backgroundColor: '#111',
        borderTop: '1px solid #333'
      }}>
        <div style={{ marginBottom: '40px' }}>
          <button style={buttonStyle}>다음 화 보기</button>
          <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', gap: '20px' }}>
            <span style={{ color: '#888', cursor: 'pointer' }}>❤️ 1,234</span>
            <span style={{ color: '#888', cursor: 'pointer' }}>💬 567</span>
          </div>
        </div>
        
        <div style={{ color: '#444', fontSize: '12px', lineHeight: '2' }}>
          <p>© 2026 Webtoon Studio. All rights reserved.</p>
          <p>이 페이지는 독자님의 감상 패턴을 분석하여 더 나은 연출을 고민합니다.</p>
          <p style={{ marginTop: '20px', letterSpacing: '2px' }}>A L W A Y S - W I T H - U</p>
        </div>
      </footer>
    </div>
  );
}

const buttonStyle = {
  backgroundColor: '#00dc64', // 네이버 웹툰 느낌의 그린
  color: 'black',
  border: 'none',
  padding: '15px 60px',
  fontSize: '18px',
  fontWeight: 'bold',
  borderRadius: '30px',
  cursor: 'pointer'
};