import {
  jsb, graph, query, spa, html, chart, interfaces
} from './js/dependencies.js'
import {wrap, post, get} from './js/lib.js'
import cnf from './js/config.js'
import lang from './lang/index.js'
import schema from './js/schema.js'
import batch from './js/batch.js'
import grapher from './js/graph.js'
import upload from './js/upload.js'
import viewer from './js/viewer.js'
import nav from './js/navbar.js'

var config = {
  ...cnf,
  ...lang.en,
  routes: [
    {
      path: '/api/:service/:table',
      view: schema
    }, {
      path: '/api/:service/:table/:id',
      view: schema
    }, {
      path: '/batch/:service/:table/:ids',
      view: batch
    }, {
      path: '/graph/:id',
      view: grapher
    }, {
      path: '/:name',
      view: viewer
    }, {
      path: '/upload/files',
      view: upload
    }
  ]
}

const navbar = (cnf) => {
  config.navbar = cnf
}

const route = (path, view) => {
  config.routes.push({
    path: path,
    view: view
  })
}

const start = ({
  LANGUAGE,
  ...cnf
}) => {
  if (LANGUAGE && lang[LANGUAGE]) {
    config = {
      ...config,
      ...lang[LANGUAGE],
      LANGUAGE: LANGUAGE
    }
  }
  config = {
    ...config,
    ...cnf
  }

  const getUrl = () => location.hash.substr(1)
  const getPath = () => getUrl().split('?')[0]
  var update = () => {}
  const navbar = (cnf) => {
    if (config.navbar || cnf) {
      nav({
        ...(config.navbar || {}),
        ...(cnf || {})
      })
    }
  }

  const back = {
    rel: 'self',
    href: 'javascript:history.back()',
    title: config.BACK_LABEL,
    ui: config.BACK_UI,
    icon: config.BACK_ICON
  }

  const Cache = {
    '@interfaces': interfaces
  }
  const clearCache = () => {
    Object.keys(Cache).forEach(k => {
      if (k.substr(0, 1) != '@') {
        delete Cache[k]
      }
    })
  }
  const getter = url => {
    const U = url.split('***')
    const O = Cache['api/operators']
    if (U.length == 2) {
      if (O && O.reduce(
        (x, o) => x || (U[1] == o.name && o.booleans_id_strict == 1)
      , false)) {
        url = U[0]
      } else {
        return true
      }
    }
    const k = decodeURIComponent(url)
    const copy = X => JSON.parse(JSON.stringify(X))

    if (Cache[k] !== undefined) {
      return Promise.resolve(copy(Cache[k]))
    } else {
      return get(url).then(data => {
        Cache[k] = copy(data)
        return data
      })
    }
  }
  const postter = post(navbar)

  const Deps = {
    config: config,
    wrap: wrap,
    get: getter,
    post: (url, Params, err) => {
      clearCache()
      return postter(url, Params, err)
    },
    back: back,
    html: html,
    graph: graph,
    chart: chart,
    jsb: (attrs) => {
      if (attrs.options == null) {
        attrs.options = {}
      }
      if (attrs.options.language == null) {
        attrs.options.language = config.LANGUAGE
      }
      if (attrs.options.loader == null) {
        attrs.options.loader = getter
      }
      return jsb(attrs)
    }
  }

  var path = getPath()
  window.addEventListener('hashchange', () => {
    if (path != getPath()) {
      clearCache()
      path = getPath()
    }
    update(getUrl())
  })

  window.addEventListener('load', () => {
    navbar()
    const home = document.getElementById('app')
    home.replaceWith(spa({
      url: getUrl(),
      routes: config.routes.concat([
        {
          path: '*',
          view: () => home.cloneNode(true)
        }
      ]).map(R => ({
        path: R.path,
        view: (params, extra) =>
          Promise.resolve().then(() => R.view(params, {
            ...Deps,
            ...extra
          })).catch(err => {
            var msg = err && typeof err == "object" ?
              config.ERROR_CONNECTION :
              config.ERROR_INTERNAL_SERVER_ERROR

            if (
              typeof err == "string" &&
              err.substr(0, 6) == "ERROR_" &&
              config[err]
            ) {
              msg = config[err]
              if (err == 'ERROR_UNAUTHORIZED') {
                navbar()
              }
            }
            console.log(err)
            return wrap(jsb({
              schema: {
                title: config.ERROR_TITLE,
                description: msg,
                ui: 'card',
                format: 'danger',
                links: [{
                  ...back,
                  href: err == 'ERROR_UNAUTHORIZED' ? '#/api/login/users'+(
                    window.location.hash == '#/api/login/users' ? '?' : ''
                  ) : back.href
                }]
              }
            }))
          })
      })),
      update: callback => {
        update = callback
      }
    }))
  })
}

export {navbar, route, start}
