import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import { initMongoConnection } from '../src/db/initMongoConnection.js';
import { Contact } from '../src/models/Contact.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const run = async () => {
  try {
    await initMongoConnection();

    // contacts.json proje kökünde olmalı
    const jsonPath = path.join(__dirname, '..', 'contacts.json');
    const raw = await fs.readFile(jsonPath, 'utf8');
    const items = JSON.parse(raw);

    if (!Array.isArray(items)) {
      throw new Error('contacts.json root, Array olmalı');
    }

    // İsteğe göre map: JSON alan adlarını modele uydur
    const docs = items.map((it) => ({
      name: it.name,
      phoneNumber: it.phoneNumber ?? it.phone ?? it.phone_number,
      email: it.email ?? undefined,
      isFavourite: Boolean(it.isFavourite ?? it.is_favourite ?? false),
      contactType: it.contactType ?? it.contact_type ?? 'personal',
    }));

    const result = await Contact.insertMany(docs, { ordered: false });
    console.log(`✅ Imported ${result.length} contacts`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Import failed:', err?.message || err);
    process.exit(1);
  }
};

run();

