"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type GameMode = "multiple" | "input";

export default function Home() {
  const [questionCount, setQuestionCount] = useState(5);
  const [showGiftName, setShowGiftName] = useState(true);
  const [gameMode, setGameMode] = useState<GameMode>("multiple");

  const settingLabel = useMemo(() => {
    return `${questionCount}問モード`;
  }, [questionCount]);

  const displayModeLabel = showGiftName ? "ギフト名あり" : "ギフト名なし";
  const answerModeLabel =
    gameMode === "multiple" ? "4択形式" : "自由入力形式";

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="mx-auto max-w-3xl">
        <div className="rounded-3xl border bg-white p-8 shadow-sm">
          <header>
            <p className="text-sm font-medium text-gray-500">
              TikTok Live Gift Quiz
            </p>
            <h1 className="mt-2 text-3xl font-bold text-gray-900">
              ギフトコイン当てゲーム
            </h1>
            <p className="mt-4 text-gray-700">
              表示されたギフトを見て、コイン数を当てるゲームです。
            </p>
          </header>

          <section className="mt-8 grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl border bg-gray-50 p-6">
              <h2 className="text-lg font-semibold text-gray-900">ルール</h2>

              <ul className="mt-4 space-y-3 text-sm text-gray-700">
                <li>・ギフト画像を見てコイン数を予想します</li>
                <li>・表示モードでギフト名の表示有無を選べます</li>
                <li>・回答形式は4択と自由入力から選べます</li>
                <li>・最後に正解数とスコアを確認できます</li>
              </ul>
            </div>

            <div className="rounded-2xl border p-6">
              <h2 className="text-lg font-semibold text-gray-900">
                ゲーム設定
              </h2>

              <div className="mt-4 rounded-xl border bg-gray-50 p-4">
                <p className="text-sm text-gray-500">現在の設定</p>
                <p className="mt-2 text-xl font-bold text-gray-900">
                  {settingLabel}
                </p>
                <p className="mt-2 text-sm text-gray-700">{displayModeLabel}</p>
                <p className="mt-1 text-sm text-gray-700">{answerModeLabel}</p>
              </div>

              <div className="mt-5">
                <p className="text-sm font-medium text-gray-700">問題数</p>

                <div className="mt-3 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setQuestionCount(5)}
                    className={`rounded-xl border px-4 py-2 text-sm font-medium transition ${
                      questionCount === 5
                        ? "border-black bg-black text-white"
                        : "border-gray-300 bg-white text-gray-800 hover:bg-gray-50"
                    }`}
                  >
                    5問
                  </button>

                  <button
                    type="button"
                    onClick={() => setQuestionCount(10)}
                    className={`rounded-xl border px-4 py-2 text-sm font-medium transition ${
                      questionCount === 10
                        ? "border-black bg-black text-white"
                        : "border-gray-300 bg-white text-gray-800 hover:bg-gray-50"
                    }`}
                  >
                    10問
                  </button>
                </div>
              </div>

              <div className="mt-6">
                <p className="text-sm font-medium text-gray-700">表示モード</p>

                <div className="mt-3 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowGiftName(true)}
                    className={`rounded-xl border px-4 py-2 text-sm font-medium transition ${
                      showGiftName
                        ? "border-black bg-black text-white"
                        : "border-gray-300 bg-white text-gray-800 hover:bg-gray-50"
                    }`}
                  >
                    ギフト名あり
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowGiftName(false)}
                    className={`rounded-xl border px-4 py-2 text-sm font-medium transition ${
                      !showGiftName
                        ? "border-black bg-black text-white"
                        : "border-gray-300 bg-white text-gray-800 hover:bg-gray-50"
                    }`}
                  >
                    ギフト名なし
                  </button>
                </div>
              </div>

              <div className="mt-6">
                <p className="text-sm font-medium text-gray-700">回答形式</p>

                <div className="mt-3 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setGameMode("multiple")}
                    className={`rounded-xl border px-4 py-2 text-sm font-medium transition ${
                      gameMode === "multiple"
                        ? "border-black bg-black text-white"
                        : "border-gray-300 bg-white text-gray-800 hover:bg-gray-50"
                    }`}
                  >
                    4択
                  </button>

                  <button
                    type="button"
                    onClick={() => setGameMode("input")}
                    className={`rounded-xl border px-4 py-2 text-sm font-medium transition ${
                      gameMode === "input"
                        ? "border-black bg-black text-white"
                        : "border-gray-300 bg-white text-gray-800 hover:bg-gray-50"
                    }`}
                  >
                    自由入力
                  </button>
                </div>
              </div>
            </div>
          </section>

          <section className="mt-8 rounded-2xl border bg-gray-50 p-6">
            <h2 className="text-lg font-semibold text-gray-900">開始前の確認</h2>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <span className="rounded-full border bg-white px-4 py-2 text-sm text-gray-700">
                出題数: {questionCount}問
              </span>
              <span className="rounded-full border bg-white px-4 py-2 text-sm text-gray-700">
                表示: {displayModeLabel}
              </span>
              <span className="rounded-full border bg-white px-4 py-2 text-sm text-gray-700">
                回答形式: {answerModeLabel}
              </span>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href={`/game?count=${questionCount}&showName=${showGiftName}&mode=${gameMode}`}
                className="rounded-xl bg-black px-5 py-3 text-sm font-medium text-white transition hover:opacity-90"
              >
                {questionCount}問でゲーム開始
              </Link>

              <Link
                href="/result"
                className="rounded-xl border border-gray-300 bg-white px-5 py-3 text-sm font-medium text-gray-800 transition hover:bg-gray-50"
              >
                結果画面を見る
              </Link>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}