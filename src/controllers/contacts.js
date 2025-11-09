import * as contactsService from '../services/contacts.js';

export const getContactsController = async (req, res, next) => {
  try {
    const data = await contactsService.getAllContacts();
    res.status(200).json({
      status: 200,
      message: 'Successfully found contacts!',
      data,
    });
  } catch (err) {
    next(err);
  }
};

export const getContactByIdController = async (req, res, next) => {
  try {
    const { contactId } = req.params;
    const data = await contactsService.getContactById(contactId);

    if (!data) {
      return res.status(404).json({ message: 'Contact not found' });
    }

    res.status(200).json({
      status: 200,
      message: `Successfully found contact with id ${contactId}!`,
      data,
    });
  } catch (err) {
    next(err);
  }
};
