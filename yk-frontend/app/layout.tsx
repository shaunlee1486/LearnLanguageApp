import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "YK Language Learn — Hệ Thống Học Ngoại Ngữ Thông Minh",
  description: "Học tiếng Anh, tiếng Trung, tiếng Nhật hiệu quả với phương pháp phản xạ, thẻ ghi nhớ (Flashcard), luyện viết bộ thủ và biểu đồ theo dõi tiến độ học tập.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
