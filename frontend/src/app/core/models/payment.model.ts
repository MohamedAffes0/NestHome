import { RealEstate } from './real-estate.model';
import { User } from './user.model';

export interface Payment {
  id:           string;
  amount:       number;
  date:         string;
  realEstateId: string;
  userId:       string;
  realEstate?:  Pick<RealEstate, 'id' | 'title' | 'address' | 'price' | 'status' | 'images'>;
  user?:        Pick<User, 'id' | 'name' | 'email' | 'image'>;
}

export interface CreatePaymentDto {
  amount:       number;
  realEstateId: string;
  userId:       string;
}

export interface UpdatePaymentDto {
  amount?: number;
}

export interface PaymentFilterDto {
  userId?:      string;
  realEstateId?: string;
  sortByDate?:  'asc' | 'desc';
}