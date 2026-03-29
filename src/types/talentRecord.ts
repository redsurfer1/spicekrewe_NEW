/** Shared talent directory shape (seed data + Supabase `professionals`). */
export type TalentRecord = {
  id: string;
  name: string;
  initials: string;
  role: string;
  specialty: string;
  rate: string;
  rating: number;
  reviews: number;
  verified: boolean;
  available: boolean;
  avatarColor: string;
  avatarText: string;
  tags: string[];
  bio: string;
};
