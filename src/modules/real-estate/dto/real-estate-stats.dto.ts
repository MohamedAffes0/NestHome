import { RealEstate } from '../real-estate.entity';
import { User } from '../../user/user.entity';

export type RealEstateWithStats = RealEstate & {
  totalComments: number | null;
  avgRating: number | null;
  agent: User | null;
};
