const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const ROOT = __dirname;
const DATA_DIR = path.join(ROOT, 'data');
const DATA = path.join(DATA_DIR, 'db.json');
const UPLOADS = path.join(ROOT, 'uploads');
const PUBLIC = path.join(ROOT, 'public');
const DEFAULT_PASSWORD = 'Silverleaf1404';
const BADGES = new Set(['', 'تازه', 'پرفروش', 'محدود']);
const ICONS = new Set(['leaf', 'necklace', 'earring', 'bracelet', 'hair', 'ring', 'anklet']);
const STATUSES = new Set(['new', 'making', 'shipped', 'done', 'cancelled']);
const PERSIAN_DIGITS = '۰۱۲۳۴۵۶۷۸۹٠١٢٣٤٥٦٧٨٩';

fs.mkdirSync(DATA_DIR, { recursive: true });
fs.mkdirSync(UPLOADS, { recursive: true });

function uid(prefix) {
  return `${prefix}_${crypto.randomBytes(4).toString('hex')}`;
}

function en(value) {
  return String(value ?? '').replace(/[۰-۹٠-٩]/g, (ch) => String(PERSIAN_DIGITS.indexOf(ch) % 10));
}

function clean(value, max) {
  return String(value ?? '').replace(/\s+/g, ' ').trim().slice(0, max);
}

function takeInt(value, min, max) {
  const raw = en(value).replace(/[^\d]/g, '');
  if (!raw) return null;
  const n = Number(raw);
  if (!Number.isFinite(n) || n < min || n > max) return null;
  return n;
}

