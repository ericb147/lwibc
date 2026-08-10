# LWIBC Sanity Studio

This is the Phase 2 Sanity Studio for Living Waters Independent Baptist Church.

## Setup

1. Create a project at [sanity.io/manage](https://www.sanity.io/manage).
2. Copy `.env.example` to `.env`.
3. Set `SANITY_STUDIO_PROJECT_ID` to the project ID from Sanity.
4. Set `SANITY_STUDIO_DATASET` to `production` unless a different dataset is intentionally used.
5. Install dependencies with `npm install` from this directory.
6. Start the Studio with `npm run dev`.

The current schemas cover events, sermons/messages, staff, ministries, announcements, sermon series, and shared site settings.

## Deployment

After signing in with the Sanity CLI, deploy the Studio with `npm run deploy`. The Studio is separate from the Astro website and can be deployed independently.

## Content status

Sanity documents are unpublished by default until they are published in the Studio. The Astro integration in the website will query the published dataset in the next phase.
