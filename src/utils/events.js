import { getCollection } from 'astro:content';
import { isSanityConfigured, sanityClient } from '../lib/sanity/client';
import { eventsQuery } from '../lib/sanity/queries';

const useSanityEvents = import.meta.env.PUBLIC_SANITY_EVENTS_ENABLED === 'true';

export function getEventImage(event) {
  const image = event?.data?.image;

  if (typeof image === 'string' && image.length > 0) return image;
  if (image?.asset?.url) return image.asset.url;

  return '/uploads/event-placeholder.webp';
}

export async function getEvents() {
  if (useSanityEvents && isSanityConfigured && sanityClient) {
    const events = await sanityClient.fetch(eventsQuery);

    return events.map((event) => ({
      slug: event.slug,
      source: 'sanity',
      data: {
        ...event,
        image: event.image || '/uploads/event-placeholder.webp',
      },
    }));
  }

  const entries = await getCollection('events', ({ data }) => {
    return import.meta.env.PROD ? !data.draft && data.published : true;
  });

  return entries.map((entry) => ({
    ...entry,
    source: 'markdown',
  }));
}
