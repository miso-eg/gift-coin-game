"use client";

export const dynamic = "force-dynamic";

import Link from "next/link";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

type PlayMode = "normal" | "streak";

type RankingRecord = {
  id: string;
  player_name: string;
  tiktok_username: string | null;
  streak_count: number;
  created_at: string;
};

function getGrade(correct: number, total: number): string {
  if (total <= 0) {
    return "C";
  }

  const rate = correct / total;

  if (rate >= 0.8) return "A";
  if (rate >= 0.5) return "B";
  return "C";
}

function getComment(correct: number, total: number, playMode: PlayMode): string {
  if (playMode === "streak") {
    return "連続ランキングモードの結果です。100位以内に入ると登録できます。";
  }

  if (total <= 0) {
    return "結果を計算できませんでした。";
  }

  const rate = correct / total;

  if (rate >= 0.8) {
    return "かなり良い結果です。このまま高得点を狙えます。";
  }

  if (rate >= 0.5) {
    return "安定した成績です。もう少しで高評価です。";
  }

  return "まだ伸ばせます。繰り返し挑戦して感覚を掴めます。";
}

function normalizeTikTokUsername(value: string): string | null {
  const trimmed = value.trim();

  if (trimmed === "") {
    return null;
  }

  return trimmed.startsWith("@") ? trimmed : `@${trimmed}`;
}

function ResultPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const playModeParam = (searchParams.get("playMode") ?? "normal") as PlayMode;
  const playMode: PlayMode = playModeParam === "streak" ? "streak" : "normal";

  const correct = Number(searchParams.get("correct") ?? 0);
  const total = Number(searchParams.get("total") ?? 0);
  const streak = Number(searchParams.get("streak") ?? 0);

  const count = Number(searchParams.get("count") ?? 5);
  const showName = searchParams.get("showName") ?? "true";
  const mode = searchParams.get("mode") ?? "multiple";
  const allowTolerance = searchParams.get("allowTolerance") ?? "true";
  const timeLimit = searchParams.get("timeLimit") ?? "true";

  const score = total > 0 ? Math.round((correct / total) * 100) : 0;
  const grade = getGrade(correct, total);
  const comment = getComment(correct, total, playMode);

  const replayHref = useMemo(() => {
    return playMode === "streak"
      ? `/game?playMode=streak&count=${count}&showName=true&mode=input&allowTolerance=true&timeLimit=true`
      : `/game?playMode=normal&count=${count}&showName=${showName}&mode=${mode}&allowTolerance=${allowTolerance}&timeLimit=${timeLimit}`;
  }, [playMode, count, showName, mode, allowTolerance, timeLimit]);

  const rankingHref = "/ranking";

  const displayModeLabel = showName === "true" ? "あり" : "なし";
  const answerModeLabel = mode === "input" ? "自由入力" : "4択";
  const toleranceLabel =
    mode === "input"
      ? allowTolerance === "true"
        ? "誤差許容あり（±10%）"
        : "誤差許容なし"
      : "4択では未使用";
  const timeLimitLabel = timeLimit === "true" ? "あり（30秒）" : "なし";

  const [rankingLoading, setRankingLoading] = useState(false);
  const [rankingError, setRankingError] = useState("");
  const [canRegister, setCanRegister] = useState(false);
  const [currentBorderScore, setCurrentBorderScore] = useState<number | null>(null);
  const [rankingsCount, setRankingsCount] = useState(0);

  const [playerName, setPlayerName] = useState("");
  const [tiktokUsername, setTiktokUsername] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");
  const [isRegistered, setIsRegistered] = useState(false);

  const targetScore = useMemo(() => {
    return playMode === "streak" ? streak : 0;
  }, [playMode, streak]);

  useEffect(() => {
    if (playMode !== "streak") {
      return;
    }

    const fetchRankingsForQualification = async () => {
      setRankingLoading(true);
      setRankingError("");

      const { data, error } = await supabase
        .from("streak_rankings")
        .select("id, player_name, tiktok_username, streak_count, created_at")
        .order("streak_count", { ascending: false })
        .order("created_at", { ascending: true })
        .limit(100);

      setRankingLoading(false);

      if (error) {
        setRankingError(
          "ランキング判定の取得に失敗しました。時間をおいて再度お試しください。"
        );
        return;
      }

      const rankings = (data ?? []) as RankingRecord[];
      setRankingsCount(rankings.length);

      if (rankings.length === 0) {
        setCanRegister(true);
        setCurrentBorderScore(null);
        return;
      }

      if (rankings.length < 100) {
        setCanRegister(true);
        setCurrentBorderScore(rankings[rankings.length - 1]?.streak_count ?? null);
        return;
      }

      const borderScore = rankings[99].streak_count;
      setCurrentBorderScore(borderScore);
      setCanRegister(targetScore > borderScore);
    };

    fetchRankingsForQualification();
  }, [playMode, targetScore]);

  useEffect(() => {
    if (!isRegistered) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      router.push("/ranking");
    }, 2000);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [isRegistered, router]);

  const handleSubmitRanking = async () => {
    if (playMode !== "streak" || !canRegister || isRegistered || isSubmitting) {
      return;
    }

    const normalizedPlayerName = playerName.trim();
    const normalizedTikTokUsername = normalizeTikTokUsername(tiktokUsername);

    if (normalizedPlayerName === "") {
      setSubmitMessage("名前を入力してください。");
      return;
    }

    if (normalizedPlayerName.length > 20) {
      setSubmitMessage("名前は20文字以内で入力してください。");
      return;
    }

    if (normalizedTikTokUsername && normalizedTikTokUsername.length > 30) {
      setSubmitMessage("TikTokユーザー名は30文字以内で入力してください。");
      return;
    }

    setIsSubmitting(true);
    setSubmitMessage("");

    try {
      const response = await fetch("/api/rankings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          playerName: normalizedPlayerName,
          tiktokUsername: normalizedTikTokUsername,
          streakCount: targetScore,
        }),
      });

      if (!response.ok) {
        setSubmitMessage(
          "通信エラーが発生しました。時間をおいて再度お試しください。"
        );
        setIsSubmitting(false);
        return;
      }

      setIsRegistered(true);
      setSubmitMessage("ランキングに登録しました。ランキング画面へ移動します。");
    } catch {
      setSubmitMessage(
        "通信エラーが発生しました。時間をおいて再度お試しください。"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="mx-auto max-w-3xl rounded-3xl border bg-white p-8 shadow-sm">
        <header className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">ゲーム結果</p>
            <h1 className="text-3xl font-bold">結果</h1>
          </div>
        </header>

        <section className="mt-8 text-center">
          <p className="text-sm text-gray-500">今回の評価</p>
          <p className="mt-2 text-5xl font-bold">
            {playMode === "streak" ? "STREAK" : grade}
          </p>
          <p className="mt-4 text-gray-700">{comment}</p>
        </section>

        {playMode === "streak" ? (
          <section className="mt-8 grid grid-cols-2 gap-4">
            <div className="rounded-xl border p-4 text-center">
              <p className="text-sm text-gray-500">連続回答数</p>
              <p className="text-3xl font-bold">{streak}</p>
            </div>

            <div className="rounded-xl border p-4 text-center">
              <p className="text-sm text-gray-500">最終問題数</p>
              <p className="text-3xl font-bold">{total}</p>
            </div>
          </section>
        ) : (
          <section className="mt-8 grid grid-cols-3 gap-4">
            <div className="rounded-xl border p-4 text-center">
              <p className="text-sm text-gray-500">スコア</p>
              <p className="text-2xl font-bold">{score}</p>
            </div>

            <div className="rounded-xl border p-4 text-center">
              <p className="text-sm text-gray-500">正解数</p>
              <p className="text-2xl font-bold">
                {correct}/{total}
              </p>
            </div>

            <div className="rounded-xl border p-4 text-center">
              <p className="text-sm text-gray-500">正答率</p>
              <p className="text-2xl font-bold">
                {total > 0 ? Math.round((correct / total) * 100) : 0}%
              </p>
            </div>
          </section>
        )}

        {playMode === "streak" && (
          <section className="mt-8 rounded-xl border bg-gray-50 p-6">
            <h2 className="font-semibold">ランキング登録</h2>

            {rankingLoading ? (
              <p className="mt-4 text-sm text-gray-600">
                ランキング判定を確認中です。
              </p>
            ) : rankingError !== "" ? (
              <p className="mt-4 text-sm text-red-600">{rankingError}</p>
            ) : canRegister ? (
              <>
                <p className="mt-4 text-sm text-gray-700">
                  今回の記録はランキング登録対象です。
                </p>

                <div className="mt-4 space-y-4">
                  <div>
                    <label
                      htmlFor="playerName"
                      className="block text-sm font-medium text-gray-700"
                    >
                      名前（必須）
                    </label>
                    <input
                      id="playerName"
                      type="text"
                      value={playerName}
                      onChange={(e) => setPlayerName(e.target.value)}
                      maxLength={20}
                      disabled={isSubmitting || isRegistered}
                      className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-gray-500 disabled:bg-gray-100"
                      placeholder="例: みそ"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="tiktokUsername"
                      className="block text-sm font-medium text-gray-700"
                    >
                      TikTokユーザー名（任意）
                    </label>
                    <input
                      id="tiktokUsername"
                      type="text"
                      value={tiktokUsername}
                      onChange={(e) => setTiktokUsername(e.target.value)}
                      maxLength={30}
                      disabled={isSubmitting || isRegistered}
                      className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-gray-500 disabled:bg-gray-100"
                      placeholder="例: @miso_eg"
                    />
                  </div>

                  <button
                    onClick={handleSubmitRanking}
                    disabled={isSubmitting || isRegistered}
                    className="rounded-xl bg-black px-5 py-3 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50"
                  >
                    {isSubmitting
                      ? "登録中..."
                      : isRegistered
                        ? "登録済み"
                        : "ランキング登録"}
                  </button>

                  {submitMessage !== "" && (
                    <p
                      className={`text-sm ${
                        isRegistered ? "text-green-700" : "text-red-600"
                      }`}
                    >
                      {submitMessage}
                    </p>
                  )}
                </div>
              </>
            ) : (
              <div className="mt-4 space-y-2 text-sm text-gray-700">
                <p>今回はランキング圏外です。</p>
                <p>今回の連続回答数: {streak}</p>
                {rankingsCount >= 100 && currentBorderScore !== null && (
                  <p>現在の100位記録: {currentBorderScore}</p>
                )}
              </div>
            )}
          </section>
        )}

        <section className="mt-8 rounded-xl border bg-gray-50 p-6">
          <h2 className="font-semibold">今回の設定</h2>

          <div className="mt-4 flex flex-wrap gap-2 text-sm">
            <span className="rounded border px-3 py-1">
              モード: {playMode === "streak" ? "連続ランキング" : "通常"}
            </span>

            {playMode === "normal" && (
              <span className="rounded border px-3 py-1">
                出題数: {count}問
              </span>
            )}

            <span className="rounded border px-3 py-1">
              ギフト名表示: {playMode === "streak" ? "あり" : displayModeLabel}
            </span>

            <span className="rounded border px-3 py-1">
              回答形式: {playMode === "streak" ? "自由入力" : answerModeLabel}
            </span>

            <span className="rounded border px-3 py-1">
              {playMode === "streak" ? "誤差許容あり（±10%）" : toleranceLabel}
            </span>

            <span className="rounded border px-3 py-1">
              時間制限: {playMode === "streak" ? "あり（30秒）" : timeLimitLabel}
            </span>
          </div>
        </section>

        <div className="mt-8 flex gap-3">
          <Link
            href={replayHref}
            className="flex-1 rounded-xl bg-black py-3 text-center text-white"
          >
            同じ設定でもう一度遊ぶ
          </Link>

          <Link
            href={rankingHref}
            className="flex-1 rounded-xl border py-3 text-center"
          >
            ランキングを見る
          </Link>

          <Link
            href="/"
            className="flex-1 rounded-xl border py-3 text-center"
          >
            トップへ戻る
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function ResultPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-gray-50 px-6 py-10">
          <div className="mx-auto max-w-3xl rounded-3xl border bg-white p-8 shadow-sm">
            <p className="text-gray-700">読み込み中です。</p>
          </div>
        </main>
      }
    >
      <ResultPageContent />
    </Suspense>
  );
}