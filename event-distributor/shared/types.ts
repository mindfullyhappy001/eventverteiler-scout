export type EventInput = {
  title?: string;
  description?: string;
  date?: string; // ISO
  time?: string;
  location?: any;
  category?: string;
  tags?: string[];
  price?: number | null;
  isVirtual?: boolean;
  images?: string[];
  organizer?: string;
  url?: string;
};

export type PlatformKey = 'meetup' | 'eventbrite' | 'facebook' | 'spontacts';
export type PublishMethod = 'api' | 'ui';
