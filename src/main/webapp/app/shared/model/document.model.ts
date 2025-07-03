import dayjs from 'dayjs';
import { ICustomer } from 'app/shared/model/customer.model';

export interface IDocument {
  id?: number;
  fileUrl?: string;
  qualityScore?: number | null;
  issues?: string | null;
  createdAt?: dayjs.Dayjs | null;
  customer?: ICustomer | null;
}

export const defaultValue: Readonly<IDocument> = {};
