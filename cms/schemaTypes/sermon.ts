import {defineType, defineField} from 'sanity'

export default defineType({
  name: 'sermon',
  title: 'Sermon / Message',
  type: 'document',
  fields: [
    defineField({name: 'title', title: 'Title', type: 'string', validation: Rule => Rule.required()}),
    defineField({name: 'slug', title: 'Slug', type: 'slug', options: {source: 'title', maxLength: 96}, validation: Rule => Rule.required()}),
    defineField({name: 'date', title: 'Date', type: 'date', validation: Rule => Rule.required()}),
    defineField({name: 'speaker', title: 'Speaker', type: 'reference', to: [{type: 'staff'}]}),
    defineField({name: 'speakerName', title: 'Speaker name', type: 'string', description: 'Use when the speaker is not in the staff directory.'}),
    defineField({name: 'series', title: 'Series', type: 'reference', to: [{type: 'series'}]}),
    defineField({name: 'scripture', title: 'Scripture', type: 'string'}),
    defineField({name: 'audioUrl', title: 'Audio URL', type: 'url'}),
    defineField({name: 'videoUrl', title: 'Video URL', type: 'url'}),
    defineField({name: 'image', title: 'Thumbnail', type: 'image', options: {hotspot: true}}),
    defineField({name: 'summary', title: 'Summary', type: 'text', rows: 3}),
    defineField({name: 'body', title: 'Notes / transcript', type: 'array', of: [{type: 'block'}]}),
    defineField({name: 'tags', title: 'Tags', type: 'array', of: [{type: 'string'}]}),
    defineField({name: 'externalId', title: 'External ID', type: 'string', description: 'YouTube video ID or another stable provider ID.'}),
    defineField({name: 'contentSource', title: 'Content source', type: 'string', options: {list: ['manual', 'youtube', 'other']}, initialValue: 'manual'}),
  ],
  preview: {
    select: {title: 'title', date: 'date', media: 'image'},
    prepare({title, date, media}) {
      return {title, subtitle: date || 'No date', media}
    },
  },
})
