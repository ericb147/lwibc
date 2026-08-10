export const siteSettingsQuery = `*[_type == "siteSettings"][0]{
  churchName,
  address,
  streetAddress,
  city,
  state,
  postalCode,
  mailingAddress,
  email,
  phone,
  serviceTimes,
  youtubeUrl,
  flocknoteUrl,
  facebookUrl,
  givingUrl,
  defaultSeoTitle,
  defaultSeoDescription
}`;

export const eventsQuery = `*[_type == "event"] | order(startDate asc){
  _id,
  title,
  "slug": slug.current,
  "date": startDate,
  "endDate": endDate,
  "time": displayTime,
  timezone,
  location,
  address,
  "image": image.asset->url,
  summary,
  tags,
  registrationLink,
  registrationRequired,
  price,
  featured,
  externalId
}`;
