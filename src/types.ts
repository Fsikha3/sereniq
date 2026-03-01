export type Emotion = 'Depressed' | 'Anxious' | 'Neutral' | 'Happy' | 'Energetic';

export interface MoodLog {
  id: string;
  date: string;
  emotion: Emotion;
  rating: number; // 1-10
  notes?: string;
}

export interface FoodLog {
  id: string;
  date: string;
  food: string;
  analysis?: {
    serotonin: number;
    dopamine: number;
    cortisol: number;
  };
}

export interface UserProfile {
  name: string;
  challenge: 'Depression' | 'Anxiety' | 'Stress' | 'Low energy';
  dietType: 'Vegetarian' | 'Non-vegetarian' | 'Vegan';
  isOnboarded: boolean;
  isPremium: boolean;
}

export interface AppState {
  user: UserProfile;
  moodLogs: MoodLog[];
  foodLogs: FoodLog[];
  gutScore: number;
}
