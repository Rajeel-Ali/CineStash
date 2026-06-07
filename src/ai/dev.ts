import { config } from 'dotenv';
config();

import '@/ai/flows/generate-initial-suggestions.ts';
import '@/ai/flows/enhance-synopsis.ts';
import '@/ai/flows/get-popular-movies.ts';
import '@/ai/flows/enhance-title.ts';