function seed() {
  const now = Date.now();
  return {
    secret: crypto.randomBytes(24).toString('hex'),
    seq: 1040,
    admin: {
      username: 'admin',
      passwordHash: bcrypt.hashSync(DEFAULT_PASSWORD, 10),
    },
    categories: [
      { id: 'cat_necklace', name: 'گردنبند', description: 'آویزهایی که روی استخوان ترقوه می‌نشینند.', icon: 'necklace', position: 0 },
      { id: 'cat_earring', name: 'گوشواره', description: 'قطره‌ها، هلال‌ها و شبنم‌های کوچک.', icon: 'earring', position: 1 },
      { id: 'cat_bracelet', name: 'دستبند', description: 'پیچک، چوب و مفتول نرم.', icon: 'bracelet', position: 2 },
      { id: 'cat_hair', name: 'مو و تل', description: 'تاجک، سنجاق و گیره‌های برگی.', icon: 'hair', position: 3 },
      { id: 'cat_ring', name: 'انگشتر', description: 'جوانه‌های کوچک برای انگشت.', icon: 'ring', position: 4 },
      { id: 'cat_anklet', name: 'پابند', description: 'زنجیرهای سبک برای مچ پا.', icon: 'anklet', position: 5 },
    ],
    products: [
      {
        id: 'p_moonleaf',
        name: 'گردنبند برگ مهتاب',
        categoryId: 'cat_necklace',
        price: 1280000,
        comparePrice: 1490000,
        description: 'آویز برگی از برنج با روکش طلایی که رگه‌هایش با دست کشیده شده‌اند. زنجیر ظریف است و روی استخوان ترقوه می‌نشیند.\n\nزیر نور عصر، برگ کمی گرم‌تر دیده می‌شود؛ انگار مهتاب از لای شاخه‌ها رد شده باشد.',
        stock: 6,
        featured: true,
        badge: 'پرفروش',
        image: '/images/p_moonleaf.svg',
        createdAt: now - 10 * 86400000,
      },
      {
        id: 'p_dew',
        name: 'گوشواره شبنم صبح',
        categoryId: 'cat_earring',
        price: 690000,
        comparePrice: null,
        description: 'دو قطره مروارید رودخانه‌ای که زیر نور مثل شبنم اول صبح می‌درخشند. قلاب سبک است و برای استفادهٔ روزانه ساخته شده.',
        stock: 10,
        featured: true,
        badge: 'تازه',
        image: '/images/p_dew.svg',
        createdAt: now - 8 * 86400000,
      },
      {
        id: 'p_vine',
        name: 'دستبند پیچک',
        categoryId: 'cat_bracelet',
        price: 540000,
        comparePrice: null,
        description: 'بند ابریشمی به رنگ خزه با پیچکی از مفتول طلایی. روی مچ تنظیم می‌شود و با لباس کتان آرام می‌گیرد.',
        stock: 8,
        featured: false,
        badge: '',
        image: '/images/p_vine.svg',
        createdAt: now - 7 * 86400000,
      },
      {
        id: 'p_crown',
        name: 'تاجک برگ‌نقره',
        categoryId: 'cat_hair',
        price: 870000,
        comparePrice: 990000,
        description: 'نیم‌تاجی از برگ‌های کوچک فلزی برای موهای جمع یا بافته. سبک است و برای عصرهای طولانی و عکس‌های زیر درخت دوخته و شکل داده شده.',
        stock: 4,
        featured: true,
        badge: 'محدود',
        image: '/images/p_crown.svg',
        createdAt: now - 6 * 86400000,
      },
      {
        id: 'p_bud',
        name: 'انگشتر جوانه',
        categoryId: 'cat_ring',
        price: 460000,
        comparePrice: null,
        description: 'انگشتری با فرم جوانه و یک درخشش کوچک روی نوک برگ. این نمونه اندازهٔ میانه است؛ در یادداشت سفارش می‌توانی اندازه را بنویسی.',
        stock: 7,
        featured: false,
        badge: '',
        image: '/images/p_bud.svg',
        createdAt: now - 5 * 86400000,
      },
      {
        id: 'p_dragon',
        name: 'سنجاق سنجاقک',
        categoryId: 'cat_hair',
        price: 380000,
        comparePrice: null,
        description: 'سنجاق مو و سینه با بال‌های توری‌مانند و تنه‌ای سبز طلایی. روی شال کتان یا یقهٔ پیراهن هم می‌نشیند.',
        stock: 0,
        featured: false,
        badge: '',
        image: '/images/p_dragon.svg',
        createdAt: now - 4 * 86400000,
      },
      {
        id: 'p_river',
        name: 'گردنبند مروارید رودخانه',
        categoryId: 'cat_necklace',
        price: 980000,
        comparePrice: null,
        description: 'رشته‌ای کوتاه از مرواریدهای کمی نامنظم، با قفل برنجی. ساده‌ترین قطعهٔ کارگاه است و یکی از آرام‌ترین‌ها.',
        stock: 5,
        featured: true,
        badge: 'پرفروش',
        image: '/images/p_river.svg',
        createdAt: now - 3 * 86400000,
      },
      {
        id: 'p_moss',
        name: 'پابند خزه',
        categoryId: 'cat_anklet',
        price: 320000,
        comparePrice: null,
        description: 'زنجیر ظریف با سه برگ کوچک برای مچ پا. طولش با یک حلقهٔ اضافه کمی تغییر می‌کند.',
        stock: 11,
        featured: false,
        badge: '',
        image: '/images/p_moss.svg',
        createdAt: now - 2 * 86400000,
      },
      {
        id: 'p_crescent',
        name: 'گوشواره هلال بیشه',
        categoryId: 'cat_earring',
        price: 610000,
        comparePrice: null,
        description: 'هلال‌های کوچک طلایی با یک برگ آویز. حرکت‌شان هنگام راه رفتن ملایم است و به صورت نمی‌چسبند.',
        stock: 2,
        featured: false,
        badge: 'محدود',
        image: '/images/p_crescent.svg',
        createdAt: now - 86400000,
      },
      {
        id: 'p_acorn',
        name: 'دستبند دانه‌بلوط',
        categoryId: 'cat_bracelet',
        price: 490000,
        comparePrice: null,
        description: 'مهره‌های چوب گردو و یک بلوط برنجی. گرم است و با پشم و کتان جور درمی‌آید.',
        stock: 6,
        featured: false,
        badge: '',
        image: '/images/p_acorn.svg',
        createdAt: now,
      },
    ],
    orders: [],
  };
}

