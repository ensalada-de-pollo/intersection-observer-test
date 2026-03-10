export const runtime = 'nodejs';

export const metadata = {
  title: 'Webtoon Stats Test',
  description: 'Intersection Observer Testing',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>
        {children}
      </body>
    </html>
  );
}