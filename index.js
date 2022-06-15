import {wrap, post, get} from './lib.js'
import schema from './schema.js'
import {jsb, graph, query, spa} from './dependencies.js'
import viewer from './viewer.js'
import upload from './upload.js'
import nav from './navbar.js'
import config from './config.js'
import lang from './lang/index.js'

const Config = {
  ...config,
  ...lang.en,
  routes: [
    {
      path: '/api/:service/:table',
      view: schema
    }, {
      path: '/api/:service/:table/:id',
      view: schema
    }, {
      path: '/graph/:id',
      view: graph
    }, {
      path: '/:name',
      view: viewer
    }, {
      path: '/upload/files',
      view: upload
    }
  ]
}

const navbar = (config) => {
  Config.navbar = config
}

const route = (path, view) => {
  Config.routes.push({
    path: path,
    view: view
  })
}

const start = ({
  language,
  ...config
}) => {
  if (language && lang[language]) {
    Config = {
      ...Config,
      ...lang[language],
      LANGUAGE: language
    }
  }
  Config = {
    ...Config,
    ...config
  }

  const getUrl = () => location.hash.substr(1)
  var update = () => {}
  const navbar = (cnf) => {
    if (Config.navbar || cnf) {
      nav({
        ...(Config.navbar || {}),
        ...(cnf || {})
      })
    }
  }
  const Deps = {
    jsb: (attrs) => {
      if (attrs.options == null) {
        attrs.options = {}
      }
      if (attrs.options.language == null) {
        attrs.options.language = Config.LANGUAGE
      }
      if (attrs.options.loader == null) {
        attrs.options.loader = get
      }
      return jsb(attrs)
    },
    wrap: wrap,
    get: get,
    post: post(navbar),
    back: {
      rel: 'self',
      href: 'javascript:history.back()',
      title: Config.BACK_LABEL,
      ui: Config.BACK_UI,
      icon: Config.BACK_ICON
    }
  }

  window.addEventListener('hashchange', () => {
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
      ]).map(R => {
        R.view = (params, extra) =>
          Promise.resolve(R.view(params, {
            ...Deps,
            ...extra
          })).catch(err => {
            var msg = Config.ERROR_INTERNAL_SERVER_ERROR
            if (
              typeof err == "string" &&
              err.substr(0, 6) == "ERROR_" &&
              Config[err]
            ) {
              msg = Config[err]
            }
            return wrap(jsb({
              schema: {
                title: Config.ERROR_TITLE,
                description: msg,
                ui: 'card',
                format: 'danger',
                href: err == 'ERROR_UNAUTHORIZED' ? '#/api/login/users' :
                  'javascript:history.back()'
              }
            }))
          })
        return R
      }),
      update: callback => {
        update = callback
      }
    }))
  })
}

export {navbar, route, start}
