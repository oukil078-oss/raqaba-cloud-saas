import 'dotenv/config';
import { seedAppwrite } from './appwrite';
seedAppwrite().catch((e) => { console.error(e); process.exit(1); });
