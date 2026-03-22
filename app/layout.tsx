import type { Metadata } from "next";
import { Playfair_Display, Special_Elite } from "next/font/google";
import QueryProvider from "./query-provider";

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  weight: ["700", "900"],
  style: ["normal", "italic"],
  variable: "--font-playfair",
  display: "swap",
});

const specialElite = Special_Elite({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-special-elite",
  display: "swap",
});

export const metadata: Metadata = {
  title: "CinemaQuery — Search Cinema by Feeling",
  description:
    "Semantic movie search engine. Describe a mood, a vibe, a half-remembered concept. The archive will find the film.",
  keywords: ["movies", "semantic search", "cinema", "film", "recommendations"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${playfairDisplay.variable} ${specialElite.variable}`}
    >
      <body style={{ background: "#080808", margin: 0 }}>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
