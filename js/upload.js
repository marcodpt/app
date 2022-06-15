export default (params, {get, post, wrap, jsb, back}) => wrap(jsb({
  schema: {
    title: 'Upload de arquivos',
    properties: {
      files: {
        title: '',
        type: 'array',
        ui: 'file',
        minItems: 1,
        default: []
      }
    },
    links: [back]
  },
  options: {
    resolve: ({files}, e) => Promise.all(files.map(file => {
      e.classList.add('mb-5')
      var status = ''
      return get('api/files?id_='+encodeURIComponent(file.name))
        .then(data => {
          if (data && data.length) {
            status = 'ATUALIZADO!'
            return post('api/put/files/'+data[0].id, file, err => {
              throw err
            })
          } else {
            status = 'INSERIDO!'
            return post('api/post/files', file, err => {
              throw err
            })
          }
        })
        .then(() => {
          e.after(jsb({
            schema: {
              ui: 'success',
              description: file.name+': '+status
            }
          }))
        })
        .catch(() => {
          e.after(jsb({
            schema: {
              ui: 'danger',
              description: file.name+': ERRO!'
            }
          }))
        })
    })).then(() => null)
  }
}))
