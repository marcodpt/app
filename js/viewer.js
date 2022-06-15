export default ({
  jsb, wrap, get, back
}) => ({name}) => get('api/files?id_='+name)
  .then(data => {
    if (!data[0]) {
      throw 'ERROR_NOT_FOUND'
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
