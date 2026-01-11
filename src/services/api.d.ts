// Type definitions for API service

export interface Artwork {
  id: number;
  title: string;
  description: string;
  images: string[];
  price: number;
  category: string;
  year: number;
  medium: string;
  size: string;
}

export interface AboutInfo {
  title: string;
  name: string;
  bio: string;
  experience: string;
  phone?: string;
  email?: string;
  vk?: string;
  instagram?: string;
  gallery?: string[];
}

export function getArtworks(): Promise<Artwork[]>;
export function getArtwork(id: number): Promise<Artwork | null>;
export function getAboutInfo(): Promise<AboutInfo | null>;
export function getArtworksByCategory(category: string): Promise<Artwork[]>;
