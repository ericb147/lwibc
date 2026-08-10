import { getEntry } from 'astro:content';
import { isSanityConfigured, sanityClient } from '../lib/sanity/client';
import { siteSettingsQuery } from '../lib/sanity/queries';

const SITE_INFO_SLUG = 'site-info';

export async function getSiteInfo() {
  const entry = await getEntry('siteInfo', SITE_INFO_SLUG);
  const fallback = entry?.data;

  if (isSanityConfigured && sanityClient) {
    const siteSettings = await sanityClient.fetch(siteSettingsQuery);

    if (siteSettings) {
      return {
        ...fallback,
        ...siteSettings,
        serviceTimes: Array.isArray(siteSettings.serviceTimes)
          ? siteSettings.serviceTimes
          : (fallback?.serviceTimes || []),
      };
    }
  }

  if (!entry) {
    throw new Error(`Missing site info entry: ${SITE_INFO_SLUG}`);
  }

  return entry.data;
}
