"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type RankingRecord = {
  id: string;
  player_name: string;
  tiktok_username: string | null;
  streak_count: number;
  created_at: string;
};

export default function RankingPage() {
  const [rankings, setRankings] = useState<RankingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const fetchRankings = async () => {
      setLoading(true);
      setErrorMessage("");

      const { data, error } = await supabase
        .from("streak_rankings")
        .select("id, player_name, tiktok_username, streak_count, created_at")
        .order("streak_count", { ascending: false })
        .order("created_at", { ascending: true })
        .limit(100);

      setLoading(false);

      if (error) {
        setErrorMessage("ランキングの取得に失敗しました。");
        return;
      }

      setRankings((data ?? []) as RankingRecord[]);
    };

    fetchRankings();
  }, []);

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="mx-auto max-w-4xl rounded-3xl border bg-white p-8 shadow-sm">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm text-gray-500">連続ランキング</p>
            <h1 className="text-3xl font-bold text-gray-900">
              ランキング一覧
            </h1>
          </div>

          <div className="rounded-full border bg-gray-50 px-4 py-2 text-sm text-gray-700">
            最大100件表示
          </div>
        </header>

        <section className="mt-8 rounded-2xl border bg-gray-50 p-6">
          <h2 className="text-lg font-semibold text-gray-900">
            ルール
          </h2>
          <ul className="mt-4 space-y-2 text-sm text-gray-700">
            <li>・対象は連続ランキングモードです</li>
            <li>・連続正解数が高い順に並びます</li>
            <li>・同点の場合は先に到達した記録が上位です</li>
          </ul>
        </section>

        <section className="mt-8">
          {loading ? (
            <div className="rounded-2xl border bg-gray-50 p-6 text-sm text-gray-700">
              ランキングを読み込み中です。
            </div>
          ) : errorMessage !== "" ? (
            <div className="rounded-2xl border border-red-300 bg-red-50 p-6 text-sm text-red-700">
              {errorMessage}
            </div>
          ) : rankings.length === 0 ? (
            <div className="rounded-2xl border bg-gray-50 p-6 text-sm text-gray-700">
              まだランキング登録がありません。
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border">
              <div className="grid grid-cols-[72px_1fr_1fr_120px] bg-gray-50 px-4 py-3 text-sm font-medium text-gray-700">
                <div>順位</div>
                <div>名前</div>
                <div>TikTokユーザー名</div>
                <div className="text-right">連続回答数</div>
              </div>

              <div className="divide-y">
                {rankings.map((record, index) => (
                  <div
                    key={record.id}
                    className="grid grid-cols-[72px_1fr_1fr_120px] items-center px-4 py-4 text-sm"
                  >
                    <div className="font-semibold text-gray-900">
                      {index + 1}
                    </div>

                    <div className="text-gray-900">
                      {record.player_name}
                    </div>

                    <div className="text-gray-600">
                      {record.tiktok_username && record.tiktok_username.trim() !== ""
                        ? record.tiktok_username
                        : "-"}
                    </div>

                    <div className="text-right font-bold text-gray-900">
                      {record.streak_count}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/"
            className="rounded-xl border border-gray-300 bg-white px-5 py-3 text-sm font-medium text-gray-800 transition hover:bg-gray-50"
          >
            トップへ戻る
          </Link>

          <Link
            href="/game?playMode=streak&count=5&showName=true&mode=input&allowTolerance=true&timeLimit=true"
            className="rounded-xl bg-black px-5 py-3 text-sm font-medium text-white transition hover:opacity-90"
          >
            連続ランキングモードで遊ぶ
          </Link>
        </div>
      </div>
    </main>
  );
}