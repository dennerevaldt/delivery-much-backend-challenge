import joi from 'joi';

export const processProductNotificationSchema = joi.object({
  content: joi.string().required(),
});
