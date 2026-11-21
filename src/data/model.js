import raw from './generated.json';
import next from '../../data/next-night.json';
import { buildModel, records } from '../lib/stats.js';

export const model = buildModel(raw.tournaments);
export const recs = records(model);
export const nextNight = next;
