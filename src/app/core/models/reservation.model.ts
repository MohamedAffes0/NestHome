export enum ReservationStatus {
  PENDING   = 'pending',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
}

// ── Entity ────────────────────────────────────────────────
export interface Reservation {
  id:           string;
  clientPhone:  string;
  cinPassport:  string;
  visitDate:    string;   // ISO date "YYYY-MM-DD"
  visitTime:    string;   // "HH:mm"
  status:       ReservationStatus;
  userId:       string;
  realEstateId: string;
  realEstate?: {
    id:      string;
    title:   string;
    address: string;
    images:  string[];
  };
}

// ── DTOs ─────────────────────────────────────────────────
export interface CreateReservationDto {
  clientPhone: string;
  cinPassport: string;
  visitDate:   string;
  visitTime:   string;
}

export interface UpdateReservationDto {
  clientPhone?: string;
  cinPassport?: string;
  visitDate?:   string;
  visitTime?:   string;
  status?:      ReservationStatus;
}

export interface ReservationFilterDto {
  clientPhone?:    string;
  minVisitDate?:   string;
  maxVisitDate?:   string;
  sortByVisitDate?: 'asc' | 'desc';
  status?:         ReservationStatus | string;
  realEstateId?:   string;
  userId?:         string;
}