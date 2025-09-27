const router = require('express').Router();
const User = require('../models/User');

// ⚠️ UNSAFE: no Telegram signature verification
function parseInitData(raw) {
  const params = new URLSearchParams(raw || '');
  const out = {};
  for (const [k, v] of params.entries()) out[k] = v;
  if (out.user) {
    try { out.user = JSON.parse(out.user); } catch { out.user = {}; }
  }
  return out;
}

// POST /api/auth/telegram/init  (UNVERIFIED)
router.post('/telegram/init', async (req, res, next) => {
  try {
    const raw = req.body?.initData;
    if (!raw) return res.status(400).json({ message: 'initData is required' });

    const parsed = parseInitData(raw);
    const u = parsed.user || {};
    if (!u.id) return res.status(400).json({ message: 'user.id missing in initData' });

    const tgId = String(u.id);

    const update = {
      $setOnInsert: { tgId, role: 'USER' },
      $set: {
        username: u.username ?? null,
        firstName: u.first_name ?? null,
        lastName: u.last_name ?? null,
        language: u.language_code ?? null,
        isPremium: !!u.is_premium,
      }
    };

    const user = await User.findOneAndUpdate(
      { tgId },
      update,
      { new: true, upsert: true }
    ).lean();

    return res.json({ ok: true, user });
  } catch (e) { next(e); }
});

module.exports = router;
