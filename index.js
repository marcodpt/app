import * as comp from './src/components.js'

export default ({build, root, routes}) => {
  root = root || document.body
  routes = routes || {}

  var active = null
  var stop = null
  var old = null
  var components = {
    ...comp,
    render: (view, el) => comp.render(view, el || root)
  }

  Promise.resolve()
    .then(() => typeof build === 'function' ? build(components) : null)
    .then(addons => {
      components = {
        ...components,
        ...(addons || {})
      }
      if (active == null) {
        active = true
      }
      router()
    })

  const setClass = (el, attr, fn) =>
    (el.getAttribute(`data-paw-${attr}`) || '').split(' ')
      .map(c => c.trim())
      .filter(c => c).forEach(c => {
        el.classList[fn](c)
      })

  const router = () => {
    if (!active) {
      return
    }
    const url = (window.location.hash || '#/').substr(1)
    const Url = url.split('?')
    const path = Url.shift()
    const Path = path.split('/').map(decodeURIComponent)
    const query = Url.join('?')
    const Query = query.split('&')
      .map(pair => pair.split('='))
      .map(pair => ({
        key: decodeURIComponent(pair.shift()),
        value: decodeURIComponent(pair.join('='))
      }))
      .filter(({key}) => key != "")
      .reduce((Q, {key, value}) => {
        if (key.substr(key.length - 2) == '[]') {
          key = key.substr(0, key.length - 2)
          if (!(Q[key] instanceof Array)) {
            Q[key] = []
          }
          Q[key].push(value)
        } else {
          Q[key] = value
        }
        return Q
      }, {})

    const {route, Params} = Object.keys(routes).reduce((match, route) => {
      const Route = route.split('/')
      if (Route.length == Path.length) {
        var weight = 1
        const Params = Path.reduce((Params, value, i) => {
          if (Params) {
            if (Route[i].substr(0, 1) == ':') {
              Params[Route[i].substr(1)] = value
            } else if (Route[i] !== value) {
              Params = null
            } else {
              weight++
            }
          }
          return Params
        }, {})
        if (Params && weight > match.weight) {
          return {
            route,
            Params,
            weight,
          }
        }
      }
      return match
    }, {
      route: '*',
      Params: {},
      weight: 0
    })

    if (typeof routes[route] == 'function') {
      const base = {url, route, path, Path, Params, query, Query}
      const state = {
        ...base,
        old, root,
        ...components 
      }
      if (typeof stop == 'function') {
        stop(state)
      }
      stop = routes[route](state)
      old = base
    }

    const hash = '#'+url
    document.body.querySelectorAll([
      '[data-paw-active]',
      '[data-paw-inactive]'
    ].join(', ')).forEach(p => {
      setClass(p, 'active', 'remove')
      setClass(p, 'inactive', 'add')
    })
    const href = Array.from(
      document.body.querySelectorAll('[data-paw-path] > a[href]')
    ).reduce((v, link) => {
      const href = link.getAttribute('href')
      const l = href.length
      return hash.substr(0, l) == href && l > v.length ? href : v
    }, '')

    const link = document.body
      .querySelector('[data-paw-path] > a[href="'+href+'"]')
    const T = document.body.querySelectorAll('[data-paw-text="current"]')
    if (href && link) {
      const Current = []
      var l = link
      while (l = l.closest('[data-paw-path]')) {
        Current.push(l.getAttribute('data-paw-path'))
        const p = l.getAttribute('data-paw-active') ? l :
          l.querySelector('[data-paw-active]')
        if (p) {
          setClass(p, 'active', 'add')
          setClass(p, 'inactive', 'remove')
        }
        l = l.parentNode
      }
      Current.reverse()
      const current = Current.join(' / ')
      T.forEach(t => {
        t.textContent = current
      })
    } else {
      T.forEach(t => {
        t.textContent = ''
      })
    }
  }

  window.addEventListener('hashchange', router)
  return () => {
    active = false
    window.removeEventListener('hashchange', router)
  }
}
