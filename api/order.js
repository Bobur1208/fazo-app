module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ ok: false });
  const b = req.body || {};
  const items = Array.isArray(b.items) ? b.items.slice(0, 50) : [];
  if (!b.phone || items.length === 0) {
    return res.status(400).json({ ok: false });
  }
  const lines = items.map(function (i) {
    return '• ' + String(i.name).slice(0, 60) + ' x' + Number(i.qty);
  });
  const text =
    '🛒 YANGI BUYURTMA\n\n' +
    '👤 ' + String(b.name || '-').slice(0, 60) + '\n' +
    '📞 ' + String(b.phone).slice(0, 25) + '\n' +
    '📍 ' + String(b.address || '-').slice(0, 150) + '\n' +
    '💳 ' + String(b.pay || '-').slice(0, 20) + '\n\n' +
    lines.join('\n') + '\n\n' +
    '💰 Jami: ' + Number(b.tota
