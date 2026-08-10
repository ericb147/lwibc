import {defineType, defineField} from 'sanity'

export default defineType({
  name: 'event',
  title: 'Event',
  type: 'document',
  fields: [
    defineField({name: 'title', title: 'Title', type: 'string', validation: Rule => Rule.required()}),
    defineField({name: 'slug', title: 'Slug', type: 'slug', options: {source: 'title', maxLength: 96}, validation: Rule => Rule.required()}),
    defineField({name: 'startDate', title: 'Start date and time', type: 'datetime', validation: Rule => Rule.required()}),
    defineField({name: 'endDate', title: 'End date and time', type: 'datetime'}),
    defineField({name: 'timezone', title: 'Timezone', type: 'string', initialValue: 'America/New_York'}),
    defineField({name: 'displayTime', title: 'Display time override', type: 'string'}),
    defineField({name: 'location', title: 'Location', type: 'string', validation: Rule => Rule.required()}),
    defineField({name: 'address', title: 'Address', type: 'string'}),
    defineField({name: 'image', title: 'Image', type: 'image', options: {hotspot: true}}),
    defineField({name: 'summary', title: 'Summary', type: 'text', rows: 3, validation: Rule => Rule.required()}),
    defineField({name: 'body', title: 'Description', type: 'array', of: [{type: 'block'}]}),
    defineField({name: 'tags', title: 'Tags', type: 'array', of: [{type: 'string'}]}),
    defineField({name: 'registrationLink', title: 'Registration link', type: 'url'}),
    defineField({name: 'registrationRequired', title: 'Registration required', type: 'boolean', initialValue: false}),
    defineField({name: 'price', title: 'Price', type: 'string'}),
    defineField({name: 'featured', title: 'Featured', type: 'boolean', initialValue: false}),
    defineField({name: 'externalId', title: 'External ID', type: 'string'}),
  ],
  preview: {
    select: {title: 'title', date: 'startDate', media: 'image'},
    prepare({title, date, media}) {
      return {title, subtitle: date ? new Date(date).toLocaleDateString() : 'No date', media}
    },
  },
})
