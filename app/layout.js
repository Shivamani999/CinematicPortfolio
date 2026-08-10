import "./globals.css";

export const metadata = {
  title: "Konam Shivamani — Senior Software Engineer · AI Automation Engineer SDET",
  description:
    "Konam Shivamani — Senior Software Engineer and AI Automation Engineer. A cinematic portfolio with Java, Grails, Jenkins, Python, and AWS.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#06060a",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
