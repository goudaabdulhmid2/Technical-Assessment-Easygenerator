import Joi from 'joi';

export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),

  PORT: Joi.number()
    .integer()
    .min(1)
    .default(3000),

  MONGO_URI: Joi.string()
    .pattern(/^mongodb(?:\+srv)?:\/\/\S+$/)
    .messages({
      'string.pattern.base':
        'MONGO_URI must start with mongodb:// or mongodb+srv://',
    })
    .required(),

  JWT_ACCESS_SECRET: Joi.string()
    .min(32)
    .required(),

  JWT_ACCESS_EXPIRES_IN: Joi.string()
    .required(),
  FRONTEND_URL: Joi.string()
  .uri()
  .required(),
});
