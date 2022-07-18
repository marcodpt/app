import {getIcon, csv} from './lib.js'
import {query} from './dependencies.js'
import config from './config.js'

const getBtn = ui => (ui || '').split('\n')[0]
const mapLink = ({
  ui,
  title,
  href,
  icon,
  ...link
}, sm) => ({
  ...link,
  href: href &&
    href.indexOf('#') < 0 &&
    href.substr(0, 7) != 'http://' &&
    href.substr(0, 8) != 'https://' ?
      `#/${href}` : href,
  title: sm ? '' : title,
  ui: (icon == null ? getBtn(ui) : ui)+(sm ? ' btn-sm' : ''),
  icon: icon == null ? getIcon(ui) : icon
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

  return uri != null ? url :
    urlCmp(url, href) ? '' : `javascript:location.replace('${url}')`
}

const keyBase = key => key.substr(-1) == '_' ?
  key.substr(0, key.length - 1) : key

const keyDual = key => key.substr(-1) != '_' ? key+'_' : key

const keyEq = (a, b) => keyBase(a) == keyBase(b)

const updateSchema = (config, schema, readOnly, X, Ignore, Href) => {
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
    Ignore = Ignore || []
    Href = Href || {}
    R.properties = required.filter(key =>
      (!readOnly || key == 'id' || required.indexOf(keyDual(key)) < 0 || (
        key.substr(-1) == '_' && key != 'id_'
      )) && Ignore.indexOf(keyBase(key)) == -1
    ).reduce((P, key) => {
      const Q = properties[key]
      P[key] = {
        ...Q,
        href: Q.href && readOnly ? `#/${Q.href}` :
          Href[key] != null ? Href[key] : Q.href,
      }
      if (P[key].readOnly && !readOnly) {
        delete P[key].readOnly
      }
      if (!readOnly && P[key].ui == 'file') {
        P[key].type = ["object", "null"]
        P[key].default = null
      }
      if (X != null) {
        const b = keyBase(key)
        const d = keyDual(key)
        const s = d.indexOf('_id_') >= 0 ? d : b
        const Y = {}
        Y[b] = null
        Y[d] = null

        P[key].links = [
          X[b] != null || X[d] != null ? {
            rel: 'alternate',
            icon: config.CLEAR_ICON,
            ui: config.CLEAR_UI,
            href: resolveHref(Y)
          } : X._sort == s ? {
            rel: 'self',
            ui: config.SORT_UI,
            icon: config.SORT_ASC_ICON,
            href: resolveHref({
              _sort: '-'+s
            })
          } : X._sort == ('-'+s) ? {
            rel: 'self',
            ui: config.SORT_UI,
            icon: config.SORT_DESC_ICON,
            href: resolveHref({
              _sort: s
            })
          } : {
            rel: 'self',
            ui: config.SORT_UI,
            icon: config.SORT_ICON,
            href: resolveHref({
              _sort: s
            })
          }
        ]
      }
      return P
    }, {})
  }

  return R
}

const getF = () => {
  const href = window.location.hash
  const H = href.split('?')
  const path = H.shift()
  const Q = query(H.join('?'))
  return Q._filter instanceof Array ? Q._filter : []
}

const Cache = {
  path: null,
  Ids: []
}

const clearCache = () => {
  Cache.path = null
  Cache.Ids = []
}

