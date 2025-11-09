import { Router } from 'express';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';
import * as contactsController from '../controllers/contacts.js';
import { validateBody } from '../middlewares/validateBody.js';
import { isValidId } from '../middlewares/isValidId.js';
import { authenticate } from '../middlewares/authenticate.js';
import { createContactSchema, updateContactSchema } from '../schemas/contactSchemas.js';

const router = Router();

// Tüm contact rotalarına auth zorunlu:
router.use(authenticate);

router.get('/', ctrlWrapper(contactsController.getContacts));
router.get('/:contactId', isValidId, ctrlWrapper(contactsController.getContactById));
router.post('/', validateBody(createContactSchema), ctrlWrapper(contactsController.createContact));
router.patch('/:contactId', isValidId, validateBody(updateContactSchema), ctrlWrapper(contactsController.updateContact));
router.delete('/:contactId', isValidId, ctrlWrapper(contactsController.deleteContact));

export default router;



