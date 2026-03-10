import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // 모든 통계 데이터를 최신순으로 가져옴
    const stats = await prisma.webtoonSceneStat.findMany({
      orderBy: [
        { viewDate: 'desc' },
        { episodeId: 'asc' },
        { sceneId: 'asc' }
      ]
    });

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Fetch Stats Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}