window.batch = url => {
  url = url+Cache.Ids.join(',')
  clearCache()
  window.location.href = url
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
  const params = query(Object.keys(Q).reduce((P, key) => {
    if (key.substr(0, 1) != '_') {
      P[key] = Q[key]
    }
    return P
  }, {}))
  const url = path+(q ? `?${q}` : '')

  const Route = (config.ROUTES || {})[table] || {}
  const Links = (Route.links || []).map(l => {
    if (l.href.substr(0, 1) == '#' && params) {
      return {
        ...l,
        href: l.href+(l.href.indexOf('?') >= 0 ? '&' : '?')+params
      }
    } else {
      return l
    }
  })
  const Globals = Links.filter(l => l.href.indexOf('{') == -1)
  const Locals = Links.filter(l => l.href.indexOf('{') != -1)
  const Ignore = (Route.ignore || []).map(key => keyBase(key))
  const Href = (Route.href || {})
  const Hide = (Route.hide || [])
  const isHidden = link => Hide.reduce(
    (pass, test) => pass && link.href.indexOf(test) < 0
  , true)

  if (service != 'get') {
    clearCache()
    var res = null
    return get(`response/${url}`).then(response => {
      res = response

      return get(`request/${url}`)
    }).then(schema => {
      if (!schema) {
        throw 'ERROR_FORBIDDEN'
      }

      const L = (schema.links || [])[0]
      const url = (L || {}).href

      const submit = !url ? null : (data, e) => {
        const Files = {}
        Object.keys(data).forEach(key => {
          if (
            key.substr(0, 8) == 'files_id' &&
            data[key] != null && typeof data[key] == 'object'
          ) {
            Files[key] = data[key]
            data[key] = 0

            var name = Files[key].name
            name = name || 'file'
            name = name.replace(/[^a-zA-Z~_0-9\-\.]/g, c => '')
            if (!/^[a-zA-Z]$/.test(name.substr(0, 1))) {
              name = 'file_'+name
            }
            const N = name.split(".")
            N[0] += '_'+Math.random().toString(36).substr(2, 9)
            Files[key].name = N.join(".")
          }
        })

        return post(url, data).then(rowid => {
          return Promise.all(Object.keys(Files).map(key => 
            post('api/files', Files[key])
              .then(fid => {
                const F = {}
                F[key] = fid
                return post(`api/put/${table}/${rowid}`, F)
              })
          )).catch(err => {
            console.log('UPLOAD ERROR!')
            console.log(err)
          })
        }).then(() => {
          const isLogout = service == 'logout'
          const isLogin = service == 'login' || service == 'switch'
          const target = isLogin && config.HOME != null ? config.HOME : '#'
          if (res && res.description) {
            const x = wrap(jsb({
              schema: {
                ...res,
                ui: 'card',
                format: 'success',
                links: [{
                  ...back,
                  href: isLogin || isLogout ? target : back.href
                }]
              }
            }))
            if (e) {
              e.replaceWith(x)
            } else {
              return x
            }
          } else if (!isLogin) {
            history.back()
          } else {
            window.location.href = target
          }
        })
      }

      schema = {
        ...updateSchema(config, schema, false, Q, [], Href),
        links: [back],
        ui: url ? schema.ui : 'card',
        format: url ? schema.format : 'danger'
      }

      if (
        !schema.description && submit &&
        Object.keys(schema.properties || {}).length == 0
      ) {
        return submit({})
      } else {
        return wrap(jsb({
          schema: schema,
          options: {
            showValid: true,
            resolve: submit 
          }
        }))
      }
    })
  } else if (id != null) {
    clearCache()
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
      schema.links = [back]
        .concat(schema.links || [])
        .concat(Locals)
        .filter(isHidden)
      return wrap(jsb({schema: schema}))
    })
  } else {
    const p = path+'?'+params
    if (p != Cache.path) {
      clearCache()
      Cache.path = p
    }
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

    if (Q._filter instanceof Array) {
      const F = Q._filter.filter(f => f != '_~ct~').reduce((F, f) => {
        if (F.indexOf(f) == -1) {
          F.push(f)
        }
        return F
      }, [])

      const target = `#/${resolveHref({
        _filter: F
      }, url)}`

      if (!urlCmp(target, window.location.hash)) {
        location.replace(target)
        return null
      }
    }

    const Filters = []
    var Ops = null

    return get('api/operators')
      .then(operators => {
        Ops = operators
        return Promise.all((Q._filter || [])
          .filter(x => x.indexOf('_~ct~') != 0)
          .map(x => {
            var url = null
            operators.forEach(op => {
              if (url == null && x.indexOf(op.name) > 0) {
                const X = x.split(op.name)
                const field = X.shift()
                const value = X.join(op.name)
                url = op.booleans_id_strict == 0 || field != keyBase(field) ?
                  null : `${path}?${field}:value,${keyDual(field)}:label`
                Filters.push({
                  title: field,
                  field: field,
                  op: op,
                  value: value,
                  url: url,
                  label: null,
                  base: x
                })
              }
            })
            return url
          })
          .reduce((X, url) => {
            if (url != null && X.indexOf(url) == -1) {
              X.push(url)
            }
            return X
          }, [])
          .map(url => get(url).then(data => [url, data])))
      })
      .then(filters => {
        filters.forEach(([url, data]) => {
          Filters.forEach(F => {
            if (F.url == url) {
              data.forEach(({value, label}) => {
                if (F.label == null && F.value == value) {
                  F.label = label
                } 
              })
            }
          })
        })

        return get(`response/${url}`)
      })
      .then(res => {
        const Batch = Object.keys(config.BATCH || {})
        schema = res
        if (!schema || !schema.items) {
          throw 'ERROR_FORBIDDEN'
        }
        schema.items = updateSchema(config, {
          ...schema.items,
          links: (schema.items.links || [])
            .map(l => {
              if (l.href.substr(0, 4) == 'api/') {
                const L = l.href.split('/')
                if (L.length == 4 && Batch.indexOf(L[1]) != -1) {
                  l.links = [{
                    rel: 'self',
                    href: `javascript:batch('#/batch/${L[1]}/${L[2]}/')`
                  }]
                }
              }

              return l
            })
            .filter(isHidden)
            .concat(Q._group != null ? [] : Locals)
        }, true, Q, Ignore)
        const P = schema.items.properties
        Filters.forEach(f => {
          const Q = P[keyBase(f.field)] || P[keyDual(f.field)]
          if (Q && Q.title) {
            f.title = Q.title
          }
        })
        if (schema.links) {
          schema.links = [back]
            .concat(schema.links.concat(Globals)
              .map(l => mapLink(l))
              .filter(isHidden)
            )
            .concat([{
              rel: 'search',
              href: resolveHref({
                _filter: (Q._filter || []).filter(x => x.indexOf('_~ct~') != 0) 
              }),
              ui: config.BACK_UI,
              icon: config.CLEAR_ICON
            }])
            .concat([{
              rel: 'search',
              href: resolveHref({
                _filter: (Q._filter || [])
                  .filter(x => x.indexOf('_~ct~') != 0) 
                  .concat('_~ct~__search__')
              }).replace('__search__', '{}'),
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
              icon: config.FILTER_ICON,
              href: resolveHref({
                _filter: (Q._filter || []).concat('__field____op____value__')
              })
                .replace('__field__', '{field}')
                .replace('__op__', '{operator}')
                .replace('__value__', '{value}'),
              hrefSchema: {
                properties: {
                  field: {
                    title: 'Campo',
                    enum: Object.keys(P).map(key => keyBase(key)),
                    labels: Object.keys(P).map(key => {
                      const Q = P[key]
                      return Q.title == null ? key : Q.title
                    })
                  },
                  operator: {
                    title: 'Operador',
                    enum: Ops.map(op => op.name),
                    labels: Ops.map(op => op.title),
                    default: '~eq~'
                  },
                  value: {
                    title: 'Valor',
                    href: `${
                      path
                    }?_keys={field}:value,{field}_:label***{operator}`
                  }
                },
                required: ['field', 'operator', 'value']
              },
              links: Filters.map(f => ({
                rel: 'self',
                ui: config.CLEAR_UI,
                icon: config.CLEAR_ICON,
                title: `${f.title} ${f.op.title} ${
                  f.label == null ? f.value : f.label
                }`,
                href: resolveHref({
                  _filter: (Q._filter || []).filter(x => x != f.base)
                })
              }))
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
                  enum: Object.keys(P),
                  labels: Object.keys(P).map(key => {
                    const Q = P[key]
                    return Q.title == null ? key : Q.title
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

        return get(resolveHref({
          _keys: '*',
          _skip: null,
          _limit: null,
          _sort: null
        }, url))
      })
      .then(n => {
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

          if (setSkip(page) != Q._skip) {
            location.replace(resolveHref({
              _skip: setSkip(page)
            }), window.location.hash)
          }

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
        schema.default = data.map(row => {
          row.checked = Cache.Ids.indexOf(row.id) >= 0
          return row
        })
        const e = jsb({
          schema: schema,
          options: {
            watch: Q._group != null ? null : row => {
              if (row) {
                const i = Cache.Ids.indexOf(row.id)
                if (i < 0) {
                  Cache.Ids.push(row.id)
                } else {
                  Cache.Ids.splice(i, 1)
                }
              } else {
                return get(resolveHref({
                  _group: '',
                  _skip: null,
                  _limit: null,
                  _sort: null,
                  _filter: (Q._filter || [])
                    .concat(Cache.Ids.length ? [
                      'id~eq~'+Cache.Ids.join(',')
                    ] : [])
                }, url)).then(rows => {
                  const data = rows && rows[0] && typeof rows[0] == 'object' ?
                    rows[0] : {}
                  data.checked = Cache.Ids.length
                  return data
                })
              }
            }
          }
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
