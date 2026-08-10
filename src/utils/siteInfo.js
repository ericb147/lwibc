import { getEntry } from 'astro:content';

const SITE_INFO_SLUG = 'site-info';

export async function getSiteInfo() {
  const entry = await getEntry('siteInfo', SITE_INFO_SLUG);

  if (!entry) {
    throw new Error(`Missing site info entry: ${SITE_INFO_SLUG}`);
  }

  return entry.data;
}
