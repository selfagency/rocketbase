export interface NavItem {
  id: string;
  title?: string;
  slug: string;
  order?: number;
  summary?: string;
  children?: NavItem[];
}