let db = fs.existsSync(DATA) ? JSON.parse(fs.readFileSync(DATA, 'utf8')) : seed();
if (!db.secret) db.secret = crypto.randomBytes(24).toString('hex');
if (!Array.isArray(db.orders)) db.orders = [];
if (!Array.isArray(db.products)) db.products = [];
if (!Array.isArray(db.categories)) db.categories = [];

function save() {
  const tmp = DATA + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(db, null, 2), 'utf8');
  fs.renameSync(tmp, DATA);
}
save();

function publicProduct(p) {
  return {
    id: p.id,
    name: p.name,
    categoryId: p.categoryId,
    price: p.price,
    comparePrice: p.comparePrice,
    description: p.description,
    stock: p.stock,
    featured: !!p.featured,
    badge: p.badge || '',
    image: p.image || '',
    createdAt: p.createdAt || 0,
  };
}

function publicOrder(o) {
  return {
    id: o.id,
    code: o.code,
    status: o.status,
    items: o.items,
    total: o.total,
    customer: o.customer,
    createdAt: o.createdAt,
  };
}

const loginTries = new Map();

function clientIp(req) {
  return req.ip || req.socket.remoteAddress || 'local';
}

function tooMany(ip) {
  const row = loginTries.get(ip);
  if (!row) return false;
  if (Date.now() > row.reset) {
    loginTries.delete(ip);
    return false;
  }
  return row.count >= 8;
}

function markFail(ip) {
  const row = loginTries.get(ip) || { count: 0, reset: Date.now() + 5 * 60 * 1000 };
  row.count += 1;
  loginTries.set(ip, row);
}

const app = express();
app.disable('x-powered-by');
app.set('trust proxy', false);
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'same-origin');
  next();
});
app.use(express.json({ limit: '1mb' }));
app.use('/uploads', (req, res, next) => {
  res.setHeader('Content-Security-Policy', "default-src 'none'");
  res.setHeader('X-Content-Type-Options', 'nosniff');
  next();
}, express.static(UPLOADS));
app.use(express.static(PUBLIC));
app.use(session({
  secret: db.secret,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 2 * 24 * 60 * 60 * 1000,
  },
}));

function requireAdmin(req, res, next) {
  if (req.session && req.session.admin) return next();
  res.status(401).json({ error: 'ابتدا وارد شو' });
}

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, UPLOADS),
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname || '').toLowerCase();
      const allowed = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
      cb(null, `${crypto.randomBytes(8).toString('hex')}${allowed.includes(ext) ? ext : ''}`);
    },
  }),
  limits: { fileSize: 3 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (/^image\/(jpeg|png|webp|gif)$/.test(file.mimetype)) cb(null, true);
    else cb(new Error('فرمت تصویر پشتیبانی نمی‌شود'));
  },
});

app.get('/api/admin/setup', (req, res) => {
  res.json({ needsSetup: bcrypt.compareSync(DEFAULT_PASSWORD, db.admin.passwordHash) });
});

app.get('/api/admin/me', (req, res) => {
  if (!req.session || !req.session.admin) return res.status(401).json({ error: 'وارد نشده‌ای' });
  res.json({ username: db.admin.username });
});

app.post('/api/admin/login', (req, res) => {
  const ip = clientIp(req);
  if (tooMany(ip)) {
    return res.status(429).json({ error: 'چند بار رمز نادرست بود. چند دقیقه بعد دوباره تلاش کن.' });
  }
  const username = clean(req.body && req.body.username, 40);
  const password = String((req.body && req.body.password) || '');
  const userOk = username === db.admin.username;
  const passOk = bcrypt.compareSync(password || ' ', db.admin.passwordHash);
  if (!userOk || !passOk) {
    markFail(ip);
    return res.status(401).json({ error: 'نام کاربری یا رمز نادرست است' });
  }
  loginTries.delete(ip);
  req.session.regenerate((err) => {
    if (err) return res.status(500).json({ error: 'مشکلی پیش آمد' });
    req.session.admin = true;
    res.json({ ok: true, username: db.admin.username });
  });
});

