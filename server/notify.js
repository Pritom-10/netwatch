export async function sendTelegram(text) {
  const token = process.env.TELEGRAM_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    console.log('Telegram: .env থেকে TOKEN বা CHAT_ID পাওয়া যায়নি');
    return false;
  }

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text }),
      signal: AbortSignal.timeout(8000),
    });
    const data = await res.json();
    if (!data.ok) {
      console.log('Telegram এরর:', data.description);
      return false;
    }
    return true;
  } catch (err) {
    console.log('Telegram নেটওয়ার্ক এরর:', err.message);
    return false;
  }
}