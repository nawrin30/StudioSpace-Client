export interface Studio {
  _id: string;
  title: string;
  category: string;
  hourlyRate: number;
  securityDeposit: number;
  maxCapacity: number;
  location: string;
  imageUrl: string;
  amenities: string[];
  overview: string;
  ownerEmail: string;
  ownerName: string;
  rating: number;
}

export interface StudioFormValues {
  title: string;
  category: string;
  hourlyRate: string;
  securityDeposit: string;
  maxCapacity: string;
  location: string;
  imageUrl: string;
  amenities: string;
  overview: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  photoURL?: string;
}

export interface Booking {
  _id: string;
  studio: Pick<Studio, "_id" | "title" | "imageUrl" | "location"> | null;
  date: string;
  startTime: string;
  endTime: string;
  status: "Pending" | "Confirmed" | "Completed" | "Cancelled";
  totalPrice: number;
  userName?: string;
  userEmail?: string;
}
