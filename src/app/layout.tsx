import './globals.css';
import AppShell from './AppShell';

export const metadata = {
  title: '找到你想做的事 — 交互指南',
  description: '基于《如何找到你想做的事》（八木仁平）的交互式自我认知工具',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="min-h-screen flex">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
