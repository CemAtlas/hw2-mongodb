import createHttpError from 'http-errors';
import * as contactsService from '../services/contacts.js';

export const getContacts = async (req, res) => {
  const { page, perPage, sortBy, sortOrder, type, isFavourite } = req.query;

  const result = await contactsService.getAllContacts({
    page,
    perPage,
    sortBy,
    sortOrder,
    type,
    isFavourite,
  });

  res.status(200).json({
    status: 200,
    message: 'Successfully found contacts!',
    data: result,
  });
};

// diğer CRUD fonksiyonları aynı kalır (HW3'teki createContact, updateContact, deleteContact)


