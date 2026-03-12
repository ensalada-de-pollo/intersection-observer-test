import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@/src/generated/prisma/client';

export async function GET(request: Request) {
  try {
    const episodeId = 1;

    // 1. DB에서 해당 에피소드의 장면별 통계 집계
    const whereCondition: Prisma.WebtoonSceneStatWhereInput = {
      episodeId: episodeId
    };

    const groupedStats = await prisma.webtoonSceneStat.groupBy({
      by: ['sceneId'],
      where: whereCondition, // 분리된 조건 사용
      _sum: {
        totalDuration: true,
        rawDuration: true,
        viewCount: true,
      },
    });

    if (!groupedStats || groupedStats.length === 0) {
      return NextResponse.json({ error: '데이터가 없습니다.' }, { status: 404 });
    }

    // 2. 공통 데이터 가공 함수
    const processData = (isRaw: boolean) => {
      return groupedStats
        .map((item) => {
          const sumTime = isRaw 
            ? Number(item._sum.rawDuration || 0) 
            : Number(item._sum.totalDuration || 0);
          const count = item._sum.viewCount || 1;
          return {
            sceneId: item.sceneId,
            avg: Number((sumTime / count).toFixed(2)),
            viewCount: count,
          };
        })
        .sort((a, b) => {
          const numA = parseInt(a.sceneId.replace(/[^0-9]/g, '') || '0');
          const numB = parseInt(b.sceneId.replace(/[^0-9]/g, '') || '0');
          return numA - numB;
        });
    };

    const scenes = processData(false); // 스무딩 데이터
    const rawScenes = processData(true); // 원본 데이터

    // 3. 요약 통계 계산
    const avgEpisodeTime = scenes.reduce((acc, curr) => acc + curr.avg, 0);
    const rawAvgEpisodeTime = rawScenes.reduce((acc, curr) => acc + curr.avg, 0);
    const totalViews = Math.max(...scenes.map(s => s.viewCount));

    const worstScene = [...scenes].sort((a, b) => a.avg - b.avg)[0];

    return NextResponse.json({
      episodeId,
      totalViews,
      avgEpisodeTime,
      rawAvgEpisodeTime,
      worstScene,
      scenes,    // 스무딩 결과
      rawScenes, // 원본 결과
    });

  } catch (error) {
    console.error('❌ Stats API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}