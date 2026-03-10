import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const stats = await prisma.webtoonSceneStat.findMany({
      orderBy: { sceneId: 'asc' }
    });

    // 에피소드별로 데이터 그룹화
    const grouped = stats.reduce((acc: any, curr) => {
      const epId = curr.episodeId;
      if (!acc[epId]) {
        acc[epId] = {
          episodeId: epId,
          totalDuration: 0,
          totalViews: 0,
          scenes: []
        };
      }
      acc[epId].totalDuration += curr.totalDuration;
      acc[epId].totalViews += curr.viewCount;
      acc[epId].scenes.push(curr);
      return acc;
    }, {});

    return NextResponse.json(Object.values(grouped));
  } catch (error) {
    return NextResponse.json({ error: '데이터 로드 실패' }, { status: 500 });
  }
}