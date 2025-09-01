import axios from 'axios';
import type { Event } from '@prisma/client';

export const adapter = {
  async create_event(evt: Event, cfg: any) {
    const token = cfg?.pageToken || process.env.FACEBOOK_PAGE_TOKEN;
    const pageId = cfg?.pageId || process.env.FACEBOOK_PAGE_ID;
    if (!token || !pageId) throw new Error('FACEBOOK page token/id missing in config');
    const resp = await axios.post(
      `https://graph.facebook.com/v18.0/${pageId}/events`,
      toFacebookPayload(evt),
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const externalId = String(resp.data.id);
    return { externalId, url: `https://facebook.com/events/${externalId}`, proof: resp.data };
  },
  async update_event(evt: Event, externalId: string | undefined, cfg: any) {
    if (!externalId) throw new Error('No externalId for update');
    const token = cfg?.pageToken || process.env.FACEBOOK_PAGE_TOKEN;
    if (!token) throw new Error('FACEBOOK page token missing in config');
    const resp = await axios.post(
      `https://graph.facebook.com/v18.0/${externalId}`,
      toFacebookPayload(evt),
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return { url: `https://facebook.com/events/${externalId}`, proof: resp.data };
  },
  async delete_event(externalId: string | undefined, cfg: any) {
    if (!externalId) throw new Error('No externalId for delete');
    const token = cfg?.pageToken || process.env.FACEBOOK_PAGE_TOKEN;
    if (!token) throw new Error('FACEBOOK page token missing in config');
    const resp = await axios.delete(`https://graph.facebook.com/v18.0/${externalId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return { ok: resp.data?.success, proof: resp.data };
  },
  async get_status(externalId: string | undefined, cfg: any) {
    if (!externalId) return { exists: false } as any;
    const token = cfg?.pageToken || process.env.FACEBOOK_PAGE_TOKEN;
    if (!token) throw new Error('FACEBOOK page token missing in config');
    try {
      const resp = await axios.get(`https://graph.facebook.com/v18.0/${externalId}`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { fields: 'id,name,start_time,end_time,place' },
      });
      return { exists: true, url: `https://facebook.com/events/${externalId}`, proof: resp.data };
    } catch (e: any) {
      if (e.response?.status === 404) return { exists: false } as any;
      throw e;
    }
  },
};

function toFacebookPayload(evt: Event) {
  return {
    name: evt.title,
    description: evt.description,
    start_time: evt.date ? new Date(evt.date).toISOString() : undefined,
    end_time: evt.date ? new Date(evt.date).toISOString() : undefined,
    is_online: !!evt.isVirtual,
  };
}
