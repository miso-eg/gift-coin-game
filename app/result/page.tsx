"use client";

import Link from "next/link";
import { Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";

type PlayMode = "normal" | "streak";

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
    return "連続チャレンジの結果です。自分の記録に挑戦しましょう。";
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

function ResultPageContent() {
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

  const displayModeLabel = showName === "true" ? "あり" : "なし";
  const answerModeLabel = mode === "input" ? "自由入力" : "4択";
  const toleranceLabel =
    mode === "input"
      ? allowTolerance === "true"
        ? "誤差許容あり（±10%）"
        : "誤差許容なし"
      : "4択では未使用";
  const timeLimitLabel = timeLimit === "true" ? "あり（30秒）" : "なし";

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

        <section className="mt-8 rounded-xl border bg-gray-50 p-6">
          <h2 className="font-semibold">今回の設定</h2>

          <div className="mt-4 flex flex-wrap gap-2 text-sm">
            <span className="rounded border px-3 py-1">
              モード: {playMode === "streak" ? "連続チャレンジ" : "通常"}
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
