import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { episodeId, stats } = body;

    // 1. 데이터 검증: episodeId가 없거나 숫자가 아니면 에러 반환
    const parsedEpisodeId = Number(episodeId);
    if (!episodeId || isNaN(parsedEpisodeId)) {
      console.error('❌ 유효하지 않은 episodeId:', episodeId);
      return NextResponse.json({ error: 'Invalid episodeId' }, { status: 400 });
    }

    if (!stats || Object.keys(stats).length === 0) {
      return NextResponse.json({ success: true, message: 'No stats to flush' });
    }

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const upsertPromises = Object.entries(stats).map(([sceneId, duration]) => {
      return prisma.webtoonSceneStat.upsert({
        where: {
          daily_scene_unique_constraint: {
            viewDate: today,
            episodeId: parsedEpisodeId, // 검증된 숫자 사용
            sceneId: sceneId,
          },
        },
        update: {
          totalDuration: { increment: Number(duration) },
          viewCount: { increment: 1 },
        },
        create: {
          viewDate: today,
          episodeId: parsedEpisodeId, // 검증된 숫자 사용
          sceneId: sceneId,
          totalDuration: Number(duration),
          viewCount: 1,
        },
      });
    });

    await Promise.all(upsertPromises);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Flush Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

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