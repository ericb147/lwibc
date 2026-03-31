// Requires: npm install googleapis fs path
const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');
require('dotenv').config();
const API_KEY = process.env.YOUTUBE_API_KEY;

const PLAYLIST_ID = 'PL_6oKzlkAXCgQY4DNsIpM-ai1X_y5s8-A';
const TAG = 'sunday morning';
const OUTPUT_DIR = './src/content/sermons';

const youtube = google.youtube({ version: 'v3', auth: API_KEY });

async function fetchPlaylistItems() {
  let items = [];
  let nextPageToken = '';
  do {
    const res = await youtube.playlistItems.list({
      part: ['snippet', 'contentDetails'],
      maxResults: 50,
      playlistId: PLAYLIST_ID,
      pageToken: nextPageToken,
    });
    items = items.concat(res.data.items);
    nextPageToken = res.data.nextPageToken;
  } while (nextPageToken);

  return items;
}

async function fetchPublicVideoIds(videoIds) {
  let publicIds = [];
  for (let i = 0; i < videoIds.length; i += 50) {
    const batchIds = videoIds.slice(i, i + 50);
    const res = await youtube.videos.list({
      part: ['status'],
      id: batchIds,
    });
    publicIds = publicIds.concat(
      res.data.items
        .filter(v => v.status.privacyStatus === 'public')
        .map(v => v.id)
    );
  }
  return publicIds;
}

function parseTitle(title) {
  // Example: "The Valley of Dry Bones - Dr. Ricky Mullins"
  const [sermonTitle, speaker] = title.split(' - ');
  return { sermonTitle: sermonTitle?.trim() || '', speaker: speaker?.trim() || '' };
}

function getFilenameBase(sermonTitle) {
  return sermonTitle
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function createMarkdown({ sermonTitle, speaker, date, videoId }) {
  const cleanTitle = sermonTitle.replace(/^"+|"+$/g, '').replace(/^'+|'+$/g, '');
  return `---
title: "${cleanTitle}"
date: ${date}
speaker: "${speaker}"
series: "Sunday Morning"
videoUrl: "https://www.youtube.com/embed/${videoId}"
tags: ["${TAG}"]
draft: false
---
`;
}

async function main() {
  const items = await fetchPlaylistItems();
  // Get list of already generated files (without extension)
  const existingFiles = new Set(
    fs.readdirSync(OUTPUT_DIR)
      .filter(f => f.endsWith('.md'))
      .map(f => f.replace(/\.md$/, ''))
  );

  const newItems = items.map(item => {
    const { title } = item.snippet;
    const { sermonTitle } = parseTitle(title);
    const filenameBase = getFilenameBase(sermonTitle);
    return { item, filenameBase };
  }).filter(({ filenameBase }) => !existingFiles.has(filenameBase));

  if (newItems.length === 0) {
    console.log('No new playlist items to process.');
    return;
  }

  const videoIdsToCheck = newItems.map(({ item }) => item.contentDetails.videoId).filter(Boolean);
  const publicVideoIds = new Set(await fetchPublicVideoIds(videoIdsToCheck));

  for (const { item, filenameBase } of newItems) {
    const { title, publishedAt, resourceId } = item.snippet;
    const { sermonTitle, speaker } = parseTitle(title);
    const videoId = resourceId.videoId;
    if (!publicVideoIds.has(videoId)) {
      console.log(`Skipping (not public): ${filenameBase}.md`);
      continue;
    }

    const date = publishedAt.split('T')[0];
    const markdown = createMarkdown({ sermonTitle, speaker, date, videoId });
    fs.writeFileSync(path.join(OUTPUT_DIR, filenameBase + '.md'), markdown);
    console.log(`Created: ${filenameBase}.md`);
  }
}

main().catch(console.error);