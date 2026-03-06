'use client';

import { useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';

export default function WebtoonPage() {
  const params = useParams();
  const episodeId = params.id;
  
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

  // UI는 이전과 동일 (인라인 스타일 유지)
  return (
    <div style={{ backgroundColor: '#111', minHeight: '100vh', color: 'white', position: 'relative', maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ position: 'fixed', top: '50%', left: 0, width: '100%', height: '2px', backgroundColor: 'red', zIndex: 9999, pointerEvents: 'none' }} />
      
      <header style={{ padding: '20px', textAlign: 'center', borderBottom: '1px solid #333' }}>
        <h1>웹툰 통계 테스트</h1>
        <p>스크롤 시 콘솔 창을 확인하세요!</p>
      </header>
      
      <div style={{ position: 'relative' }}>
        <img src="https://placehold.co/600x4000/222/white?text=WEBTOON+STORY" alt="webtoon" style={{ width: '100%', display: 'block' }} />
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div
              key={i}
              className="scene-trigger"
              data-scene-id={`scene_${i}`}
              style={{ height: '500px', borderBottom: '1px dashed rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'yellow' }}
            >
              Scene {i}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}