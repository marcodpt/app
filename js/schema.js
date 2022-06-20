import {getIcon, csv} from './lib.js'
import {query} from './dependencies.js'
import config from './config.js'

const getBtn = ui => (ui || '').split('\n')[0]
const mapLink = ({
  ui,
  title,
  href,
  ...link
}, sm) => ({
  ...link,
  href: href ? `#/${href}` : href,
  title: sm ? '' : title,
  ui: getBtn(ui)+(sm ? ' btn-sm' : ''),
  icon: getIcon(ui)
}) 

const urlCmp = (a, b) => decodeURIComponent(a) == decodeURIComponent(b)

const resolveHref = (X, uri) => {
  const href = typeof uri != "string" ? window.location.hash : uri
  const H = href.split('?')
  const path = H.shift()
  const q = query({
    ...query(H.join('?')),
    ...X
  })

  const url = path+(q ? `?${q}` : '')

  if (uri === true) {
    if (!urlCmp(href, url)) {
      location.replace(url)
    }
  } else {
    return uri != null ? url :
      urlCmp(url, href) ? '' : `javascript:location.replace('${url}')`
  }
}

const keyBase = key => key.substr(-1) == '_' ?
  key.substr(0, key.length - 1) : key

const keyDual = key => key.substr(-1) != '_' ? key+'_' : key

const keyEq = (a, b) => keyBase(a) == keyBase(b)

const updateSchema = (config, schema, readOnly, X) => {
  if (!schema) {
    return
  }

  const {
    required,
    properties,
    links
  } = schema

  const R = {...schema}

  if (links) {
    R.links = R.links.map(l => mapLink(l, readOnly && X != null))
  }
  
  if (required && properties) {
    R.properties = required.filter(key =>
      !readOnly || key == 'id' || (key.substr(-1) == '_' && key != 'id_')
    ).reduce((P, key) => {
      const Q = properties[key]
      P[key] = {
        ...Q,
        href: Q.href && readOnly ? `#/${Q.href}` : Q.href
      }
      if (X != null) {
        const b = keyBase(key)
        const d = keyDual(key)
        const Y = {}
        Y[b] = null
        Y[d] = null

        P[key].links = [
          X[b] != null || X[d] != null ? {
            rel: 'alternate',
            icon: config.CLEAR_ICON,
            ui: config.CLEAR_UI,
            href: resolveHref(Y)
          } : X._sort == b ? {
            rel: 'self',
            ui: config.SORT_UI,
            icon: config.SORT_ASC_ICON,
            href: resolveHref({
              _sort: '-'+b
            })
          } : X._sort == ('-'+b) ? {
            rel: 'self',
            ui: config.SORT_UI,
            icon: config.SORT_DESC_ICON,
            href: resolveHref({
              _sort: b
            })
          } : {
            rel: 'self',
            ui: config.SORT_UI,
            icon: config.SORT_ICON,
            href: resolveHref({
              _sort: b
            })
          }
        ]
      }
      return P
    }, {})
  }

  return R
}

const cache = {
  operators: null,
  aggregate: {
    url: null,
    data: null
  },
  count: {
    url: null,
    data: null
  }
}

const getF = () => {
  const href = window.location.hash
  const H = href.split('?')
  const path = H.shift()
  const Q = query(H.join('?'))
  return Q._filter instanceof Array ? Q._filter : []
}

window.addFilter = f => {
  const F = getF()
  if (F.indexOf(f) < 0) {
    F.push(f)
    resolveHref({
      _filter: F
    }, true)
  }
}

window.removeFilter = f => {
  const F = getF()
  const i = F.indexOf(f)
  if (i >= 0) {
    F.splice(i, 1)
    resolveHref({
      _filter: F
    }, true)
  }
}

window.setSearch = s => {
  const F = getF()
    .filter(x => x.indexOf('_~ct~') != 0)

  if (s) {
    F.push(`_~ct~${s}`)
  }

  resolveHref({
    _filter: F
  }, true)
}

