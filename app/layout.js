import "./globals.css";

export const metadata = {
  title: "Surya Teja — Software Engineer · Full Stack Developer",
  description:
    "Surya Teja — Software Engineer and Full Stack Developer. A cinematic portfolio with Java, Grails, Jenkins, Python, and AWS.",
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
