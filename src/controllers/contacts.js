import createHttpError from 'http-errors';
import * as contactsService from '../services/contacts.js';

export const getContacts = async (req, res) => {
  const { page, perPage, sortBy, sortOrder, type, isFavourite } = req.query;
  const result = await contactsService.getAllContacts({
    userId: req.user._id, // <-- kritik
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

export const getContactById = async (req, res) => {
  const { contactId } = req.params;
  const contact = await contactsService.getContactById({ id: contactId, userId: req.user._id });
  if (!contact) throw createHttpError(404, 'Contact not found');
  res.status(200).json({
    status: 200,
    message: `Successfully found contact with id ${contactId}!`,
    data: contact,
  });
};

export const createContact = async (req, res) => {
  const created = await contactsService.createContact({ data: req.body, userId: req.user._id });
  res.status(201).json({
    status: 201,
    message: 'Successfully created a contact!',
    data: created,
  });
};

export const updateContact = async (req, res) => {
  const { contactId } = req.params;
  const updated = await contactsService.updateContact({
    id: contactId,
    data: req.body,
    userId: req.user._id,
  });
  if (!updated) throw createHttpError(404, 'Contact not found');
  res.status(200).json({
    status: 200,
    message: 'Successfully patched a contact!',
    data: updated,
  });
};

export const deleteContact = async (req, res) => {
  const { contactId } = req.params;
  const deleted = await contactsService.deleteContact({ id: contactId, userId: req.user._id });
  if (!deleted) throw createHttpError(404, 'Contact not found');
  res.status(204).send();
};



