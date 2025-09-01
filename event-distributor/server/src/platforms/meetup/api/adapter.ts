import axios from 'axios';
import type { Event } from '@prisma/client';

export const adapter = {
  async create_event(evt: Event, cfg: any) {
    const token = cfg?.token || process.env.MEETUP_API_TOKEN;
    const group = cfg?.group || 'your-group';
    if (!token) throw new Error('MEETUP token missing in config');
    const resp = await axios.post(
      `https://api.meetup.com/${group}/events`,
      toMeetupPayload(evt),
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const externalId = String(resp.data.id);
    return { externalId, url: resp.data.link, proof: resp.data };
  },
  async update_event(evt: Event, externalId: string | undefined, cfg: any) {
    if (!externalId) throw new Error('No externalId for update');
    const token = cfg?.token || process.env.MEETUP_API_TOKEN;
    const group = cfg?.group || 'your-group';
    if (!token) throw new Error('MEETUP token missing in config');
    const resp = await axios.patch(
      `https://api.meetup.com/${group}/events/${externalId}`,
      toMeetupPayload(evt),
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return { url: resp.data.link, proof: resp.data };
  },
  async delete_event(externalId: string | undefined, cfg: any) {
    if (!externalId) throw new Error('No externalId for delete');
    const token = cfg?.token || process.env.MEETUP_API_TOKEN;
    const group = cfg?.group || 'your-group';
    if (!token) throw new Error('MEETUP token missing in config');
    const resp = await axios.delete(`https://api.meetup.com/${group}/events/${externalId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return { ok: resp.status === 204, proof: { status: resp.status } };
  },
  async get_status(externalId: string | undefined, cfg: any) {
    if (!externalId) return { exists: false } as any;
    const token = cfg?.token || process.env.MEETUP_API_TOKEN;
    const group = cfg?.group || 'your-group';
    if (!token) throw new Error('MEETUP token missing in config');
    try {
      const resp = await axios.get(`https://api.meetup.com/${group}/events/${externalId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return { exists: true, url: resp.data.link, proof: resp.data };
    } catch (e: any) {
      if (e.response?.status === 404) return { exists: false } as any;
      throw e;
    }
  },
};

function toMeetupPayload(evt: Event) {
  return {
    name: evt.title,
    description: evt.description,
    time: evt.date ? new Date(evt.date).getTime() : undefined,
  };
}
