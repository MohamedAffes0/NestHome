export interface MonthlyPoint    { month: string; value: number; }

export interface OverviewStats {
  totalProperties:   number;
  totalUsers:        number;
  totalReservations: number;
  totalContracts:    number;
  totalPayments:     number;
  totalRevenue:      number;
}

export interface RevenueStats {
  monthly: MonthlyPoint[];
  total:   number;
}

export interface ReservationStats {
  monthly:  MonthlyPoint[];
  byStatus: { pending: number; confirmed: number; cancelled: number };
}

export interface PropertyStats {
  byStatus: { available: number; rented: number; sold: number; reserved: number };
  topRated: { id: string; title: string; avgRating: number; totalComments: number }[];
}

export interface ContractStats {
  monthly:  MonthlyPoint[];
  bySale:   number;
  byRental: number;
}