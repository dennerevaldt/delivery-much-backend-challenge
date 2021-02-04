import joi from 'joi';

export const createOrdersSchema = joi.object({
  body: joi.object({
    products: joi.array().items(joi.object({
      name: joi.string().required(),
      quantity: joi.number().integer().min(1).required(),
    })).min(1).required(),
  }).required(),
}).required();

export const listOrdersSchema = joi.object({
  params: joi.object({
    id: joi.string(),
  }).required(),
}).required();
