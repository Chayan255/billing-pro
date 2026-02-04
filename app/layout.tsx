import "./globals.css";
import SWRegister from "./sw-register";

export const metadata = {
  title: "Billing Pro",
  description: "Offline First PWA Billing Software",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-100 text-gray-900">
        <SWRegister />
        {children}
      </body>
    </html>
  );
}
