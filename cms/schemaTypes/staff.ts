import {defineType, defineField} from 'sanity'

export default defineType({
  name: 'staff',
  title: 'Staff Member',
  type: 'document',
  fields: [
    defineField({name: 'name', title: 'Name', type: 'string', validation: Rule => Rule.required()}),
    defineField({name: 'slug', title: 'Slug', type: 'slug', options: {source: 'name', maxLength: 96}, validation: Rule => Rule.required()}),
    defineField({name: 'title', title: 'Title', type: 'string', validation: Rule => Rule.required()}),
    defineField({name: 'image', title: 'Photo', type: 'image', options: {hotspot: true}}),
    defineField({name: 'email', title: 'Email', type: 'email'}),
    defineField({name: 'phone', title: 'Phone', type: 'string'}),
    defineField({name: 'bio', title: 'Short bio', type: 'text', rows: 3}),
    defineField({name: 'body', title: 'Full biography', type: 'array', of: [{type: 'block'}]}),
    defineField({name: 'order', title: 'Display order', type: 'number', initialValue: 0}),
    defineField({name: 'featured', title: 'Featured', type: 'boolean', initialValue: false}),
  ],
  preview: {select: {title: 'name', subtitle: 'title', media: 'image'}},
})
