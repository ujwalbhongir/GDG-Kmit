import './globals.css';

export const metadata = {
  title: 'AgentX 2.0 — AI-Powered Productivity Toolkit',
  description: 'Weather, Tasks, CSV Analytics, AI Search, Goal Tracking & Email — your complete AI productivity suite.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
