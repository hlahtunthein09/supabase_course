
import "./globals.css";
import Header from "@/components/Header";

export const metadata = {
  title: "My App",
  description: "Supabase + Next.js + TS"
}

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Header />
        {children}
      </body>
    </html>
  );
}