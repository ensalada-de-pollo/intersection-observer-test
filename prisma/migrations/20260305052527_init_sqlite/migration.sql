-- CreateTable
CREATE TABLE "webtoon_scene_stats" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "episode_id" INTEGER NOT NULL,
    "scene_id" TEXT NOT NULL,
    "view_date" DATETIME NOT NULL,
    "total_duration" REAL NOT NULL DEFAULT 0,
    "view_count" INTEGER NOT NULL DEFAULT 0
);

-- CreateIndex
CREATE UNIQUE INDEX "webtoon_scene_stats_view_date_episode_id_scene_id_key" ON "webtoon_scene_stats"("view_date", "episode_id", "scene_id");
