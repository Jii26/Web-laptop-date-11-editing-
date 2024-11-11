export const GENRES = [
  'Horror',
  'Fantasy',
  'Adventure',
  'Mystery',
  'Literary',
  'Dystopian',
  'Romance',
  'Sci-Fi',
  'Thriller',
  'Detective',
  'Urban',
  'Action',
  'ACG',
  'Games',
  'LGBT+',
  'War',
  'Realistic',
  'History',
  'Cherads',
  'General',
  'Teen',
  'Devotional',
  'Poetry'
] as const;

export type Genre = typeof GENRES[number];

export interface Novel {
  id: string;
  title: string;
  author: string;
  views: number;
  leadingCharacter: 'male' | 'female';
  uploadBy: string;
  genre: Genre[];
  story: string;
  novelCoverPage?: string;
  createdAt: Date;
}

export interface Chapter {
  id: string;
  title: string;
  uploadDate: Date;
  chapterNumber: number;
  content: string;
}

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  age?: number;
  interestedGenres: Genre[];
}