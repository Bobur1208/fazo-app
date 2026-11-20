function send(res, code, obj) {
  res.statusCode = code;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(obj));
}

function readBody(req) {
  return new Promise(function (resolve) {
    if (req.body && typeof req.body === 'object') return resolve(req.body);
    if (typeof req.body === 'string') {
      try { return resolve(JSON.parse(req.body)); } catch (e) { return resolve({}); }
    }
    var data = '';
    req.on('data', function (c) { data += c; });
    req.on('end', function () {
      try { resolve(JSON.parse(data || '{}')); } catch (e) { resolve({}); }
    });
    req.on('error', function () { resolve({}); });
  });
}

module.exports = async function handler(req, res) {
  try {
    var token = process.env.TELEGRAM_BOT_TOKEN;
    var chat = process.env.TELEGRAM_CHAT_ID;

    if (req.method !== 'POST') {
      return send(res, 200, { ok: true, hasToken: !!token, hasChat: !!chat });
    }
    if (!token || !chat) {
      return send(res, 500, { ok: false, error: 'env yoq', hasToken: !!token, hasChat: !!chat });
    }

    var b = await readBody(req);
    var items = Array.isArray(b.items) ? b.items.slice(0, 50) : [];
    if (!b.phone || items.length === 0) {
      return send(res, 400, { ok: false, error: 'telefon yoki mahsulot yoq' });
    }

    var lines = items.map(function (i) {
      return '• ' + String(i.name).slice(0, 60) + ' x' + Number(i.qty);
    });
    var text =
      '🛒 YANGI BUYURTMA\n\n' +
      '👤 ' + String(b.name || '-').slice(0, 60) + '\n' +
      '📞 ' + String(b.phone).slice(0, 25) + '\n' +
      '📍 ' + String(b.address || '-').slice(0, 150) + '\n\n' +
      lines.join('\n') + '\n\n' +
      '💰 Jami: ' + Number(b.total || 0) + " so'm";

    var r = await fetch('https://api.telegram.org/bot' + token + '/sendMessage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chat, text: text })
    });
    var j = await r.json().catch(function () { return {}; });
    if (!r.ok) {
      return send(res, 502, { ok: false, telegram: j.description || r.status });
    }
    return send(res, 200, { ok: true });
  } catch (e) {
    return send(res, 500, { ok: false, error: String(e && e.message ? e.message : e) });
  }
};
