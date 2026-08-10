import {defineType, defineField} from 'sanity'

export default defineType({
  name: 'announcement',
  title: 'Announcement',
  type: 'document',
  fields: [
    defineField({name: 'title', title: 'Title', type: 'string', validation: Rule => Rule.required()}),
    defineField({name: 'slug', title: 'Slug', type: 'slug', options: {source: 'title', maxLength: 96}, validation: Rule => Rule.required()}),
    defineField({name: 'publishedAt', title: 'Publish date', type: 'datetime', validation: Rule => Rule.required()}),
    defineField({name: 'expiresAt', title: 'Expiration date', type: 'datetime'}),
    defineField({name: 'summary', title: 'Summary', type: 'text', rows: 3, validation: Rule => Rule.required()}),
    defineField({name: 'image', title: 'Image', type: 'image', options: {hotspot: true}}),
    defineField({name: 'link', title: 'Link', type: 'url'}),
    defineField({name: 'body', title: 'Content', type: 'array', of: [{type: 'block'}]}),
    defineField({name: 'featured', title: 'Featured', type: 'boolean', initialValue: false}),
  ],
  preview: {select: {title: 'title', subtitle: 'publishedAt', media: 'image'}},
})