app.post('/api/admin/logout', requireAdmin, (req, res) => {
  req.session.destroy(() => res.json({ ok: true }));
});

app.post('/api/admin/password', requireAdmin, (req, res) => {
  const current = String((req.body && req.body.current) || '');
  const next = String((req.body && req.body.next) || '');
  const username = clean(req.body && req.body.username, 40);
  if (!bcrypt.compareSync(current, db.admin.passwordHash)) {
    return res.status(400).json({ error: 'رمز فعلی نادرست است' });
  }
  if (next.length < 8) return res.status(400).json({ error: 'رمز تازه دست‌کم ۸ حرف باشد' });
  if (!/^[a-zA-Z0-9._-]{3,40}$/.test(username)) {
    return res.status(400).json({ error: 'نام کاربری ۳ تا ۴۰ حرف انگلیسی، عدد یا خط تیره باشد' });
  }
  db.admin.username = username;
  db.admin.passwordHash = bcrypt.hashSync(next, 10);
  save();
  res.json({ ok: true, username });
});

app.get('/api/categories', (req, res) => {
  const cats = [...db.categories].sort((a, b) => a.position - b.position);
  res.json(cats.map((c) => ({
    id: c.id,
    name: c.name,
    description: c.description,
    icon: c.icon,
    position: c.position,
  })));
});

app.get('/api/products', (req, res) => {
  let list = db.products.map(publicProduct);
  const category = String(req.query.category || '');
  const q = String(req.query.q || '').trim().toLowerCase();
  const sort = String(req.query.sort || 'new');
  if (category) list = list.filter((p) => p.categoryId === category);
  if (req.query.featured === '1') list = list.filter((p) => p.featured);
  if (q) list = list.filter((p) => `${p.name} ${p.description}`.toLowerCase().includes(q));
  if (sort === 'price-asc') list.sort((a, b) => a.price - b.price);
  else if (sort === 'price-desc') list.sort((a, b) => b.price - a.price);
  else list.sort((a, b) => b.createdAt - a.createdAt);
  res.json(list);
});

app.get('/api/products/:id', (req, res) => {
  const p = db.products.find((item) => item.id === req.params.id);
  if (!p) return res.status(404).json({ error: 'دست‌سازه پیدا نشد' });
  res.json(publicProduct(p));
});

function keepImage(value) {
  const image = String(value || '');
  if (!image) return '';
  if (image.startsWith('/images/') && !image.includes('..')) return image;
  if (image.startsWith('/uploads/') && !image.includes('..')) return image;
  return '';
}

function readProductBody(body, file, previous) {
  const name = clean(body.name, 80);
  const categoryId = clean(body.categoryId, 40);
  const description = String(body.description || '').trim().slice(0, 2000);
  const price = takeInt(body.price, 1000, 500000000);
  const stock = takeInt(body.stock, 0, 100000);
  let comparePrice = null;
  if (String(body.comparePrice ?? '').trim() !== '') {
    comparePrice = takeInt(body.comparePrice, 1000, 500000000);
    if (comparePrice == null) return { error: 'قیمت قبل از تخفیف درست نیست' };
  }
  if (!name || name.length < 2) return { error: 'نام دست‌سازه را بنویس' };
  if (!db.categories.some((c) => c.id === categoryId)) return { error: 'دسته را انتخاب کن' };
  if (price == null) return { error: 'قیمت را به تومان وارد کن' };
  if (stock == null) return { error: 'موجودی را وارد کن' };
  if (comparePrice != null && comparePrice <= price) comparePrice = null;
  const badge = BADGES.has(body.badge) ? body.badge : '';
  const featured = body.featured === 'true' || body.featured === 'on' || body.featured === '1';
  let image = previous ? previous.image || '' : '';
  if (file) image = `/uploads/${file.filename}`;
  else if (body.image !== undefined) image = keepImage(body.image) || image;
  return {
    value: { name, categoryId, description, price, comparePrice, stock, badge, featured, image },
  };
}

