import type { Metadata } from "next";
import "./globals.css";

const SITE_URL = "https://apart-mbti.vercel.app"; // TODO: 실제 Vercel URL로 교체

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "내집마련 가이드: 부동산 MBTI & 10.15 대출 계산기",
  description:
    "나의 부동산 성향을 분석하고, 최신 10.15 대책이 반영된 내 집 마련 실전 예산을 확인해 보세요.",
  openGraph: {
    title: "내집마련 가이드: 부동산 MBTI & 10.15 대출 계산기",
    description:
      "나의 부동산 성향을 분석하고, 최신 10.15 대책이 반영된 내 집 마련 실전 예산을 확인해 보세요.",
    url: SITE_URL,
    siteName: "첫 집 마련 가이드",
    images: [
      {
        url: "/thumbnail.png",
        width: 1200,
        height: 630,
        alt: "첫 집 마련 MBTI — 부동산 성향 테스트 & 대출 계산기",
      },
    ],
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "내집마련 가이드: 부동산 MBTI & 10.15 대출 계산기",
    description:
      "나의 부동산 성향을 분석하고, 최신 10.15 대책이 반영된 내 집 마련 실전 예산을 확인해 보세요.",
    images: ["/thumbnail.png"],
  },
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
