"use client";

export const dynamic = "force-dynamic";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { Gift } from "@/types/gift";
import { gifts } from "@/data/gifts";

type GameMode = "multiple" | "input";
type PlayMode = "normal" | "streak";

const TOLERANCE_RATE = 0.1;
const TIME_LIMIT_SECONDS = 30;

function shuffleArray<T>(items: T[]): T[] {
  const copied = [...items];

  for (let i = copied.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copied[i], copied[j]] = [copied[j], copied[i]];
  }

  return copied;
}

function createChoices(currentGift: Gift, allGifts: Gift[]): number[] {
  const wrongChoices = Array.from(
    new Set(
      allGifts
        .filter((gift) => gift.id !== currentGift.id)
        .map((gift) => gift.coin)
        .filter((coin) => coin !== currentGift.coin)
    )
  );

  const selectedWrongChoices = shuffleArray(wrongChoices).slice(0, 3);
  const choices = [...selectedWrongChoices, currentGift.coin];

  return shuffleArray(choices);
}

function getChoiceButtonClassName(
  choice: number,
  selectedChoice: number | null,
  correctCoin: number,
  isAnswered: boolean
): string {
  const baseClassName =
    "rounded-2xl border px-5 py-4 text-left text-base font-medium transition";

  if (!isAnswered) {
    return `${baseClassName} border-gray-300 bg-white text-gray-900 hover:bg-gray-50 hover:border-gray-400`;
  }

  if (choice === correctCoin) {
    return `${baseClassName} border-green-600 bg-green-100 text-green-900`;
  }

  if (choice === selectedChoice && choice !== correctCoin) {
    return `${baseClassName} border-red-600 bg-red-100 text-red-900`;
  }

  return `${baseClassName} border-gray-200 bg-gray-100 text-gray-500`;
}

function getResultBoxClassName(isCorrect: boolean): string {
  if (isCorrect) {
    return "mt-6 rounded-2xl border border-green-600 bg-green-50 p-5 text-green-900";
  }

  return "mt-6 rounded-2xl border border-red-600 bg-red-50 p-5 text-red-900";
}

function isWithinTolerance(
  answer: number,
  correct: number,
  toleranceRate: number
): boolean {
  const margin = correct * toleranceRate;
  return Math.abs(answer - correct) <= margin;
}

function GamePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const playModeParam = (searchParams.get("playMode") ?? "normal") as PlayMode;
  const requestedCount = Number(searchParams.get("count") ?? 5);
  const showNameParam = searchParams.get("showName") ?? "true";
  const modeParam = (searchParams.get("mode") ?? "multiple") as GameMode;
  const allowToleranceParam = searchParams.get("allowTolerance") ?? "true";
  const timeLimitParam = searchParams.get("timeLimit") ?? "true";

  const playMode: PlayMode = playModeParam === "streak" ? "streak" : "normal";
  const questionCount =
    Number.isNaN(requestedCount) || requestedCount <= 0 ? 5 : requestedCount;

  const showGiftName = playMode === "streak" ? true : showNameParam === "true";
  const gameMode: GameMode =
    playMode === "streak"
      ? "input"
      : modeParam === "input"
        ? "input"
        : "multiple";
  const allowTolerance =
    playMode === "streak" ? true : allowToleranceParam === "true";
  const timeLimitEnabled =
    playMode === "streak" ? true : timeLimitParam === "true";

  const [gameGifts, setGameGifts] = useState<Gift[]>([]);
  const [choices, setChoices] = useState<number[]>([]);
  const [isReady, setIsReady] = useState(false);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [streakCount, setStreakCount] = useState(0);
  const [isAnswered, setIsAnswered] = useState(false);
  const [resultMessage, setResultMessage] = useState("");
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null);
  const [inputAnswer, setInputAnswer] = useState("");
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT_SECONDS);

  const currentGift = gameGifts[currentQuestionIndex];

  useEffect(() => {
    const nextGameGifts =
      playMode === "streak"
        ? shuffleArray(gifts)
        : shuffleArray(gifts).slice(0, questionCount);

    setGameGifts(nextGameGifts);
    setCurrentQuestionIndex(0);
    setCorrectCount(0);
    setStreakCount(0);
    setIsAnswered(false);
    setResultMessage("");
    setSelectedChoice(null);
    setInputAnswer("");
    setTimeLeft(TIME_LIMIT_SECONDS);
    setIsReady(true);
  }, [playMode, questionCount]);

  useEffect(() => {
    if (!currentGift) {
      setChoices([]);
      return;
    }

    if (gameMode === "multiple") {
      setChoices(createChoices(currentGift, gifts));
    } else {
      setChoices([]);
    }
  }, [currentGift, gameMode]);

  const currentInputNumber =
    inputAnswer.trim() === "" ? null : Number(inputAnswer);

  const isCurrentAnswerCorrect =
    gameMode === "multiple"
      ? isAnswered && selectedChoice === currentGift?.coin
      : isAnswered &&
        currentInputNumber !== null &&
        currentGift !== undefined &&
        (allowTolerance
          ? isWithinTolerance(currentInputNumber, currentGift.coin, TOLERANCE_RATE)
          : currentInputNumber === currentGift.coin);

  useEffect(() => {
    if (!timeLimitEnabled || isAnswered || !currentGift || !isReady) {
      return;
    }

    const timerId = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          window.clearInterval(timerId);
          setResultMessage(
            `時間切れ。不正解です。正解は ${currentGift.coin} コインです。`
          );
          setIsAnswered(true);
          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    return () => {
      window.clearInterval(timerId);
    };
  }, [timeLimitEnabled, isAnswered, currentGift, isReady]);

  const finishGame = () => {
    const totalForResult =
      playMode === "streak" ? streakCount + (isCurrentAnswerCorrect ? 0 : 1) : gameGifts.length;

    router.push(
      `/result?playMode=${playMode}&correct=${correctCount}&total=${totalForResult}&count=${questionCount}&showName=${showGiftName}&mode=${gameMode}&allowTolerance=${allowTolerance}&timeLimit=${timeLimitEnabled}&streak=${streakCount}`
    );
  };

  const handleSelectChoice = (selectedCoin: number) => {
    if (isAnswered || !currentGift) {
      return;
    }

    setSelectedChoice(selectedCoin);

    const isCorrect = selectedCoin === currentGift.coin;

    if (isCorrect) {
      setCorrectCount((prev) => prev + 1);
      if (playMode === "streak") {
        setStreakCount((prev) => prev + 1);
      }
      setResultMessage("正解です。");
    } else {
      setResultMessage(`不正解です。正解は ${currentGift.coin} コインです。`);
    }

    setIsAnswered(true);
  };

  const handleSubmitInputAnswer = () => {
    if (isAnswered || !currentGift) {
      return;
    }

    if (inputAnswer.trim() === "") {
      setResultMessage("コイン数を入力してください。");
      return;
    }

    const answerNumber = Number(inputAnswer);

    if (Number.isNaN(answerNumber)) {
      setResultMessage("数値を入力してください。");
      return;
    }

    const isCorrect = allowTolerance
      ? isWithinTolerance(answerNumber, currentGift.coin, TOLERANCE_RATE)
      : answerNumber === currentGift.coin;

    if (isCorrect) {
      setCorrectCount((prev) => prev + 1);
      if (playMode === "streak") {
        setStreakCount((prev) => prev + 1);
      }

      if (allowTolerance && answerNumber !== currentGift.coin) {
        const minValue = Math.ceil(currentGift.coin * (1 - TOLERANCE_RATE));
        const maxValue = Math.floor(currentGift.coin * (1 + TOLERANCE_RATE));
        setResultMessage(
          `正解です。正解は ${currentGift.coin} コインです。許容範囲（${minValue}〜${maxValue} コイン）内です。`
        );
      } else {
        setResultMessage("正解です。");
      }
    } else {
      if (allowTolerance) {
        const minValue = Math.ceil(currentGift.coin * (1 - TOLERANCE_RATE));
        const maxValue = Math.floor(currentGift.coin * (1 + TOLERANCE_RATE));
        setResultMessage(
          `不正解です。正解は ${currentGift.coin} コインです。正解範囲は ${minValue}〜${maxValue} コインです。`
        );
      } else {
        setResultMessage(`不正解です。正解は ${currentGift.coin} コインです。`);
      }
    }

    setIsAnswered(true);
  };

  const handleNextQuestion = () => {
    if (playMode === "streak" && !isCurrentAnswerCorrect) {
      finishGame();
      return;
    }

    const nextIndex = currentQuestionIndex + 1;

    if (nextIndex >= gameGifts.length) {
      finishGame();
      return;
    }

    setCurrentQuestionIndex(nextIndex);
    setIsAnswered(false);
    setResultMessage("");
    setSelectedChoice(null);
    setInputAnswer("");
    setTimeLeft(TIME_LIMIT_SECONDS);
  };

  if (!isReady || gameGifts.length === 0 || !currentGift) {
    return (
      <main className="min-h-screen bg-gray-50 px-6 py-10">
        <div className="mx-auto max-w-3xl rounded-3xl border bg-white p-8 shadow-sm">
          <p className="text-gray-700">読み込み中です。</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="mx-auto max-w-3xl rounded-3xl border bg-white p-8 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-gray-500">ゲーム中</p>
            <h1 className="mt-1 text-2xl font-bold text-gray-900">
              {playMode === "streak" ? "連続ランキングモード" : "このギフトのコイン数は？"}
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {playMode === "normal" ? (
              <div className="rounded-full border bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700">
                問題 {currentQuestionIndex + 1} / {gameGifts.length}
              </div>
            ) : (
              <div className="rounded-full border bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700">
                連続正解数 {streakCount}
              </div>
            )}

            <div className="rounded-full border bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700">
              {gameMode === "multiple" ? "4択" : "自由入力"}
            </div>

            {gameMode === "input" && allowTolerance && (
              <div className="rounded-full border bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700">
                ±10%
              </div>
            )}

            {timeLimitEnabled && (
              <div
                className={`rounded-full border px-4 py-2 text-sm font-medium ${
                  timeLeft <= 5
                    ? "border-red-300 bg-red-50 text-red-700"
                    : "bg-gray-50 text-gray-700"
                }`}
              >
                残り {timeLeft} 秒
              </div>
            )}

            <Link
              href="/"
              className="rounded-full border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-800 transition hover:bg-gray-50"
            >
              トップへ戻る
            </Link>
          </div>
        </div>

        <div className="mt-8 rounded-3xl border bg-gray-50 p-8 text-center">
          <p className="text-sm font-medium text-gray-500">ギフト</p>

          <div className="mt-5 flex justify-center">
            <div className="flex h-48 w-48 items-center justify-center rounded-2xl bg-white p-4 shadow-sm">
              <img
                src={currentGift.imageUrl}
                alt={currentGift.name}
                className="max-h-full max-w-full object-contain"
              />
            </div>
          </div>

          {showGiftName ? (
            <p className="mt-5 text-3xl font-bold text-gray-900">{currentGift.name}</p>
          ) : (
            <p className="mt-5 text-sm font-medium text-gray-500">ギフト名は非表示です</p>
          )}
        </div>

        {gameMode === "multiple" ? (
          <div className="mt-8">
            <p className="text-sm font-medium text-gray-700">選択肢</p>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {choices.map((choice) => (
                <button
                  key={`${currentQuestionIndex}-${choice}`}
                  onClick={() => handleSelectChoice(choice)}
                  disabled={isAnswered}
                  className={getChoiceButtonClassName(
                    choice,
                    selectedChoice,
                    currentGift.coin,
                    isAnswered
                  )}
                >
                  <span className="block text-sm text-gray-500">コイン数</span>
                  <span className="mt-1 block text-lg font-bold">{choice} コイン</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="mt-8">
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm font-medium text-gray-700">コイン数を入力</p>
              {allowTolerance && (
                <span className="rounded-full border bg-gray-50 px-4 py-2 text-xs text-gray-700">
                  誤差許容: ±10%
                </span>
              )}
            </div>

            <div className="mt-4 rounded-2xl border bg-gray-50 p-6">
              <input
                type="number"
                value={inputAnswer}
                onChange={(e) => setInputAnswer(e.target.value)}
                disabled={isAnswered}
                placeholder="例: 100"
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-base outline-none transition focus:border-gray-500 disabled:bg-gray-100"
              />

              {!isAnswered && (
                <button
                  onClick={handleSubmitInputAnswer}
                  className="mt-4 rounded-xl bg-black px-5 py-3 text-sm font-medium text-white transition hover:opacity-90"
                >
                  回答する
                </button>
              )}
            </div>
          </div>
        )}

        {resultMessage !== "" && (
          <div className={getResultBoxClassName(isCurrentAnswerCorrect)}>
            <p className="text-base font-semibold">{resultMessage}</p>

            {!showGiftName && (
              <p className="mt-2 text-sm">
                ギフト名: <span className="font-semibold">{currentGift.name}</span>
              </p>
            )}
          </div>
        )}

        <div className="mt-8 flex items-center justify-between gap-4">
          <div className="rounded-xl border bg-gray-50 px-4 py-3 text-sm text-gray-700">
            {playMode === "streak" ? (
              <>
                現在の連続正解数: <span className="font-bold text-gray-900">{streakCount}</span>
              </>
            ) : (
              <>
                現在の正解数: <span className="font-bold text-gray-900">{correctCount}</span>
              </>
            )}
          </div>

          {isAnswered && (
            <button
              onClick={handleNextQuestion}
              className="rounded-xl bg-black px-5 py-3 text-sm font-medium text-white transition hover:opacity-90"
            >
              {playMode === "streak" && !isCurrentAnswerCorrect
                ? "結果を見る"
                : currentQuestionIndex + 1 >= gameGifts.length
                  ? "結果を見る"
                  : "次の問題へ"}
            </button>
          )}
        </div>
      </div>
    </main>
  );
}

export default function GamePage() {
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
      <GamePageContent />
    </Suspense>
  );
}