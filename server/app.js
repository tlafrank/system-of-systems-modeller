const express = require('express');
const path = require('path');
const app = express();

const multer = require('multer');

require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

console.log('[DB CHECK]', {
  DIALECT: process.env.DB_DIALECT,
  HOST: process.env.DB_HOST,
  PORT: process.env.DB_PORT,
  USER: process.env.DB_USER ? '(set)' : '(missing)',
  PASS: process.env.DB_PASS ? '(set)' : '(missing)',
  NAME: process.env.DB_NAME,
});

const bodyParser = require('body-parser');
const select = require('./old_helpers/select.js');
const graph = require('./old_helpers/graph.js');
const update = require('./old_helpers//update.js');
const backup = require('./old_helpers//backup.js');

const images = require('./old_helpers//images.js');
const fs = require('fs');

// Serve static assets (css, js, images, etc.)
app.use(express.static(path.join(__dirname, '..', 'public')));

app.get('/', (req, res) => {
    //res.statusCode = 200;
    //res.setHeader('Content-Type', 'text/html');
    fs.createReadStream('index.html').pipe(res);
    res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));

})

// API routes
app.use('/api', require('./routes/images.routes.js'));
app.use('/api', require('./routes/interfaces.routes.js'));


//Serve images
const IMAGES_DIR = path.join(__dirname, '..', 'www', 'images');
app.use('/images', express.static(IMAGES_DIR, {
  // Optional: cache 1 day
  maxAge: '1d',
  // Basic security headers (optional)
  setHeaders: (res) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
  }
}));

app.use('/assets', express.static('assets'));
app.use('/css', express.static('css'));
app.use('/js', express.static('js'));
app.use('/classes', express.static('classes'));
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.json());

//Add or update nodes and features
app.post('/update.json', update.switch);

//Basic select statements
app.post('/select.json', select.switch)
app.post('/graph.json', graph.switch)

//Generate all the insert statements required to replicate the database
app.get('/backup.txt', backup.run)

app.get('/images.json', images.getImages);


//Error handler
app.use((err, req, res, next) => {
  console.error(err);
  const status = err.statusCode || 400;
  res.status(status).json({ error: { code: err.code || 'BAD_REQUEST', message: err.message || 'Invalid request' } });
});

// configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, 'images')),
  filename: (req, file, cb) => {
    const safe = Date.now() + '-' + file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    cb(null, safe);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ok = /^(image\/png|image\/jpe?g|image\/gif|image\/svg\+xml|image\/webp)$/i.test(file.mimetype);
    cb(ok ? null : new Error('Only image files are allowed'), ok);
  }
});

// POST /upload-image (field: "image")
app.post('/upload-image', upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  res.json({ ok: true, file: '/images/' + req.file.filename });
});



module.exports = app;