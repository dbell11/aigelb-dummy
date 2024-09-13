import { Inter } from "next/font/google";
import "./globals.css";
import Template from "./template";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.className} bg-gray-50 bg-gradient-to-t from-gray-100 via-gray-50 to-gray-100`}
      >
        <Template>{children}</Template>
      </body>
    </html>
  );
}
