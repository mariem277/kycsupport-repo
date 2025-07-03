import dayjs from 'dayjs';
import { IPartner } from 'app/shared/model/partner.model';
import { KycStatus } from 'app/shared/model/enumerations/kyc-status.model';

export interface ICustomer {
  id?: number;
  fullName?: string;
  dob?: dayjs.Dayjs | null;
  address?: string | null;
  phone?: string | null;
  idNumber?: string | null;
  kycStatus?: keyof typeof KycStatus;
  createdAt?: dayjs.Dayjs | null;
  partner?: IPartner | null;
}

export const defaultValue: Readonly<ICustomer> = {};
