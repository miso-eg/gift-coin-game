"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

function getGrade(correct: number, total: number): string {
  if (total <= 0) {
    return "C";
  }

  const rate = correct / total;

  if (rate >= 0.8) {
    return "A";
  }

  if (rate >= 0.5) {
    return "B";
  }

  return "C";
}

function getComment(correct: number, total: number): string {
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

export default function ResultPage() {
  const searchParams = useSearchParams();

  const correct = Number(searchParams.get("correct") ?? 0);
  const total = Number(searchParams.get("total") ?? 0);

  const score = total > 0 ? Math.round((correct / total) * 100) : 0;
  const grade = getGrade(correct, total);
  const comment = getComment(correct, total);

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="mx-auto max-w-3xl rounded-3xl border bg-white p-8 shadow-sm">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-gray-500">ゲーム結果</p>
            <h1 className="mt-1 text-3xl font-bold text-gray-900">結果</h1>
          </div>

          <div className="rounded-full border bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700">
            プレイ完了
          </div>
        </header>

        <section className="mt-8 rounded-3xl border bg-gray-50 p-8 text-center">
          <p className="text-sm font-medium text-gray-500">今回の評価</p>
          <p className="mt-3 text-5xl font-bold text-gray-900">{grade}</p>
          <p className="mt-4 text-sm text-gray-700">{comment}</p>
        </section>

        <section className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border bg-white p-6">
            <p className="text-sm font-medium text-gray-500">スコア</p>
            <p className="mt-3 text-3xl font-bold text-gray-900">{score}</p>
          </div>

          <div className="rounded-2xl border bg-white p-6">
            <p className="text-sm font-medium text-gray-500">正解数</p>
            <p className="mt-3 text-3xl font-bold text-gray-900">
              {correct} / {total}
            </p>
          </div>

          <div className="rounded-2xl border bg-white p-6">
            <p className="text-sm font-medium text-gray-500">正答率</p>
            <p className="mt-3 text-3xl font-bold text-gray-900">
              {total > 0 ? Math.round((correct / total) * 100) : 0}%
            </p>
          </div>
        </section>

        <section className="mt-8 rounded-2xl border bg-gray-50 p-6">
          <h2 className="text-lg font-semibold text-gray-900">今回のまとめ</h2>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <span className="rounded-full border bg-white px-4 py-2 text-sm text-gray-700">
              評価: {grade}
            </span>
            <span className="rounded-full border bg-white px-4 py-2 text-sm text-gray-700">
              スコア: {score}
            </span>
            <span className="rounded-full border bg-white px-4 py-2 text-sm text-gray-700">
              正解数: {correct} / {total}
            </span>
          </div>
        </section>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/game?count=5"
            className="rounded-xl bg-black px-5 py-3 text-sm font-medium text-white transition hover:opacity-90"
          >
            5問でもう一度遊ぶ
          </Link>

          <Link
            href="/"
            className="rounded-xl border border-gray-300 bg-white px-5 py-3 text-sm font-medium text-gray-800 transition hover:bg-gray-50"
          >
            トップへ戻る
          </Link>
        </div>
      </div>
    </main>
  );
}