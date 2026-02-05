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
      part: ['snippet'],
      maxResults: 50,
      playlistId: PLAYLIST_ID,
      pageToken: nextPageToken,
    });
    items = items.concat(res.data.items);
    nextPageToken = res.data.nextPageToken;
  } while (nextPageToken);
  return items;
}

function parseTitle(title) {
  // Example: "The Valley of Dry Bones - Dr. Ricky Mullins"
  const [sermonTitle, speaker] = title.split(' - ');
  return { sermonTitle: sermonTitle?.trim() || '', speaker: speaker?.trim() || '' };
}

function createMarkdown({ sermonTitle, speaker, date, videoId }) {
  return `---
title: "${sermonTitle}"
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
  for (const item of items) {
    const { title, publishedAt, resourceId } = item.snippet;
    const { sermonTitle, speaker } = parseTitle(title);
    const videoId = resourceId.videoId;
    const date = publishedAt.split('T')[0];
    const filename = `${sermonTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')}.md`;
    const markdown = createMarkdown({ sermonTitle, speaker, date, videoId });
    fs.writeFileSync(path.join(OUTPUT_DIR, filename), markdown);
    console.log(`Created: ${filename}`);
  }
}

main().catch(console.error);