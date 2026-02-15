import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Quay Lì Xì Tết 2026",
  description: "Mini game quay lì xì may mắn đầu năm",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
