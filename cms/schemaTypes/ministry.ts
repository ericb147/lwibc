import {defineType, defineField} from 'sanity'

export default defineType({
  name: 'ministry',
  title: 'Ministry',
  type: 'document',
  fields: [
    defineField({name: 'name', title: 'Name', type: 'string', validation: Rule => Rule.required()}),
    defineField({name: 'slug', title: 'Slug', type: 'slug', options: {source: 'name', maxLength: 96}, validation: Rule => Rule.required()}),
    defineField({name: 'logo', title: 'Logo', type: 'image', options: {hotspot: true}}),
    defineField({name: 'background', title: 'Background image', type: 'image', options: {hotspot: true}}),
    defineField({name: 'summary', title: 'Summary', type: 'text', rows: 3, validation: Rule => Rule.required()}),
    defineField({name: 'body', title: 'Description', type: 'array', of: [{type: 'block'}]}),
    defineField({name: 'coordinator', title: 'Coordinator', type: 'string'}),
    defineField({name: 'contact', title: 'Contact', type: 'string'}),
    defineField({name: 'schedule', title: 'Schedule', type: 'string'}),
    defineField({name: 'order', title: 'Display order', type: 'number', initialValue: 0}),
    defineField({name: 'featured', title: 'Featured', type: 'boolean', initialValue: false}),
  ],
  preview: {select: {title: 'name', subtitle: 'summary', media: 'logo'}},
})
