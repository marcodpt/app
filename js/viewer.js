export default ({name}, {jsb, wrap, get, back}) => get('api/files?name='+name)
  .then(data => {
    if (!data[0]) {
      throw 'ERROR_NOT_FOUND'
    }

    const mime = data[0].mime
    if (
      mime.substr(-1) == '*' &&
      mime.indexOf('audio/') != 0 &&
      mime.indexOf('image/') != 0 &&
      mime.indexOf('video/') != 0
    ) {
      window.open(location.href.replace('#/', ''), '_blank')
      return {
        mime: '',
        data: ''
      }
    }

    return get('api/files/'+data[0].id)
  }).then(({
    data,
    mime
  }) => {
    const R = {
      schema: {
        title: name || '_',
        ui: 'card',
        links: [back]
      }
    }
    R.schema.default = data
    if (mime.substr(-1) == '*') {
      R.schema.contentEncoding = 'base64'
      R.schema.contentMediaType = mime.substr(0, mime.length - 1)
    } else {
      R.schema.contentMediaType = mime
    }
    return wrap(jsb(R))
  })
