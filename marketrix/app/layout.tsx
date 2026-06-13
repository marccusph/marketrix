import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Marketrix — Co-piloto de Estratégia",
  description:
    "Insira o site da sua empresa e seus concorrentes. A IA gera a SWOT e a matriz TOWS com 1 insight valioso por cruzamento.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
