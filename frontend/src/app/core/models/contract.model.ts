import { RealEstate } from './real-estate.model';
import { User } from './user.model';

export interface Contract {
  id:           string;
  cinPassport:  string;
  startDate:    string;
  endDate:      string | null;
  userId:       string;
  agentId:      string;
  realEstateId: string;
  user?:        Pick<User, 'id' | 'name' | 'email' | 'image'>;
  agent?:       Pick<User, 'id' | 'name' | 'email' | 'image'>;
  realEstate?:  Pick<RealEstate, 'id' | 'title' | 'address' | 'price' | 'status' | 'images'>;
}

export interface CreateContractDto {
  cinPassport:  string;
  startDate:    string;
  endDate?:     string;
  userId:       string;
  realEstateId: string;
}

export interface UpdateContractDto {
  cinPassport?: string;
  startDate?:   string;
  endDate?:     string;
}

export interface ContractFilterDto {
  userId?:       string;
  agentId?:      string;
  realEstateId?: string;
  startDate?:    string;
  endDate?:      string;
}

export interface UnpaidContractsResponse {
  sale:   Contract[];
  rental: Contract[];
  total:  number;
}