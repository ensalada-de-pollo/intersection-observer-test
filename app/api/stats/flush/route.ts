import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { episodeId, stats } = body;
    
    // SQLite 날짜 정규화 (시간 제거)
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const upsertPromises = Object.entries(stats).map(([sceneId, duration]) => {
      return prisma.webtoonSceneStat.upsert({
        where: {
          daily_scene_unique_constraint: {
            viewDate: today,
            episodeId: Number(episodeId),
            sceneId: sceneId,
          },
        },
        update: {
          totalDuration: { increment: duration as number },
          viewCount: { increment: 1 },
        },
        create: {
          viewDate: today,
          episodeId: Number(episodeId),
          sceneId: sceneId,
          totalDuration: duration as number,
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