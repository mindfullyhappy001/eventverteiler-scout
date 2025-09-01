import type { Event } from '@prisma/client';

export const adapter = {
  async create_event(_evt: Event, _cfg: any) {
    throw new Error('Spontacts API not supported. Use UI automation method.');
  },
  async update_event(_evt: Event, _externalId: string | undefined, _cfg: any) {
    throw new Error('Spontacts API not supported. Use UI automation method.');
  },
  async delete_event(_externalId: string | undefined, _cfg: any) {
    throw new Error('Spontacts API not supported. Use UI automation method.');
  },
  async get_status(_externalId: string | undefined, _cfg: any) {
    return { exists: false } as any;
  },
};
