# Modèles de données — NestHome Frontend

Tous les modèles TypeScript sont dans `src/app/core/models/` et réexportés via `src/app/core/models/index.ts`.

---

## User

```typescript
interface User {
  id:            string;
  name:          string;
  email:         string;
  emailVerified: boolean;
  image:         string | null;
  createdAt:     string;
  updatedAt:     string;
  role:          'admin' | 'agent' | 'user';
  isActive:      boolean;
}
```

**DTOs associés :**

```typescript
interface UpdateProfileDto  { name?: string; email?: string; }
interface ChangePasswordDto { currentPassword: string; newPassword: string; }
interface CreateUserDto     { name: string; email: string; password: string; role: 'admin' | 'agent' | 'user'; }
interface UserFilterDto     { role?: string; isActive?: boolean; email?: string; name?: string; createdAtMin?: string; createdAtMax?: string; }
```

---

## RealEstate

```typescript
enum RealEstateType   { HOUSE = 0, APARTMENT = 1, LAND = 2, BUSINESS = 3 }
enum RealEstateStatus { FOR_SALE = 0, FOR_RENT = 1, SOLD = 2, RENTED = 3 }

interface RealEstate {
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

interface RealEstateWithStats extends RealEstate {
  avgRating:     number;
  totalComments: number;
}

interface RealEstateDetail extends RealEstateWithStats {
  comments: ApiComment[];
}

interface RealEstateAgent {
  name:  string;
  email: string;
  image: string | null;
}
```

**DTOs :**

```typescript
interface CreateRealEstateDto {
  title: string; description: string; price: number; address: string;
  lat: number; lng: number; type: RealEstateType; status: RealEstateStatus;
  condition: string; rooms: number; surface: number; bathroom: number;
  equipment?: string[];
}

interface UpdateRealEstateDto extends Partial<CreateRealEstateDto> {
  imagesToKeep?: string[];
}

interface RealEstateFilterDto {
  title?: string; address?: string; type?: RealEstateType; status?: RealEstateStatus;
  minRooms?: number; minPrice?: number; maxPrice?: number;
  minSurface?: number; maxSurface?: number; sortByPrice?: 'asc' | 'desc'; agentId?: string;
}
```

---

## Reservation

```typescript
enum ReservationStatus { PENDING = 'pending', CONFIRMED = 'confirmed', CANCELLED = 'cancelled' }

interface Reservation {
  id:           string;
  clientPhone:  string;
  cinPassport:  string;
  visitDate:    string;   // "YYYY-MM-DD"
  visitTime:    string;   // "HH:mm"
  status:       ReservationStatus;
  userId:       string;
  realEstateId: string;
  realEstate?: {
    id: string; title: string; address: string; images: string[];
  };
}
```

**DTOs :**

```typescript
interface CreateReservationDto {
  clientPhone: string; cinPassport: string; visitDate: string; visitTime: string;
}

interface UpdateReservationDto {
  clientPhone?: string; cinPassport?: string; visitDate?: string;
  visitTime?: string; status?: ReservationStatus;
}

interface ReservationFilterDto {
  clientPhone?: string; minVisitDate?: string; maxVisitDate?: string;
  sortByVisitDate?: 'asc' | 'desc'; status?: ReservationStatus | string;
  realEstateId?: string; userId?: string;
}
```

---

## Contract

```typescript
interface Contract {
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

// endDate === null  →  contrat de vente
// endDate !== null  →  contrat de location
```

**DTOs :**

```typescript
interface CreateContractDto {
  cinPassport: string; startDate: string; endDate?: string;
  userId: string; realEstateId: string;
}

interface UpdateContractDto {
  cinPassport?: string; startDate?: string; endDate?: string;
}

interface ContractFilterDto {
  userId?: string; agentId?: string; realEstateId?: string;
  startDate?: string; endDate?: string;
}

interface UnpaidContractsResponse {
  sale:   Contract[];
  rental: Contract[];
  total:  number;
}
```

---

## Payment

```typescript
interface Payment {
  id:           string;
  amount:       number;
  date:         string;
  realEstateId: string;
  userId:       string;
  realEstate?:  Pick<RealEstate, 'id' | 'title' | 'address' | 'price' | 'status' | 'images'>;
  user?:        Pick<User, 'id' | 'name' | 'email' | 'image'>;
}
```

**DTOs :**

```typescript
interface CreatePaymentDto { amount: number; realEstateId: string; userId: string; }
interface UpdatePaymentDto { amount?: number; }
interface PaymentFilterDto { userId?: string; realEstateId?: string; sortByDate?: 'asc' | 'desc'; }
```

---

## Comment

```typescript
interface ApiComment {
  id:           string;
  content:      string;
  rating:       number;       // 1 à 5
  createdAt:    string;
  userId:       string;
  realEstateId: string;
  user: { name: string; image: string | null; };
}

interface CreateCommentDto {
  realEstateId: string; content: string; rating: number;
}
```

---

## Favorite

```typescript
interface Favorite {
  id:           string;
  userId:       string;
  realEstateId: string;
  realEstate:   RealEstate;
}
```

---

## Auth

```typescript
interface Session {
  expiresAt: string; token: string; createdAt: string; updatedAt: string;
  ipAddress: string; userAgent: string; userId: string; id: string;
}

interface SessionResponse { session: Session; user: User; }
interface LoginResponse   { token: string; user: User; redirect: boolean; }
interface SignUpResponse  { token: string; user: { id: string; email: string; name: string; ... }; }
interface SignUpDto       { email: string; password: string; name: string; role?: string; }
```

---

## Pagination

```typescript
interface PaginationMeta {
  totalItems:   number;
  itemCount:    number;
  itemsPerPage: number;
  totalPages:   number;
  currentPage:  number;
}

interface PaginatedResponse<T> {
  items: T[];
  meta:  PaginationMeta;
}
```

---

## Stats

```typescript
interface MonthlyPoint     { month: string; value: number; }

interface OverviewStats {
  totalProperties: number; totalUsers: number; totalReservations: number;
  totalContracts: number; totalPayments: number; totalRevenue: number;
}

interface RevenueStats     { monthly: MonthlyPoint[]; total: number; }

interface ReservationStats {
  monthly: MonthlyPoint[];
  byStatus: { pending: number; confirmed: number; cancelled: number };
}

interface PropertyStats {
  byStatus: { available: number; rented: number; sold: number; reserved: number };
  topRated: { id: string; title: string; avgRating: number; totalComments: number }[];
}

interface ContractStats    { monthly: MonthlyPoint[]; bySale: number; byRental: number; }
```