app.post('/api/admin/products', requireAdmin, upload.single('image'), (req, res) => {
  const parsed = readProductBody(req.body || {}, req.file, null);
  if (parsed.error) return res.status(400).json({ error: parsed.error });
  const product = {
    id: uid('p'),
    ...parsed.value,
    createdAt: Date.now(),
  };
  db.products.push(product);
  save();
  res.status(201).json(publicProduct(product));
});

app.put('/api/admin/products/:id', requireAdmin, upload.single('image'), (req, res) => {
  const product = db.products.find((item) => item.id === req.params.id);
  if (!product) return res.status(404).json({ error: 'دست‌سازه پیدا نشد' });
  const parsed = readProductBody(req.body || {}, req.file, product);
  if (parsed.error) return res.status(400).json({ error: parsed.error });
  Object.assign(product, parsed.value);
  save();
  res.json(publicProduct(product));
});

app.delete('/api/admin/products/:id', requireAdmin, (req, res) => {
  const before = db.products.length;
  db.products = db.products.filter((item) => item.id !== req.params.id);
  if (db.products.length === before) return res.status(404).json({ error: 'دست‌سازه پیدا نشد' });
  save();
  res.json({ ok: true });
});

app.post('/api/admin/categories', requireAdmin, (req, res) => {
  const name = clean(req.body && req.body.name, 40);
  const description = clean(req.body && req.body.description, 300);
  const icon = ICONS.has(req.body && req.body.icon) ? req.body.icon : 'leaf';
  if (name.length < 2) return res.status(400).json({ error: 'نام دسته را بنویس' });
  const position = db.categories.reduce((max, c) => Math.max(max, c.position), -1) + 1;
  const category = { id: uid('cat'), name, description, icon, position };
  db.categories.push(category);
  save();
  res.status(201).json(category);
});

app.put('/api/admin/categories/:id', requireAdmin, (req, res) => {
  const category = db.categories.find((item) => item.id === req.params.id);
  if (!category) return res.status(404).json({ error: 'دسته پیدا نشد' });
  const name = clean(req.body && req.body.name, 40);
  const description = clean(req.body && req.body.description, 300);
  const icon = ICONS.has(req.body && req.body.icon) ? req.body.icon : category.icon;
  if (name.length < 2) return res.status(400).json({ error: 'نام دسته را بنویس' });
  category.name = name;
  category.description = description;
  category.icon = icon;
  save();
  res.json(category);
});

app.post('/api/admin/categories/:id/move', requireAdmin, (req, res) => {
  const dir = req.body && req.body.dir === 'up' ? -1 : 1;
  const cats = [...db.categories].sort((a, b) => a.position - b.position);
  const index = cats.findIndex((c) => c.id === req.params.id);
  const next = index + dir;
  if (index < 0) return res.status(404).json({ error: 'دسته پیدا نشد' });
  if (next >= 0 && next < cats.length) {
    const [item] = cats.splice(index, 1);
    cats.splice(next, 0, item);
    cats.forEach((c, i) => { c.position = i; });
    save();
  }
  res.json({ ok: true });
});

app.delete('/api/admin/categories/:id', requireAdmin, (req, res) => {
  if (db.products.some((p) => p.categoryId === req.params.id)) {
    return res.status(400).json({ error: 'اول دست‌سازه‌های این دسته را جا‌به‌جا یا حذف کن' });
  }
  const before = db.categories.length;
  db.categories = db.categories.filter((c) => c.id !== req.params.id);
  if (db.categories.length === before) return res.status(404).json({ error: 'دسته پیدا نشد' });
  db.categories
    .sort((a, b) => a.position - b.position)
    .forEach((c, i) => { c.position = i; });
  save();
  res.json({ ok: true });
});

app.get('/api/admin/orders', requireAdmin, (req, res) => {
  const orders = [...db.orders].sort((a, b) => b.createdAt - a.createdAt).map(publicOrder);
  res.json(orders);
});

