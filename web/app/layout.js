import './globals.css';

export const metadata = {
  title: 'NetWatch',
  description: 'ইন্টারনেট ডাউনটাইম ট্র্যাকার',
};

export default function RootLayout({ children }) {
  return (
    <html lang="bn">
      <body>{children}</body>
    </html>
  );
}