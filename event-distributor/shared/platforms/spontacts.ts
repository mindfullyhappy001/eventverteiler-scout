import type { EventInput } from '../../shared/types';

export type SpontactsExtra = {
  category?: string;
  city?: string;
  meetingPoint?: string;
  maxParticipants?: number;
  visibility?: 'public' | 'friends' | 'private';
  difficulty?: string;
};

export function mapToSpontactsFields(e: any) {
  const extras: SpontactsExtra = e?.spontacts || {};
  return {
    title: e.title || '',
    description: e.description || '',
    date: e.date || '',
    time: e.time || '',
    category: extras.category || e.category || '',
    city: extras.city || (typeof e.location === 'string' ? e.location : e.location?.city || ''),
    meetingPoint: extras.meetingPoint || '',
    maxParticipants: extras.maxParticipants || undefined,
    visibility: extras.visibility || 'public',
    difficulty: extras.difficulty || '',
    price: e.price || 0,
    images: e.images || [],
    isVirtual: !!e.isVirtual,
  };
}
