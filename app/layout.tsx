import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "첫 집 마련 MBTI — 나는 어떤 부동산이 사고싶은 걸까?",
  description:
    "2030 신혼부부를 위한 첫 집 마련 성향 테스트. 당신의 부동산 MBTI를 알아보세요.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <link
          rel="stylesheet"
          as="style"
          crossOrigin="anonymous"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css"
        />
      </head>
      <body
        style={{ fontFamily: "'Pretendard', ui-sans-serif, system-ui, sans-serif" }}
        className="min-h-screen bg-slate-50 text-slate-900 antialiased"
      >
        {children}
      </body>
    </html>
  );
}
