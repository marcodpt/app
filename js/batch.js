export default ({
  service,
  table,
  ids
}, {config, wrap, jsb, back, post}) => {
  const Ids = ids.split(',')
    .map(x => x.trim())
    .filter(x => /^[0-9]+$/.test(x))

  const batch = (config.BATCH || {})[service]
  const n = Ids.length

  if (!Ids.length) {
    throw 'ERROR_BATCH'
  } else if (!batch) {
    throw 'ERROR_FORBIDDEN'
  } else {
    const {
      title,
      request,
      response,
      params
    } = batch

    var e = null
    const req = typeof request == 'function' ? request(Ids.length) : request
    const submit = () => Promise.all(Ids.map(id =>
      post(`api/${service}/${table}/${id}`, params, err => null)
    ))
      .then(data => {
        const success = data.filter(r => r != null).length
        const error = data.filter(r => r == null).length
        const res = typeof response == 'function' ?
          response(success, error) : response

        if (res) {
          const x = wrap(jsb({
            schema: {
              title: title,
              description: res,
              ui: 'card',
              format: error && success ? 'warning' :
                success ? 'success' : 'danger',
              links: [back]
            }
          }))
          if (e) {
            e.replaceWith(x)
          } else {
            return x
          }
        } else {
          history.back()
        }
      })

    if (req) {
      e = wrap(jsb({
        schema: {
          title: title,
          description: req,
          properties: {},
          links: [back]
        },
        options: {
          resolve: submit
        }
      }))

      return e
    } else {
      return submit()
    }
  }
}
