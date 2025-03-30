export interface App {
  id: number;
  name: string;
  description: string;
  imageUrl: string;
  appUrl: string;
  category: string;
  rating?: number;
  downloads?: number;
  isInstalled?: boolean;
}
