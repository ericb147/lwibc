const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = path.join(__dirname, 'src', 'content', 'events');

const EVENT_TYPES = {
  mens: {
    filePrefix: 'bible-black-coffee',
    title: 'Bible and Black Coffee',
    time: '7:00 AM',
    location: 'Fellowship Hall',
    address: '7561 Duncan Gap Rd. Wise, VA 24293',
    image: '/uploads/events/bible-black-coffee.png',
    summary: "Gather with us for our monthly Bible and Black Coffee men's meeting.",
    tags: ['mens fellowship', 'Bible study'],
    body:
      'Bible and Black Coffee offers a place for men to get grounded in the Word and build the strength needed to lead their families. Join us for a morning of Bible study, prayer, and black coffee.',
    defaultDate: ({ year, monthIndex }) => getNthWeekdayOfMonth(year, monthIndex, 6, 2),
  },
  womens: {
    filePrefix: 'ladies-fellowship',
    title: "Ladies' Fellowship",
    time: '7:00 PM',
    location: 'Fellowship Hall',
    address: '7561 Duncan Gap Rd. Wise, VA 24293',
    image: '/uploads/events/ladies-fellowship.png',
    summary: "Join us for our monthly Ladies' Fellowship.",
    tags: ['ladies fellowship'],
    body:
      "The Ladies' Fellowship provides a dedicated space for women of all ages to build authentic friendships and strengthen their walk with Christ. Come as you are for a night of Bible study, prayer, and testimony.",
    defaultDate: ({ year, monthIndex }) => getNthWeekdayOfMonth(year, monthIndex, 5, 3),
  },
  wonderful: {
    filePrefix: 'wonderful-wednesdays',
    title: 'Wonderful Wednesdays',
    time: '7:00 PM',
    location: 'Sanctuary',
    address: '7561 Duncan Gap Rd. Wise, VA 24293',
    image: '/uploads/events/wonderful-wednesdays.png',
    summary: 'Join us for our monthly Wednesday night preaching service.',
    tags: ['wonderful wednesdays'],
    body: 'Join us for our monthly Wednesday night preaching service.',
    defaultDate: ({ year, monthIndex }) => getLastWeekdayOfMonth(year, monthIndex, 3),
  },
};

function parseArgs(argv) {
  const args = {};

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token.startsWith('--')) {
      continue;
    }

    const equalsIndex = token.indexOf('=');
    if (equalsIndex !== -1) {
      const key = token.slice(2, equalsIndex);
      args[key] = token.slice(equalsIndex + 1) || true;
      continue;
    }

    const key = token.slice(2);
    const next = argv[index + 1];
    if (next && !next.startsWith('--')) {
      args[key] = next;
      index += 1;
    } else {
      args[key] = true;
    }
  }

  return args;
}

function parseMonthInput(monthValue, yearValue) {
  if (!monthValue) {
    throw new Error('Provide --month as YYYY-MM or --month with --year.');
  }

  if (/^\d{4}-\d{2}$/.test(monthValue)) {
    const [yearText, monthText] = monthValue.split('-');
    return { year: Number(yearText), monthIndex: Number(monthText) - 1 };
  }

  if (yearValue && /^\d{1,2}$/.test(monthValue)) {
    return { year: Number(yearValue), monthIndex: Number(monthValue) - 1 };
  }

  throw new Error('Month must be YYYY-MM or a month number with --year.');
}

function parseDateInput(dateValue) {
  if (!dateValue || !/^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
    throw new Error('Custom dates must use YYYY-MM-DD.');
  }

  return dateValue;
}

function getNthWeekdayOfMonth(year, monthIndex, weekday, occurrence) {
  const date = new Date(Date.UTC(year, monthIndex, 1));
  const firstWeekday = date.getUTCDay();
  const offset = (weekday - firstWeekday + 7) % 7;
  date.setUTCDate(1 + offset + (occurrence - 1) * 7);
  return toDateString(date);
}

function getLastWeekdayOfMonth(year, monthIndex, weekday) {
  const date = new Date(Date.UTC(year, monthIndex + 1, 0));
  const lastWeekday = date.getUTCDay();
  const offset = (lastWeekday - weekday + 7) % 7;
  date.setUTCDate(date.getUTCDate() - offset);
  return toDateString(date);
}

function toDateString(date) {
  return date.toISOString().slice(0, 10);
}

function monthLabel(monthIndex) {
  return [
    'january',
    'february',
    'march',
    'april',
    'may',
    'june',
    'july',
    'august',
    'september',
    'october',
    'november',
    'december',
  ][monthIndex];
}

function buildMarkdown(event, date) {
  const tags = event.tags.map(tag => `"${tag}"`).join(', ');

  return `---
title: "${event.title}"
date: ${date}
endDate: ${date}
time: "${event.time}"
location: "${event.location}"
address: "${event.address}"
image: "${event.image}"
summary: "${event.summary}"
tags: [${tags}]
registrationRequired: false
draft: false
---

## About the Event
${event.body}
`;
}

function resolveModes(rawMode) {
  const mode = (rawMode || 'all').toLowerCase();
  if (mode === 'all') {
    return ['mens', 'womens', 'wonderful'];
  }

  return mode.split(',').map(part => part.trim()).filter(Boolean);
}

function resolveDate(eventKey, event, monthInfo, args) {
  const perEventDate = args[`${eventKey}-date`];
  if (perEventDate) {
    return parseDateInput(perEventDate);
  }

  const date = args.date;
  if (date && args.mode && args.mode.toLowerCase() !== 'all') {
    return parseDateInput(date);
  }

  return event.defaultDate(monthInfo);
}

function buildOutputPath(event, date) {
  const [year, month] = date.split('-');
  return path.join(OUTPUT_DIR, `${event.filePrefix}-${monthLabel(Number(month) - 1)}-${year}.md`);
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const monthInfo = parseMonthInput(args.month, args.year);
  const modes = resolveModes(args.mode || args.event);
  const dryRun = Boolean(args['dry-run'] || args.dryRun);
  const overwrite = Boolean(args.overwrite || args.force);

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  for (const mode of modes) {
    const event = EVENT_TYPES[mode];
    if (!event) {
      throw new Error(`Unknown mode: ${mode}. Use all, mens, womens, or wonderful.`);
    }

    const date = resolveDate(mode, event, monthInfo, args);
    const outputPath = buildOutputPath(event, date);
    const existed = fs.existsSync(outputPath);

    if (dryRun) {
      console.log(`[dry-run] ${path.basename(outputPath)} -> ${date}${existed ? ' (exists)' : ''}`);
      continue;
    }

    if (existed && !overwrite) {
      console.log(`Skipped existing: ${path.basename(outputPath)}`);
      continue;
    }

    fs.writeFileSync(outputPath, buildMarkdown(event, date));
    console.log(`${existed ? 'Updated' : 'Created'}: ${path.basename(outputPath)}`);
  }
}

main();