import axios from 'axios';
import type { Event } from '@prisma/client';

export const adapter = {
  async create_event(evt: Event, cfg: any) {
    const token = cfg?.token || process.env.EVENTBRITE_API_TOKEN;
    if (!token) throw new Error('EVENTBRITE token missing in config');
    const resp = await axios.post(
      'https://www.eventbriteapi.com/v3/events/',
      toEventbritePayload(evt),
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const externalId = String(resp.data.id);
    return { externalId, url: resp.data.url, proof: resp.data };
  },
  async update_event(evt: Event, externalId: string | undefined, cfg: any) {
    if (!externalId) throw new Error('No externalId for update');
    const token = cfg?.token || process.env.EVENTBRITE_API_TOKEN;
    if (!token) throw new Error('EVENTBRITE token missing in config');
    const resp = await axios.post(
      `https://www.eventbriteapi.com/v3/events/${externalId}/`,
      toEventbritePayload(evt),
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return { url: resp.data.url, proof: resp.data };
  },
  async delete_event(externalId: string | undefined, cfg: any) {
    if (!externalId) throw new Error('No externalId for delete');
    const token = cfg?.token || process.env.EVENTBRITE_API_TOKEN;
    if (!token) throw new Error('EVENTBRITE token missing in config');
    const resp = await axios.delete(`https://www.eventbriteapi.com/v3/events/${externalId}/`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return { ok: resp.status === 204, proof: { status: resp.status } };
  },
  async get_status(externalId: string | undefined, cfg: any) {
    if (!externalId) return { exists: false } as any;
    const token = cfg?.token || process.env.EVENTBRITE_API_TOKEN;
    if (!token) throw new Error('EVENTBRITE token missing in config');
    try {
      const resp = await axios.get(`https://www.eventbriteapi.com/v3/events/${externalId}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return { exists: true, url: resp.data.url, proof: resp.data };
    } catch (e: any) {
      if (e.response?.status === 404) return { exists: false } as any;
      throw e;
    }
  },
};

function toEventbritePayload(evt: Event) {
  return {
    event: {
      name: { html: evt.title },
      description: { html: evt.description },
      start: { timezone: 'UTC', utc: evt.date ? new Date(evt.date).toISOString() : undefined },
      end: { timezone: 'UTC', utc: evt.date ? new Date(evt.date).toISOString() : undefined },
      currency: 'EUR',
      online_event: !!evt.isVirtual,
    },
  };
}
