import Joi from 'joi';

const name = Joi.string().min(3).max(20);
const phoneNumber = Joi.string().min(3).max(20);
const email = Joi.string().email().min(3).max(50);
const isFavourite = Joi.boolean();
const contactType = Joi.string().valid('work', 'home', 'personal');

export const createContactSchema = Joi.object({
  name: name.required(),
  phoneNumber: phoneNumber.required(),
  email,
  isFavourite,
  contactType: contactType.required(),
});

export const updateContactSchema = Joi.object({
  name,
  phoneNumber,
  email,
  isFavourite,
  contactType,
}).min(1); // En az bir alan güncellenmeli
