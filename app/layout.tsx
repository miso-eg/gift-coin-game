import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ギフトコイン当てゲーム",
  description: "TikTokギフトのコイン数を当てるゲーム",
};

const APP_VERSION = "Ver：2026/04/19-1";
const APP_CREDIT = "作成：みそ🎨🐾 @miso_eg";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="bg-gray-50 text-gray-900">
        <div className="min-h-screen flex flex-col">
          <main className="flex-1">{children}</main>

          <footer className="border-t bg-white px-6 py-4">
            <div className="mx-auto max-w-3xl text-center text-sm text-gray-500">
              <p>{APP_VERSION}</p>
              <p className="mt-1">{APP_CREDIT}</p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}