export interface NavItem {
  id: string;
  title?: string;
  slug: string;
  order?: number;
  children?: NavItem[];
}
