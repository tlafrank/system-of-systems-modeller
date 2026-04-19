// File: ./server/controllers/interfaces.controller.js
const { idSchema, upsertInterfaceSchema } = require('../validators/interfaces.schema');
const service = require('../services/interfaces.service');

async function getEditView(req, res, next) {
  try {
    const id = req.params.id ? idSchema.parse(req.params.id) : undefined;
    const vm = await service.getEditView(id);
    if (id && !vm) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Interface not found' } });
    }
    res.json(vm);
  } catch (err) { next(err); }
}

async function create(req, res, next) {
  try {
    const body = upsertInterfaceSchema.parse(req.body);
    const result = await service.upsertInterface(body);
    res.status(201).json(result);
  } catch (err) { next(err); }
}

async function update(req, res, next) {
  try {
    const id = idSchema.parse(req.params.id);
    const body = upsertInterfaceSchema.parse(req.body);
    const result = await service.upsertInterface({ ...body, id_interface: id });
    res.json(result);
  } catch (err) { next(err); }
}

module.exports = { getEditView, create, update };
