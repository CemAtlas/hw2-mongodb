import { Contact } from '../models/Contact.js';

export const getAllContacts = async ({
  page = 1,
  perPage = 10,
  sortBy = 'name',
  sortOrder = 'asc',
  type,
  isFavourite,
}) => {
  const skip = (page - 1) * perPage;
  const filter = {};

  if (type) filter.contactType = type;
  if (isFavourite !== undefined) filter.isFavourite = isFavourite === 'true';

  const totalItems = await Contact.countDocuments(filter);
  const totalPages = Math.ceil(totalItems / perPage);

  const data = await Contact.find(filter)
    .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
    .skip(skip)
    .limit(perPage);

  return {
    data,
    page: Number(page),
    perPage: Number(perPage),
    totalItems,
    totalPages,
    hasPreviousPage: page > 1,
    hasNextPage: page < totalPages,
  };
};

export const getContactById = async (id) => Contact.findById(id);
export const createContact = async (data) => Contact.create(data);
export const updateContact = async (id, data) =>
  Contact.findByIdAndUpdate(id, data, { new: true });
export const deleteContact = async (id) => Contact.findByIdAndDelete(id);



