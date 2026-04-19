// File: ./server/routes/interfaces.routes.js
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/interfaces.controller');

// One-call VM for the editor
router.get('/interfaces/edit-view', ctrl.getEditView);      // new
router.get('/interfaces/:id/edit-view', ctrl.getEditView);  // existing

// Create & update
router.post('/interfaces', ctrl.create);
router.patch('/interfaces/:id', ctrl.update);

module.exports = router;
