import joi from 'joi';

export const findProductByNameSchema = joi.object({
  params: joi.object({
    name: joi.string().required(),
  }).required(),
}).required();
