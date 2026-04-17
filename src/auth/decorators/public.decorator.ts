import { SetMetadata } from '@nestjs/common';

/**
 * Custom decorator to mark a route as public (no authentication required).
 * @returns {MethodDecorator & ClassDecorator} A decorator that sets the isPublic metadata to true.
 */
export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
