import { ApiComment } from "./comment.model";

export enum RealEstateType {
  HOUSE     = 0,
  APARTMENT = 1,
  LAND      = 2,
  BUSINESS  = 3,
}

export enum RealEstateStatus {
  FOR_SALE = 0,
  FOR_RENT = 1,
  SOLD     = 2,
  RENTED   = 3,
}

// ── Agent ────────────────
export interface RealEstateAgent {
  name:  string;
  email: string;
  image: string | null;
}

// ── Principal Entity ──────────────────────────────────────
export interface RealEstate {
  id:          string;
  title:       string;
  description: string;
  price:       number;
  address:     string;
  lat:         number;
  lng:         number;
  type:        RealEstateType;
  status:      RealEstateStatus;
  condition:   string;
  images:      string[];
  rooms:       number;
  surface:     number;
  bathroom:    number;
  equipment:   string[];
  agentId:     string | null;
  agent:       RealEstateAgent | null;
}

// ── With Stats ────────────
export interface RealEstateWithStats extends RealEstate {
  avgRating:     number;
  totalComments: number;
}

// ── Detail (with comments) ────────────────────────────────
export interface RealEstateDetail extends RealEstateWithStats {
  comments: ApiComment[];
}

// ── DTOs ───────────────────────────────────────────────────
export interface CreateRealEstateDto {
  title:       string;
  description: string;
  price:       number;
  address:     string;
  lat:         number;
  lng:         number;
  type:        RealEstateType;
  status:      RealEstateStatus;
  condition:   string;
  rooms:       number;
  surface:     number;
  bathroom:    number;
  equipment?:  string[];
}

export interface UpdateRealEstateDto extends Partial<CreateRealEstateDto> {
  imagesToKeep?: string[];
}

export interface RealEstateFilterDto {
  title?:       string;
  address?:     string;
  type?:        RealEstateType;
  status?:      RealEstateStatus;
  minRooms?:    number;
  minPrice?:    number;
  maxPrice?:    number;
  minSurface?:  number;
  maxSurface?:  number;
  sortByPrice?: 'asc' | 'desc';
  agentId?:     string;
}