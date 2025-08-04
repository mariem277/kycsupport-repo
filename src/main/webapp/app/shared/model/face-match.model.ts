import dayjs from 'dayjs';
import { ICustomer } from 'app/shared/model/customer.model';

export interface IFaceMatch {
  id?: number;
  selfieUrl?: string;
  idPhotoUrl?: string;
  match?: boolean | null;
  score?: number | null;
  createdAt?: dayjs.Dayjs | null;
  customer?: ICustomer | null;
}

export const defaultValue: Readonly<IFaceMatch> = {
  match: true,
};
