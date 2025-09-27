// controllers/users.controller.js
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');

/**
 * Parse and sanitize list params
 */
function parseListParams(qs = {}) {
  const page = Math.max(parseInt(qs.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(qs.limit, 10) || 20, 1), 100);

  // Allow only known sort fields
  const allowedSort = new Set(['createdAt', 'username', 'firstName', 'lastName']);
  let sort = String(qs.sort || '-createdAt');
  let dir = 1;
  if (sort.startsWith('-')) { dir = -1; sort = sort.slice(1); }
  if (!allowedSort.has(sort)) { sort = 'createdAt'; dir = -1; }
  const sortSpec = { [sort]: dir };

  const search = (qs.search || '').trim();
  return { page, limit, sortSpec, search };
}

// GET /api/users?search=&page=1&limit=10&sort=-createdAt
exports.list = asyncHandler(async (req, res) => {
  const { page, limit, sortSpec, search } = parseListParams(req.query);

  const filter = {};
  if (search) {
    // Case-insensitive partial match on common name fields & username
    const rx = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    filter.$or = [
      { username: rx },
      { firstName: rx },
      { lastName: rx }
    ];
  }

  const [items, total] = await Promise.all([
    User.find(filter)
      .sort(sortSpec)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    User.countDocuments(filter)
  ]);

  const pages = Math.max(Math.ceil(total / limit), 1);
  res.json({
    items,
    pageInfo: {
      page,
      limit,
      total,
      pages,
      hasNext: page < pages
    }
  });
});

// GET /api/users/:id
exports.getOne = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).lean();
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json(user);
});

// POST /api/users/createUser  (admin/manual create)
exports.create = asyncHandler(async (req, res) => {
  const {
    tgId, username, firstName, lastName,
    language, photoUrl, isPremium, role, stats
  } = req.body || {};

  if (!tgId) return res.status(400).json({ message: 'tgId is required' });

  // Check by tgId (NOT _id)
  const existing = await User.findOne({ tgId }).lean();
  if (existing) {
    return res.status(409).json({
      message: 'User with this tgId already exists',
      userId: String(existing._id)
    });
  }

  try {
    const user = await User.create({
      tgId, username, firstName, lastName,
      language, photoUrl, isPremium, role, stats
    });
    // Optional Location header
    res.status(201).location(`/api/users/${user._id}`).json(user);
  } catch (err) {
    // Safety net for unique index race condition
    if (err && err.code === 11000) {
      const again = await User.findOne({ tgId }).lean();
      return res.status(409).json({
        message: 'User with this tgId already exists',
        userId: again ? String(again._id) : undefined
      });
    }
    throw err;
  }
});

// PATCH /api/users/:id
exports.update = asyncHandler(async (req, res) => {
  // Whitelist fields you allow to change from this endpoint
  const {
    username, firstName, lastName,
    language, photoUrl, isPremium, role, stats
  } = req.body || {};

  const updates = {
    ...(username !== undefined && { username }),
    ...(firstName !== undefined && { firstName }),
    ...(lastName !== undefined && { lastName }),
    ...(language !== undefined && { language }),
    ...(photoUrl !== undefined && { photoUrl }),
    ...(isPremium !== undefined && { isPremium }),
    ...(role !== undefined && { role }),
    ...(stats !== undefined && { stats })
  };

  const user = await User.findByIdAndUpdate(
    req.params.id,
    updates,
    { new: true, runValidators: true }
  );

  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json(user);
});

// DELETE /api/users/:id
exports.remove = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.status(204).send();
});