function adjustStock(order, sign) {
  for (const item of order.items) {
    const product = db.products.find((p) => p.id === item.productId);
    if (!product) continue;
    if (sign < 0 && product.stock < item.qty) return false;
  }
  for (const item of order.items) {
    const product = db.products.find((p) => p.id === item.productId);
    if (product) product.stock += sign * item.qty;
  }
  return true;
}

app.patch('/api/admin/orders/:id', requireAdmin, (req, res) => {
  const order = db.orders.find((item) => item.id === req.params.id);
  if (!order) return res.status(404).json({ error: 'سفارش پیدا نشد' });
  const status = String((req.body && req.body.status) || '');
  if (!STATUSES.has(status)) return res.status(400).json({ error: 'وضعیت نامعتبر است' });
  if (order.status !== 'cancelled' && status === 'cancelled') adjustStock(order, 1);
  if (order.status === 'cancelled' && status !== 'cancelled') {
    if (!adjustStock(order, -1)) return res.status(400).json({ error: 'موجودی برای برگشت این سفارش کافی نیست' });
  }
  order.status = status;
  save();
  res.json(publicOrder(order));
});

app.post('/api/orders', (req, res) => {
  const body = req.body || {};
  const name = clean(body.name, 80);
  const city = clean(body.city, 40);
  const address = clean(body.address, 300);
  const note = clean(body.note, 500);
  const phone = en(body.phone).replace(/[^\d+]/g, '');
  const digits = phone.replace(/\D/g, '');
  if (name.length < 2) return res.status(400).json({ error: 'نام را بنویس' });
  if (digits.length < 10 || digits.length > 15) return res.status(400).json({ error: 'شمارهٔ تماس درست نیست' });
  if (city.length < 2) return res.status(400).json({ error: 'شهر را بنویس' });
  if (address.length < 8) return res.status(400).json({ error: 'نشانی را کامل‌تر بنویس' });
  if (!Array.isArray(body.items) || !body.items.length || body.items.length > 20) {
    return res.status(400).json({ error: 'سبد خالی است' });
  }
  const items = [];
  for (const raw of body.items) {
    const qty = takeInt(raw && raw.qty, 1, 10);
    const product = db.products.find((p) => p.id === (raw && raw.id));
    if (!product || qty == null) return res.status(400).json({ error: 'یکی از دست‌سازه‌ها دیگر در کارگاه نیست' });
    if (product.stock < qty) {
      return res.status(400).json({ error: `موجودی «${product.name}» کافی نیست` });
    }
    items.push({ productId: product.id, name: product.name, price: product.price, qty });
  }
  for (const item of items) {
    const product = db.products.find((p) => p.id === item.productId);
    product.stock -= item.qty;
  }
  db.seq = (db.seq || 1040) + 1;
  const order = {
    id: uid('ord'),
    code: `SL-${db.seq}`,
    status: 'new',
    items,
    total: items.reduce((sum, item) => sum + item.price * item.qty, 0),
    customer: { name, phone, city, address, note },
    createdAt: Date.now(),
  };
  db.orders.push(order);
  save();
  res.status(201).json({ order: publicOrder(order) });
});

app.get(['/admin', '/admin/'], (req, res) => {
  res.redirect('/admin/dashboard.html');
});

app.get('/favicon.ico', (req, res) => {
  res.redirect('/images/mark.svg');
});

app.use('/api', (req, res) => {
  res.status(404).json({ error: 'یافت نشد' });
});

app.use((req, res) => {
  res.status(404).sendFile(path.join(PUBLIC, '404.html'));
});

app.use((err, req, res, next) => {
  if (err && err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ error: 'حجم تصویر بیشتر از ۳ مگابایت است' });
  }
  if (err && err.message === 'فرمت تصویر پشتیبانی نمی‌شود') {
    return res.status(400).json({ error: err.message });
  }
  console.error(err);
  res.status(500).json({ error: 'مشکلی پیش آمد' });
});

const port = Number(process.env.PORT) || 3000;
const server = app.listen(port, () => {
  console.log(`Silverleaf shop running at http://localhost:${port}`);
});
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${port} is already in use.`);
    process.exit(1);
  }
  throw err;
});
