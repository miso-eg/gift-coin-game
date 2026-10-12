"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type GameMode = "multiple" | "input";
type PlayMode = "normal" | "streak";

export default function Home() {
  const [playMode, setPlayMode] = useState<PlayMode>("normal");
  const [questionCount, setQuestionCount] = useState(5);
  const [showGiftName, setShowGiftName] = useState(true);
  const [gameMode, setGameMode] = useState<GameMode>("multiple");
  const [allowTolerance, setAllowTolerance] = useState(true);
  const [timeLimitEnabled, setTimeLimitEnabled] = useState(true);

  const effectiveShowGiftName = playMode === "streak" ? true : showGiftName;
  const effectiveGameMode: GameMode =
    playMode === "streak" ? "input" : gameMode;
  const effectiveAllowTolerance =
    playMode === "streak" ? true : allowTolerance;
  const effectiveTimeLimitEnabled =
    playMode === "streak" ? true : timeLimitEnabled;

  const settingLabel = useMemo(() => {
    return playMode === "streak"
      ? "連続チャレンジモード"
      : `${questionCount}問モード`;
  }, [playMode, questionCount]);

  const displayModeLabel = effectiveShowGiftName ? "あり" : "なし";
  const answerModeLabel =
    effectiveGameMode === "multiple" ? "4択形式" : "自由入力形式";
  const toleranceLabel = effectiveAllowTolerance
    ? "誤差許容あり（±10%）"
    : "誤差許容なし";
  const timeLimitLabel = effectiveTimeLimitEnabled
    ? "時間制限あり（30秒）"
    : "時間制限なし";

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
              表示されたギフトのコイン数を当てるシンプルなゲームです。
            </p>
          </header>

          <section className="mt-8 grid gap-6 md:grid-cols-2">
            <div className="space-y-6">
              <div className="rounded-2xl border bg-gray-50 p-6">
                <h2 className="text-lg font-semibold text-gray-900">ルール</h2>

                <ul className="mt-4 space-y-3 text-sm text-gray-700">
                  <li>・通常モードでは出題数や表示設定を選べます</li>
                  <li>・連続チャレンジモードでは間違えるまで続きます</li>
                  <li>
                    ・連続チャレンジモードは自由入力、誤差許容あり、時間制限ありで固定です
                  </li>
                  <li>・時間制限ONでは1問30秒です</li>
                  <li>・最後に結果を確認できます</li>
                </ul>
              </div>
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
                <p className="mt-2 text-sm text-gray-700">
                  ギフト名表示: {displayModeLabel}
                </p>
                <p className="mt-1 text-sm text-gray-700">
                  回答形式: {answerModeLabel}
                </p>
                <p className="mt-1 text-sm text-gray-700">
                  {effectiveGameMode === "input"
                    ? toleranceLabel
                    : "誤差許容: 4択では未使用"}
                </p>
                <p className="mt-1 text-sm text-gray-700">{timeLimitLabel}</p>
              </div>

              <div className="mt-5">
                <p className="text-sm font-medium text-gray-700">モード</p>

                <div className="mt-3 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setPlayMode("normal")}
                    className={`rounded-xl border px-4 py-2 text-sm font-medium transition ${
                      playMode === "normal"
                        ? "border-black bg-black text-white"
                        : "border-gray-300 bg-white text-gray-800 hover:bg-gray-50"
                    }`}
                  >
                    通常
                  </button>

                  <button
                    type="button"
                    onClick={() => setPlayMode("streak")}
                    className={`rounded-xl border px-4 py-2 text-sm font-medium transition ${
                      playMode === "streak"
                        ? "border-black bg-black text-white"
                        : "border-gray-300 bg-white text-gray-800 hover:bg-gray-50"
                    }`}
                  >
                    連続チャレンジ
                  </button>
                </div>
              </div>

              {playMode === "normal" && (
                <>
                  <div className="mt-6">
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
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-700">
                          ギフト名表示
                        </p>
                        <p className="mt-1 text-sm text-gray-500">
                          {showGiftName
                            ? "ギフト名を表示します"
                            : "回答後にギフト名を表示します"}
                        </p>
                      </div>

                      <button
                        type="button"
                        role="switch"
                        aria-checked={showGiftName}
                        onClick={() => setShowGiftName((prev) => !prev)}
                        className={`relative inline-flex h-7 w-14 items-center rounded-full transition ${
                          showGiftName ? "bg-black" : "bg-gray-300"
                        }`}
                      >
                        <span className="sr-only">ギフト名表示切り替え</span>
                        <span
                          className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${
                            showGiftName ? "translate-x-8" : "translate-x-1"
                          }`}
                        />
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

                  <div className="mt-6">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-700">
                          誤差許容
                        </p>
                        <p className="mt-1 text-sm text-gray-500">
                          自由入力時のみ有効です
                        </p>
                      </div>

                      <button
                        type="button"
                        role="switch"
                        aria-checked={allowTolerance}
                        onClick={() => setAllowTolerance((prev) => !prev)}
                        className={`relative inline-flex h-7 w-14 items-center rounded-full transition ${
                          allowTolerance ? "bg-black" : "bg-gray-300"
                        } ${gameMode !== "input" ? "opacity-50" : ""}`}
                      >
                        <span className="sr-only">誤差許容切り替え</span>
                        <span
                          className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${
                            allowTolerance ? "translate-x-8" : "translate-x-1"
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  <div className="mt-6">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-700">
                          時間制限
                        </p>
                        <p className="mt-1 text-sm text-gray-500">
                          ONで1問30秒制限です
                        </p>
                      </div>

                      <button
                        type="button"
                        role="switch"
                        aria-checked={timeLimitEnabled}
                        onClick={() => setTimeLimitEnabled((prev) => !prev)}
                        className={`relative inline-flex h-7 w-14 items-center rounded-full transition ${
                          timeLimitEnabled ? "bg-black" : "bg-gray-300"
                        }`}
                      >
                        <span className="sr-only">時間制限切り替え</span>
                        <span
                          className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${
                            timeLimitEnabled ? "translate-x-8" : "translate-x-1"
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </>
              )}

              {playMode === "streak" && (
                <div className="mt-6 rounded-xl border bg-gray-50 p-4 text-sm text-gray-700">
                  連続チャレンジモードでは以下で固定です。<br />
                  ギフト名表示: あり / 回答形式: 自由入力 / 誤差許容: あり / 時間制限: あり
                </div>
              )}
            </div>
          </section>

          <section className="mt-8 rounded-2xl border bg-gray-50 p-6">
            <h2 className="text-lg font-semibold text-gray-900">開始前の確認</h2>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <span className="rounded-full border bg-white px-4 py-2 text-sm text-gray-700">
                モード: {playMode === "normal" ? "通常" : "連続チャレンジ"}
              </span>
              {playMode === "normal" && (
                <span className="rounded-full border bg-white px-4 py-2 text-sm text-gray-700">
                  出題数: {questionCount}問
                </span>
              )}
              <span className="rounded-full border bg-white px-4 py-2 text-sm text-gray-700">
                ギフト名表示: {displayModeLabel}
              </span>
              <span className="rounded-full border bg-white px-4 py-2 text-sm text-gray-700">
                回答形式: {answerModeLabel}
              </span>
              {effectiveGameMode === "input" && (
                <span className="rounded-full border bg-white px-4 py-2 text-sm text-gray-700">
                  {toleranceLabel}
                </span>
              )}
              <span className="rounded-full border bg-white px-4 py-2 text-sm text-gray-700">
                {timeLimitLabel}
              </span>
            </div>

            <div className="mt-6">
              <Link
                href={`/game?playMode=${playMode}&count=${questionCount}&showName=${effectiveShowGiftName}&mode=${effectiveGameMode}&allowTolerance=${effectiveAllowTolerance}&timeLimit=${effectiveTimeLimitEnabled}`}
                className="block rounded-xl bg-black px-5 py-3 text-center text-sm font-medium text-white transition hover:opacity-90"
              >
                ゲーム開始
              </Link>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}