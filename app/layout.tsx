import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "UNO App",
  description: "UNO card game application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
