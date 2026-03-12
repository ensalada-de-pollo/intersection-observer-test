import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { episodeId, stats, rawStats } = body;

    // 1. 데이터 검증
    const parsedEpisodeId = Number(episodeId);
    if (!episodeId || isNaN(parsedEpisodeId)) {
      console.error('❌ 유효하지 않은 episodeId:', episodeId);
      return NextResponse.json({ error: 'Invalid episodeId' }, { status: 400 });
    }

    if (!stats || Object.keys(stats).length === 0) {
      return NextResponse.json({ success: true, message: 'No stats to flush' });
    }

    const now = new Date();

    // stats(스무딩) 기준으로 insert, rawStats가 있으면 rawDuration도 함께 저장
    const insertData = Object.entries(stats).map(([sceneId, duration]) => ({
      viewDate: now,
      episodeId: parsedEpisodeId,
      sceneId,
      totalDuration: Number(duration),
      rawDuration: rawStats?.[sceneId] != null ? Number(rawStats[sceneId]) : Number(duration),
      viewCount: 1,
    }));

    await prisma.webtoonSceneStat.createMany({
      data: insertData,
    });

    return NextResponse.json({ success: true, count: insertData.length });
  } catch (error) {
    console.error('Flush Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
