import localFont from "next/font/local";
import "./globals.css";
import { VersionFooter } from "@/components/VersionFooter";
import { versionView } from "@/lib/version";

const jetbrains = localFont({
  src: [
    { path: "../../public/fonts/JetBrainsMono-Regular.ttf", weight: "400" },
    { path: "../../public/fonts/JetBrainsMono-Bold.ttf", weight: "700" },
  ],
  variable: "--font-jetbrains",
});

export const metadata = {
  metadataBase: new URL("https://rectorspace.com"),
  title: "RECTOR",
  description: "Building for Eternity",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={jetbrains.variable}>
      <body>
        {children}
        <VersionFooter {...versionView()} />
      </body>
    </html>
  );
}
