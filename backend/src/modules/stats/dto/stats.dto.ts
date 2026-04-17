// ── Overview ─────────────────────────────────────────────
export interface OverviewStats {
  totalProperties: number;
  totalUsers: number;
  totalReservations: number;
  totalContracts: number;
  totalPayments: number;
  totalRevenue: number;
}

// ── Monthly series (revenus, réservations, contrats) ─────
export interface MonthlyPoint {
  month: string;
  value: number;
}

export interface RevenueStats {
  monthly: MonthlyPoint[];
  total: number;
}

// ── Reservations ─────────────────────────────────────────
export interface ReservationStats {
  monthly: MonthlyPoint[];
  byStatus: {
    pending: number;
    confirmed: number;
    cancelled: number;
  };
}

// ── Properties ───────────────────────────────────────────
export interface PropertyStats {
  byStatus: {
    available: number;
    rented: number;
    sold: number;
    reserved: number;
  };
  topRated: {
    id: string;
    title: string;
    avgRating: number;
    totalComments: number;
  }[];
}

// ── Contracts ─────────────────────────────────────────────
export interface ContractStats {
  monthly: MonthlyPoint[];
  bySale: number;
  byRental: number;
}
