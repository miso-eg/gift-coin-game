import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // ←重要
);

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { playerName, tiktokUsername, streakCount } = body;

    if (!playerName || typeof streakCount !== "number") {
      return NextResponse.json(
        { error: "入力が不正です" },
        { status: 400 }
      );
    }

    const normalizedTikTok =
      tiktokUsername && tiktokUsername.trim() !== ""
        ? tiktokUsername.startsWith("@")
          ? tiktokUsername
          : `@${tiktokUsername}`
        : null;

    const { error } = await supabase.from("streak_rankings").insert({
      player_name: playerName,
      tiktok_username: normalizedTikTok,
      streak_count: streakCount,
    });

    if (error) {
      return NextResponse.json(
        { error: "DB登録に失敗" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "サーバーエラー" },
      { status: 500 }
    );
  }
}