export interface Person {
  name: string;
  lat: number;
  lng: number;
  type?: "Provider" | "Staff";
}

export interface Office {
  name: string;
  address: string;
  lat: number;
  lng: number;
}

export interface AppData {
  providers: Person[];
  staff: Person[];
  offices: Office[];
}

export interface OfficeWithDistance extends Office {
  distance: number;
}
