module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ ok: false });

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.CHAT_ID;
  if (!token || !chatId) return res.status(500).json({ ok: false });

  const { name, phone, items, total, pay } = req.body || {};
  if (!name || !phone || !items) return res.status(400).json({ ok: false });

  const text =
    "🛒 Yangi buyurtma\n\n" +
    "👤 " + String(name).slice(0, 100) + "\n" +
    "📞 " + String(phone).slice(0, 30) + "\n" +
    "📦 " + String(items).slice(0, 1000) + "\n" +
    "💰 " + Number(total) + " so'm\n" +
    "💳 " + String(pay).slice(0, 20);

  const r = await fetch("https://api.telegram.org/bot" + token + "/sendMessage", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text })
  });

  return res.status(r.ok ? 200 : 502).json({ ok: r.ok });
};
