const path = require('path');
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

const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;

const select = require('./helpers/select');
const graph = require('./helpers/graph');
const update = require('./helpers/update');
const backup = require('./helpers/backup');
const logger = require('./helpers/logger.js');
const images = require('./helpers/images');
const fs = require('fs');


app.get('/', (req, res) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/html');
    fs.createReadStream('index.html').pipe(res);
})

app.use('/images', express.static('images'));
app.use('/assets', express.static('assets'));
app.use('/css', express.static('css'));
app.use('/js', express.static('js'));
app.use('/classes', express.static('classes'));
app.use(bodyParser.urlencoded({ extended: true }));

//Add or update nodes and features
app.post('/update.json', update.switch);

//Basic select statements
app.post('/select.json', select.switch)
app.post('/graph.json', graph.switch)

//Generate all the insert statements required to replicate the database
app.get('/backup.txt', backup.run)

app.get('/images.json', images.getImages);

app.listen(port, ()=> {
    logger.info( { port }, 'SOSM listening');
    //console.log(`Server started on port ${port}`);
})

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

