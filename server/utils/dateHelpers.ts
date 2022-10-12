import { addYears } from 'date-fns';
import { Between } from 'typeorm';

export const AfterDate = (date: Date) => Between(date, addYears(date, 100));
