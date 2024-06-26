export default {
  icon: 'user',
  title: 'Users',
  description: 'List of available users',
  type: 'array',
  items: {
    type: 'object',
    title: 'User',
    description: 'Single user entry',
    properties: {
      id: {
        type: 'integer',
        title: 'Id',
        description: 'User id',
        default: 0,
        href: '#/users/{id}',
        totals: 'count'
      },
      name: {
        type: 'string',
        title: 'Name',
        description: 'User name',
        default: '',
        minLength: 1,
        maxLength: 255
      }, 
      age: {
        type: 'integer',
        title: 'Age (Y)',
        description: 'User age',
        default: 18,
        minimum: 18,
        maximum: 99,
        totals: 'avg'
      }, 
      balance: {
        type: 'number',
        title: 'Balance ($)',
        default: 0,
        minimum: 1000,
        maximum: 4000,
        ui: 'num.2',
        totals: 'sum'
      }
    },
    links: [
      {
        link: 'danger',
        icon: 'trash',
        title: 'Delete',
        href: '#/delete/users/{id}'
      }, {
        link: 'warning',
        icon: 'edit',
        title: 'Edit',
        href: '#/edit/users/{id}'
      }
    ]
  },
  links: [
    {
      link: 'success',
      icon: 'pencil',
      title: 'Insert',
      href: '#/insert/users'
    }, {
      link: 'info',
      icon: 'info-circle',
      title: 'Counter',
      href: '#/counter/users'
    }
  ]
}
