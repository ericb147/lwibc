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

  // Get video IDs for all items
  const videoIds = items.map(item => item.contentDetails.videoId).filter(Boolean);
  // Fetch video details in batches of 50
  let publicVideos = [];
  for (let i = 0; i < videoIds.length; i += 50) {
    const batchIds = videoIds.slice(i, i + 50);
    const res = await youtube.videos.list({
      part: ['status'],
      id: batchIds,
    });
    const publicIds = res.data.items.filter(v => v.status.privacyStatus === 'public').map(v => v.id);
    publicVideos = publicVideos.concat(publicIds);
  }
  // Only return playlist items that are public
  return items.filter(item => publicVideos.includes(item.contentDetails.videoId));
}

function parseTitle(title) {
  // Example: "The Valley of Dry Bones - Dr. Ricky Mullins"
  const [sermonTitle, speaker] = title.split(' - ');
  return { sermonTitle: sermonTitle?.trim() || '', speaker: speaker?.trim() || '' };
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
  for (const item of items) {
    const { title, publishedAt, resourceId } = item.snippet;
    const { sermonTitle, speaker } = parseTitle(title);
    const videoId = resourceId.videoId;
    const date = publishedAt.split('T')[0];
    const filenameBase = sermonTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    if (existingFiles.has(filenameBase)) {
      console.log(`Skipping (already exists): ${filenameBase}.md`);
      continue;
    }
    const markdown = createMarkdown({ sermonTitle, speaker, date, videoId });
    fs.writeFileSync(path.join(OUTPUT_DIR, filenameBase + '.md'), markdown);
    console.log(`Created: ${filenameBase}.md`);
  }
}

main().catch(console.error);