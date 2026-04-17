import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BASE_URL } from '../../../lib/auth-client';
import {
  RealEstate,
  RealEstateDetail,
  RealEstateWithStats,
  PaginatedResponse,
  CreateRealEstateDto,
  UpdateRealEstateDto,
  RealEstateFilterDto,
} from '../models';

@Injectable({ providedIn: 'root' })
export class RealEstateService {
  private readonly apiUrl = `${BASE_URL}/real-estate`;

  constructor(private http: HttpClient) {}

  /**
   * Get all real estate listings with optional filters and pagination.
   *
   * @param filters Optional filtering criteria (title, address, type, status, etc.)
   * @param page Page number for pagination (default: 1)
   * @param limit Number of items per page (default: 20)
   * @returns An observable of paginated response containing real estate listings with stats
   */
  getAll(
    filters: RealEstateFilterDto = {},
    page: number = 1,
    limit: number = 20,
  ): Observable<PaginatedResponse<RealEstateWithStats>> {
    let params = new HttpParams()
      .set('page',  page.toString())
      .set('limit', limit.toString());

    if (filters.title)       params = params.set('title',       filters.title);
    if (filters.address)     params = params.set('address',     filters.address);
    if (filters.type        !== undefined) params = params.set('type',        filters.type.toString());
    if (filters.status      !== undefined) params = params.set('status',      filters.status.toString());
    if (filters.minRooms    !== undefined) params = params.set('minRooms',    filters.minRooms.toString());
    if (filters.minPrice    !== undefined) params = params.set('minPrice',    filters.minPrice.toString());
    if (filters.maxPrice    !== undefined) params = params.set('maxPrice',    filters.maxPrice.toString());
    if (filters.minSurface  !== undefined) params = params.set('minSurface',  filters.minSurface.toString());
    if (filters.maxSurface  !== undefined) params = params.set('maxSurface',  filters.maxSurface.toString());
    if (filters.sortByPrice)  params = params.set('sortByPrice',  filters.sortByPrice);
    if (filters.agentId)      params = params.set('agentId',      filters.agentId);

    return this.http.get<PaginatedResponse<RealEstateWithStats>>(this.apiUrl, { params });
  }

  /**
   * Get a single real estate listing by its ID, including average rating and total comments.
   *
   * @param id The ID of the real estate listing to retrieve
   * @returns An observable of the real estate listing with stats
   */
  getById(id: string): Observable<RealEstateDetail> {
    return this.http.get<RealEstateDetail>(`${this.apiUrl}/${id}`);
  }

  /**
   * Create a new real estate listing with optional images.
   *
   * @param dto The data transfer object containing the details of the real estate to create
   * @param images Optional array of image files to upload with the listing
   * @returns An observable of the created real estate listing
   */
  create( dto: CreateRealEstateDto, images?: File[] ): Observable<RealEstate> {
    const formData = this.buildFormData(dto, images);
    return this.http.post<RealEstate>(this.apiUrl, formData, { withCredentials: true });
  }

  /**
   * Update an existing real estate listing by its ID, with support for partial updates and image management.
   *
   * @param id The ID of the real estate listing to update
   * @param dto The data transfer object containing the fields to update (partial)
   * @param newImages Optional array of new image files to add to the listing
   * @returns An observable of the updated real estate listing
   */
  update( id: string, dto: UpdateRealEstateDto, newImages?: File[] ): Observable<RealEstate> {
    const formData = new FormData();

    // Text fields (only those present in dto)
    const fields: (keyof UpdateRealEstateDto)[] = [
      'title', 'description', 'price', 'address', 'lat', 'lng',
      'type', 'status', 'condition', 'rooms', 'surface', 'bathroom',
    ];
    fields.forEach(key => {
      const val = dto[key];
      if (val !== undefined && val !== null) formData.append(key, val.toString());
    });

    this.appendEquipment(formData, dto.equipment ?? []);

    this.appendImagesToKeep(formData, dto.imagesToKeep ?? []);

    // New images to add
    newImages?.forEach(file => formData.append('images', file));

    return this.http.patch<RealEstate>(`${this.apiUrl}/${id}`, formData, { withCredentials: true });
  }

  /**
   * Update images of a real estate listing by its ID. Can replace all images or add to existing ones.
   *
   * @param id The ID of the real estate listing to update images for
   * @param images Array of image files to upload
   * @param replaceAll If true, replaces all existing images with the new ones; if false, adds to existing images (default: false)
   * @returns An observable of the updated real estate listing with new images
   */
  updateImages(id: string, images: File[], replaceAll = false): Observable<RealEstate> {
    const formData = new FormData();
    formData.append('replaceAll', replaceAll.toString());
    images.forEach(file => formData.append('images', file));
    return this.http.patch<RealEstate>(`${this.apiUrl}/${id}/images`, formData, { withCredentials: true });
  }

  /**
   * Delete a real estate listing by its ID.
   *
   * @param id The ID of the real estate listing to delete
   * @returns An observable of the deletion result containing a message
   */
  delete(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`, { withCredentials: true });
  }

  // ── Helpers ───────────────────────────────────────────────
  private buildFormData(dto: CreateRealEstateDto, images?: File[]): FormData {
    const formData = new FormData();

    formData.append('title',       dto.title);
    formData.append('description', dto.description ?? '');
    formData.append('price',       dto.price.toString());
    formData.append('address',     dto.address);

    if (dto.lat !== undefined && dto.lat !== null) formData.append('lat', dto.lat.toString());
    if (dto.lng !== undefined && dto.lng !== null) formData.append('lng', dto.lng.toString());

    formData.append('type',        dto.type.toString());
    formData.append('status',      dto.status.toString());
    formData.append('condition',   dto.condition);
    formData.append('rooms',       dto.rooms.toString());
    formData.append('surface',     dto.surface.toString());
    formData.append('bathroom',    dto.bathroom.toString());

    this.appendEquipment(formData, dto.equipment ?? []);

    images?.forEach(file => formData.append('images', file));

    return formData;
  }

  private appendEquipment(formData: FormData, equipment: string[]): void {
    if (equipment.length === 0) {
      formData.append('equipment', '');
    } else {
      equipment.forEach(eq => formData.append('equipment', eq));
    }
  }

  private appendImagesToKeep(formData: FormData, urls: string[]): void {
    if (urls.length === 0) {
      formData.append('imagesToKeep', '');
    } else {
      urls.forEach(url => formData.append('imagesToKeep', url));
    }
  }

  // ── Static Helpers (labels UI) ─────────────────────────
  static typeLabel(type: number): string {
    return ['Maison', 'Appartement', 'Terrain', 'Commerce'][type] ?? '—';
  }

  static statusLabel(status: number): string {
    return ['À Vendre', 'À Louer', 'Vendu', 'Loué'][status] ?? '—';
  }

  static isSale(status: number): boolean {
    return status === 0 || status === 2;
  }
}