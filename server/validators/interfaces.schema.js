// File: ./server/validators/interfaces.schema.js
const { z } = require('zod');

const idSchema = z.coerce.number().int().positive('id must be > 0');

const upsertInterfaceSchema = z.object({
  name: z.string().trim().min(1, 'name required').max(128),
  description: z.string().trim().max(65535).optional().nullable(),
  image: z.string().trim().max(255).optional().nullable(),
  features: z.array(z.coerce.number().int().positive()).default([])
});

module.exports = { idSchema, upsertInterfaceSchema };
