import dayjs from 'dayjs';
import { RegulationStatus } from 'app/shared/model/enumerations/regulation-status.model';

export interface IRegulation {
  id?: number;
  title?: string;
  content?: string | null;
  sourceUrl?: string | null;
  status?: keyof typeof RegulationStatus;
  createdAt?: dayjs.Dayjs | null;
}

export const defaultValue: Readonly<IRegulation> = {};
