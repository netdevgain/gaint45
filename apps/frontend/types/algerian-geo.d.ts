declare module 'algerian-geo' {
  export interface Wilaya {
    id: string;
    code: string;
    name: string;
    ar_name: string;
    longitude: string;
    latitude: string;
  }

  export interface Commune {
    id: string;
    post_code: string;
    name: string;
    wilaya_id: string;
    ar_name: string;
    longitude: string;
    latitude: string;
  }

  export function getAllWilayas(): Wilaya[];
  export function getAllCommunes(): Commune[];
}
