import {navbar} from './dependencies.js'
import {get, getIcon} from './lib.js'

const resolveItems = (item, links, user) => {
  if (typeof item == 'object' && item != null && item.items) {
    return {
      ...item,
      items: item.items.map(item => {
        if (typeof item == 'string') {
          if (item == 'api/get/users/') {
            return user && user.id ? {
              icon: 'user',
              title: user.name,
              href: '#/api/get/users/'+user.id
            } : null
          } else {
            const S = links.filter(l => l.href == item)[0]
            return S ? {
              icon: getIcon(S.ui),
              title: S.title,
              href: '#/'+S.href
            } : null
          }
        } else {
          return resolveItems(item, links, user)
        }
      }).filter(item => item != null).map(item => {
        if (item &&
          item.href == window.location.hash &&
          item.href.indexOf('?') == -1
        ) {
          item.href += '?'
        }
        return item
      })
    }
  } else {
    return item
  }
}

const resolveAccess = (item, groups) => {
  if (item.items) {
    return {
      ...item,
      items: item.items.map(
        item => resolveAccess(item, groups)
      ).filter(item => item.access == null || item.access.reduce(
        (pass, group) => pass || groups.indexOf(group) != -1,
        false
      ))
    }
  } else {
    return item
  }
}

export default (config) => {
  document.body.querySelectorAll('nav.navbar').forEach(e => {
    if (e && e.parentNode) {
      e.parentNode.removeChild(e)
    }
  })

  var uid = null
  var user = null
  var nav = null

  get('api/whoami/users').catch(err => {
    if (err == 'ERROR_UNAUTHORIZED') {
      return get('api/whoami/users')
    }
    throw err
  }).then(data => {
    uid = data
    return get(`api/users/${uid}`)
  }).then(data => {
    user = data
    return get('request/api/get/')
  }).then(data => {
    nav = resolveItems(config, data.links, user)
    return get(`api/members?users_id_member=${uid}`)
  }).then(data => {
    nav = resolveAccess(nav, (data || []).map(row => row.groups_id_))
    document.body.prepend(navbar({
      ...nav,
      update: callback => {
        window.addEventListener("hashchange", () => {
          callback(window.location.hash)
        })
      }
    }))
  })
}