export default ({
  service,
  table,
  id
}, {
  jsb,
  get,
  post,
  wrap,
  back,
  config,
  ...extra
}) => {
  const path = `api/${service}/${table}`+(id != null ? `/${id}` : '')
  const q = extra.query
  const Q = query(q)
  const url = path+(q ? `?${q}` : '')

  if (service != 'get') {
    cache.aggregate.url = null
    cache.count.url = null
    var res = null
    return get(`response/${path}`).then(response => {
      res = response

      return get(`request/${path}`)
    }).then(schema => {
      if (!schema) {
        throw 'ERROR_FORBIDDEN'
      }

      const L = (schema.links || [])[0]
      const url = (L || {}).href
      var block = true
      setTimeout(() => {
        block = false
      }, 500)

      return wrap(jsb({
        schema: {
          ...updateSchema(config, schema, false, Q),
          links: [back],
          ui: url ? schema.ui : 'card',
          format: url ? schema.format : 'danger'
        },
        options: {
          showValid: true,
          resolve: !url ? null : (data, e) => block ? '' :
            post(url, data).then(() => {
              const isLogin = /^(login|logout|switch)$/.test(service)
              if (res && res.description) {
                e.replaceWith(wrap(jsb({
                  schema: {
                    ...res,
                    ui: 'card',
                    format: 'success',
                    links: [{
                      ...back,
                      href: isLogin ? '#' : back.href
                    }]
                  }
                })))
              } else if (!isLogin) {
                history.back()
              } else {
                window.location.href = '#'
              }
            })
        }
      }))
    })
  } else if (id != null) {
    cache.aggregate.url = null
    cache.count.url = null
    var schema = null
    return get(`response/${path}`).then(res => {
      if (!res) {
        throw 'ERROR_FORBIDDEN'
      }
      schema = res
      return schema ? get(path) : null
    }).then(data => {
      if (!data) {
        throw 'ERROR_FORBIDDEN'
      }
      schema = {
        ...schema,
        default: data
      }
      schema = updateSchema(config, schema, true)
      schema.links = [back].concat(schema.links || [])
      return wrap(jsb({schema: schema}))
    })
  } else {
    var schema = null

    const fix = Object.keys(config.QUERY || {}).reduce((X, key) => {
      if (Q[key] == null) {
        X[key] = config.QUERY[key]
      }
      return X
    }, {})

    if (Object.keys(fix).length > 0) {
      location.replace(`#/${resolveHref(fix, url)}`)
      return null
    }

    return Promise.resolve(cache.operators != null ? cache.operators :
      get('api/operators?_keys=id,name,title,booleans_id_strict:strict')
    )
      .then(operators => {
        cache.operators = operators 

        return get(`response/${url}`)
      })
      .then(res => {
        schema = res
        if (!schema || !schema.items) {
          throw 'ERROR_FORBIDDEN'
        }
        schema.items = updateSchema(config, schema.items, true, Q)
        if (schema.links) {
          schema.links = [back]
            .concat(schema.links.map(l => mapLink(l)))
            .concat([{
              rel: 'search',
              href: "javascript:setSearch('')",
              ui: config.BACK_UI,
              icon: config.CLEAR_ICON
            }])
            .concat([{
              rel: 'search',
              href: "javascript:setSearch('{}')",
              hrefSchema: {
                title: 'search',
                description: config.SEARCH_LABEL,
                default: (Q._filter || [])
                  .filter(x => x.indexOf('_~ct~') == 0)
                  .map(x => x.substr(5))
                  .reduce((s, x) => s || x, '')
              }
            }])
            .concat([{
              rel: 'search',
              title: config.FILTER_LABEL,
              ui: config.FILTER_UI,
              icon: config.FILTER_ICON
            }])
            .concat([{
              rel: 'search',
              title: config.GROUP_LABEL,
              ui: config.GROUP_UI,
              icon: Q._group != null ? config.CLEAR_ICON : config.GROUP_ICON,
              href: resolveHref({
                _group: Q._group == null ? '__group__' : null
              }).replace('__group__', '{}'),
              hrefSchema: Q._group != null ? null : {
                ui: 'multiple',
                default: [],
                minItems: 1,
                items: {
                  enum: Object.keys(schema.items.properties),
                  labels: Object.keys(schema.items.properties).map(key => {
                    const P = schema.items.properties[key]
                    return P.title == null ? key : P.title
                  })
                }
              }
            }])
            .concat([{
              rel: 'search',
              title: config.CSV_LABEL,
              ui: config.CSV_UI,
              icon: config.CSV_ICON,
              href: csv(config,
                schema.items.properties, 'a.csv', `${table}.csv`,
                resolveHref({
                  _skip: null,
                  _limit: null
                }, window.location.hash.substr(2))
              )
            }])
        }

        const target = resolveHref({
          _group: '',
          _skip: null,
          _limit: null,
          _sort: null
        }, url)
        if (urlCmp(cache.aggregate.url, target)) {
          return cache.aggregate.data
        } else {
          cache.aggregate.url = target
          cache.aggregate.data = false
          return get(target)
        }
      })
      .then(row => {
        if (row && row[0]) {
          if (cache.aggregate.data === false) {
            cache.aggregate.data = row
          }
          schema.items.default = row[0]

          const target = resolveHref({
            _keys: '*',
            _skip: null,
            _limit: null,
            _sort: null
          }, url)
          if (urlCmp(cache.count.url, target)) {
            return cache.count.data
          } else {
            cache.count.url = target
            cache.count.data = false
            return get(target)
          }
        }
      })
      .then(n => {
        if (cache.count.data === false) {
          cache.count.data = n
        }
        const skip = parseInt(Q._skip) || 0
        const limit = parseInt(Q._limit) || 0

        if (limit) {
          const pages = n == 0 ? 1 : Math.ceil(n / limit)
          const setPage = page => {
            if (page > pages) {
              page = pages
            } else if (page < 1) {
              page = 1
            }
            return page
          }
          const page = setPage(1 + Math.floor(skip / limit))
          const setSkip = page => String((page - 1) * limit)
          const A = Array.from(Array(pages).keys()).map(x => parseInt(x) + 1)

          schema.links = schema.links.concat([
            {
              rel: 'alternate',
              ui: config.PAGINATION_UI,
              icon: config.FIRST_ICON,
              href: resolveHref({
                _skip: setSkip(setPage(1))
              })
            }, {
              rel: 'alternate',
              ui: config.PAGINATION_UI,
              icon: config.PREVIOUS_ICON,
              href: resolveHref({
                _skip: setSkip(setPage(page - 1))
              })
            }, {
              rel: 'alternate',
              href: resolveHref({
                _skip: '__skip__'
              }).replace('__skip__', '{}'),
              hrefSchema: {
                enum: A.map(setSkip),
                labels: A.map(x => config.PAGINATION_LABEL(x, pages)),
                default: setSkip(page)
              }
            }, {
              rel: 'alternate',
              ui: config.PAGINATION_UI,
              icon: config.NEXT_ICON,
              href: resolveHref({
                _skip: setSkip(setPage(page + 1))
              })
            }, {
              rel: 'alternate',
              ui: config.PAGINATION_UI,
              icon: config.LAST_ICON,
              href: resolveHref({
                _skip: setSkip(setPage(pages))
              })
            }
          ])
        }
        return get(url)
      })
      .then(data => {
        schema.default = data
        const e = jsb({
          schema: schema
        })

        const s = e.querySelector('[name=search]')
        if (s) {
          setTimeout(() => {
            s.focus()
            s.selectionStart = s.selectionEnd = 10000
          }, 100)
        }

        return e
      })
  }
}
