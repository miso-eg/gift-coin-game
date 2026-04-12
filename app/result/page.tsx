"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

function getGrade(correct: number, total: number): string {
  if (total <= 0) {
    return "C";
  }

  const rate = correct / total;

  if (rate >= 0.8) return "A";
  if (rate >= 0.5) return "B";
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

  const count = Number(searchParams.get("count") ?? 5);
  const showName = searchParams.get("showName") ?? "true";
  const mode = searchParams.get("mode") ?? "multiple";
  const allowTolerance = searchParams.get("allowTolerance") ?? "true";
  const timeLimit = searchParams.get("timeLimit") ?? "true";

  const score = total > 0 ? Math.round((correct / total) * 100) : 0;
  const grade = getGrade(correct, total);
  const comment = getComment(correct, total);

  const replayHref = `/game?count=${count}&showName=${showName}&mode=${mode}&allowTolerance=${allowTolerance}&timeLimit=${timeLimit}`;

  const displayModeLabel = showName === "true" ? "あり" : "なし";
  const answerModeLabel = mode === "input" ? "自由入力" : "4択";
  const toleranceLabel =
    mode === "input"
      ? allowTolerance === "true"
        ? "誤差許容あり（±10%）"
        : "誤差許容なし"
      : "4択では未使用";

  const timeLimitLabel =
    timeLimit === "true" ? "あり（30秒）" : "なし";

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="mx-auto max-w-3xl rounded-3xl border bg-white p-8 shadow-sm">
        
        {/* ヘッダー */}
        <header className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">ゲーム結果</p>
            <h1 className="text-3xl font-bold">結果</h1>
          </div>
        </header>

        {/* 評価 */}
        <section className="mt-8 text-center">
          <p className="text-sm text-gray-500">今回の評価</p>
          <p className="text-5xl font-bold mt-2">{grade}</p>
          <p className="mt-4 text-gray-700">{comment}</p>
        </section>

        {/* スコア */}
        <section className="mt-8 grid grid-cols-3 gap-4">
          <div className="p-4 border rounded-xl text-center">
            <p className="text-sm text-gray-500">スコア</p>
            <p className="text-2xl font-bold">{score}</p>
          </div>

          <div className="p-4 border rounded-xl text-center">
            <p className="text-sm text-gray-500">正解数</p>
            <p className="text-2xl font-bold">
              {correct}/{total}
            </p>
          </div>

          <div className="p-4 border rounded-xl text-center">
            <p className="text-sm text-gray-500">正答率</p>
            <p className="text-2xl font-bold">
              {total > 0 ? Math.round((correct / total) * 100) : 0}%
            </p>
          </div>
        </section>

        {/* 設定表示 */}
        <section className="mt-8 border rounded-xl p-6 bg-gray-50">
          <h2 className="font-semibold">今回の設定</h2>

          <div className="mt-4 flex flex-wrap gap-2 text-sm">
            <span className="border px-3 py-1 rounded">
              出題数: {count}問
            </span>

            <span className="border px-3 py-1 rounded">
              ギフト名表示: {displayModeLabel}
            </span>

            <span className="border px-3 py-1 rounded">
              回答形式: {answerModeLabel}
            </span>

            {mode === "input" && (
              <span className="border px-3 py-1 rounded">
                {toleranceLabel}
              </span>
            )}

            <span className="border px-3 py-1 rounded">
              時間制限: {timeLimitLabel}
            </span>
          </div>
        </section>

        {/* ボタン */}
        <div className="mt-8 flex gap-3">
          <Link
            href={replayHref}
            className="flex-1 text-center bg-black text-white py-3 rounded-xl"
          >
            同じ設定でもう一度遊ぶ
          </Link>

          <Link
            href="/"
            className="flex-1 text-center border py-3 rounded-xl"
          >
            トップへ戻る
          </Link>
        </div>

      </div>
    </main>
  );
}