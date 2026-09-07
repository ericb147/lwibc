import { getCollection } from "astro:content";
import { getAppleCalendarIcs } from "../../utils/dateUtils";

export async function getStaticPaths() {
  const eventEntries = await getCollection("events", ({ data }) => {
    return import.meta.env.PROD ? !data.draft : true;
  });

  return eventEntries.map((entry) => ({
    params: { slug: entry.slug },
    props: { entry },
  }));
}

export async function GET({ props, site }) {
  const { entry } = props;
  const siteUrl = `${site?.toString().replace(/\/$/, "") || "https://www.lwibc.com"}/events/${entry.slug}`;
  const body = getAppleCalendarIcs({ ...entry.data, slug: entry.slug }, siteUrl);

  return new Response(body, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="${entry.slug}.ics"`,
    },
  });
}