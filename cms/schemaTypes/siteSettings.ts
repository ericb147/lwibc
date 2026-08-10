import {defineType, defineField} from 'sanity'

export default defineType({
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  fields: [
    defineField({name: 'churchName', title: 'Church name', type: 'string', validation: Rule => Rule.required()}),
    defineField({name: 'address', title: 'Full address', type: 'string', validation: Rule => Rule.required()}),
    defineField({name: 'streetAddress', title: 'Street address', type: 'string', validation: Rule => Rule.required()}),
    defineField({name: 'city', title: 'City', type: 'string', validation: Rule => Rule.required()}),
    defineField({name: 'state', title: 'State', type: 'string', validation: Rule => Rule.required()}),
    defineField({name: 'postalCode', title: 'Postal code', type: 'string', validation: Rule => Rule.required()}),
    defineField({name: 'mailingAddress', title: 'Mailing address', type: 'string'}),
    defineField({name: 'email', title: 'Email', type: 'email', validation: Rule => Rule.required()}),
    defineField({name: 'phone', title: 'Phone', type: 'string'}),
    defineField({
      name: 'serviceTimes',
      title: 'Service times',
      type: 'array',
      of: [{type: 'object', fields: [
        defineField({name: 'name', title: 'Name', type: 'string', validation: Rule => Rule.required()}),
        defineField({name: 'day', title: 'Day', type: 'string', validation: Rule => Rule.required()}),
        defineField({name: 'time', title: 'Time', type: 'string', validation: Rule => Rule.required()}),
      ]}],
    }),
    defineField({name: 'youtubeUrl', title: 'YouTube URL', type: 'url'}),
    defineField({name: 'flocknoteUrl', title: 'Flocknote URL', type: 'url'}),
    defineField({name: 'facebookUrl', title: 'Facebook URL', type: 'url'}),
    defineField({name: 'givingUrl', title: 'Giving URL', type: 'url'}),
    defineField({name: 'defaultSeoTitle', title: 'Default SEO title', type: 'string'}),
    defineField({name: 'defaultSeoDescription', title: 'Default SEO description', type: 'text', rows: 3}),
  ],
})
