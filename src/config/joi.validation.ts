import * as Joi from 'joi';

export const JoiValidationSchema = Joi.object({
  // MONGODB_URI: Joi.required(),

  PORT: Joi.number().default(3000),
  NODE_ENV: Joi.string().default('dev'),
  HOST_API: Joi.string().required(), //=http://localhost:3000/api/v1
  DEFAULT_LIMIT_PAGE: Joi.number().default(10),

  DB_PASSWORD: Joi.required(),
  DB_NAME: Joi.string().default('warehouse'),
  DB_USERNAME: Joi.string().default('postgres'),
  // DB_HOST:Joi.string().default('localhost'),

  JWT_SECRET: Joi.required(),
});
