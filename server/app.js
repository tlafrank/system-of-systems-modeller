const express = require('express');
const path = require('path');
const multer = require('multer');
const bodyParser = require('body-parser');
const fs = require('fs');

require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const select = require('./old_helpers/select.js');
const graph = require('./old_helpers/graph.js');
const update = require('./old_helpers//update.js');
const backup = require('./old_helpers//backup.js');
const images = require('./old_helpers//images.js');

function createImageUpload() {
  const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, path.join(__dirname, '..', 'public', 'images')),
    filename: (req, file, cb) => {
      const safe = Date.now() + '-' + file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
      cb(null, safe);
    }
  });

  return multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
      const ok = /^(image\/png|image\/jpe?g|image\/gif|image\/svg\+xml|image\/webp)$/i.test(file.mimetype);
      cb(ok ? null : new Error('Only image files are allowed'), ok);
    }
  });
}

function createApp() {
  const app = express();

  console.log('[DB CHECK]', {
    DIALECT: process.env.DB_DIALECT,
    HOST: process.env.DB_HOST,
    PORT: process.env.DB_PORT,
    USER: process.env.DB_USER ? '(set)' : '(missing)',
    PASS: process.env.DB_PASS ? '(set)' : '(missing)',
    NAME: process.env.DB_NAME,
  });

  const PUBLIC_DIR = path.join(__dirname, '..', 'public');
  const IMAGES_DIR = path.join(PUBLIC_DIR, 'images');

  app.use(express.static(PUBLIC_DIR));
  app.use('/images', express.static(IMAGES_DIR, {
    maxAge: '1d',
    setHeaders: (res) => {
      res.setHeader('X-Content-Type-Options', 'nosniff');
    }
  }));

  app.use('/assets', express.static(path.join(PUBLIC_DIR, 'assets')));
  app.use('/css', express.static(path.join(PUBLIC_DIR, 'css')));
  app.use('/js', express.static(path.join(PUBLIC_DIR, 'js')));
  app.use('/classes', express.static(path.join(PUBLIC_DIR, 'classes')));

  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(express.json());

  app.get('/', (req, res) => {
    const indexPath = path.join(PUBLIC_DIR, 'index.html');
    if (!fs.existsSync(indexPath)) {
      return res.status(500).send('Missing public/index.html');
    }
    return res.sendFile(indexPath);
  });

  // New API routes
  app.use('/api', require('./routes/images.routes.js'));
  app.use('/api', require('./routes/interfaces.routes.js'));

  // Legacy endpoints retained for backwards compatibility
  app.post('/update.json', update.switch);
  app.post('/select.json', select.switch);
  app.post('/graph.json', graph.switch);
  app.get('/backup.txt', backup.run);
  app.get('/images.json', images.getImages);

  const upload = createImageUpload();
  app.post('/upload-image', upload.single('image'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    return res.json({ ok: true, file: '/images/' + req.file.filename });
  });

  app.use((err, req, res, next) => {
    console.error(err);
    const status = err.statusCode || 400;
    res.status(status).json({
      error: {
        code: err.code || 'BAD_REQUEST',
        message: err.message || 'Invalid request'
      }
    });
  });

  return app;
}

module.exports = createApp();
module.exports.createApp = createApp;
