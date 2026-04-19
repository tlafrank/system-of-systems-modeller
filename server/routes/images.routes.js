// server/routes/images.routes.js
const express = require('express');
const router = express.Router();
const { listImages } = require('../services/images.service');

router.get('/images', async (req, res, next) => {
  try {
    const prefix = String(req.query.prefix || '').trim();
    // clamp pagination
    const page  = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(200, Math.max(1, parseInt(req.query.limit, 10) || 60));

    const result = await listImages({ prefix, page, limit });
    res.json(result);
  } catch (e) {
    next(e);
  }
});

module.exports = router;
