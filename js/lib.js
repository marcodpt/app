import {query, html} from './dependencies.js'
import navbar from './navbar.js'
import config from './config.js'

const getIcon = ui => (ui || '').split('\n')[1]

const addToken = Params => {
  Params = Params || {}
  const token = localStorage.getItem('TOKEN')
  if (token) {
    Params['_token'] = token
  }

  return Params
}

const setParams = (url, Params) => {
  const Url = url.split('?')
  const path = Url.shift()
  const params = query(Url.join('?'), Params || {})

  return path + (params.length ? '?' + params : '')
}

const errorMiddleware = response => {
  if (!response.ok) {
    if (response.status == 401) {
      localStorage.setItem('TOKEN', '')
      throw 'ERROR_UNAUTHORIZED'
    } else if (response.status == 404) {
      throw 'ERROR_NOT_FOUND'
    } else {
      throw 'ERROR_INTERNAL_SERVER_ERROR'
    }
  } else {
    var content = response.headers.get('Content-Type').split(";")[0]
    return content != "application/json" ? response.text() : response.json()
  }
}

const dataMiddleware = (method, url) => data => {
  if (data == null) {
    if (/^api\/login\/users/.test(url)) {
      throw 'ERROR_AUTHENTICATION'
    } else if (/^api\/[a-z][a-z_0-9+]*\//.test(url)) {
      if (method == 'GET') {
        throw 'ERROR_FORBIDDEN'
      } else {
        throw 'ERROR_INTERNAL_SERVER_ERROR'
      }
    } else {
      return data
    }
  } else {
    return data
  }
}

const errorHandler = (method, url, Params, title) => err => {
  console.log('****** ERROR ******')
  console.log(method+' '+url)
  console.log(JSON.stringify(Params, undefined, 2))
  console.log(err)

  if (err == 'UNAUTHORIZED') {
    navbar()
  }

  if (err == 'UNAUTHORIZED' || location.hash.substr(1, 7) != '/error/') {
    location.href = '#/error/'+(
      typeof err == "object" ? 'CONNECTION' :
      typeof err == "string" && err ? err :
        'INTERNAL_SERVER_ERROR'
    )+(title ? '/'+encodeURIComponent(title) : '')
  } else {
    console.log('****** STOP ******')
  }
}

const get = (url, Params) => fetch(setParams(url, addToken(Params)))
  .then(errorMiddleware)
  .then(dataMiddleware('GET', url))
  .catch(errorHandler('GET', url, Params))

const post = navbar => (url, Params, err) => fetch(url, {
  method: 'POST',
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(addToken(Params))
})
  .then(errorMiddleware)
  .then(dataMiddleware('POST', url))
  .then(data => {
    var token = null
    if (/^api\/logout\/users/.test(url)) {
      token = ''
    } else if (/^api\/(login|switch)\/users/.test(url)) {
      token = data
    }

    if (token != null) {
      localStorage.setItem('TOKEN', token)
      navbar()
    }

    return data
  })
  .catch(err ? err : errorHandler('POST', url, Params))

const download = (name, data) => {
  const link = document.createElement("a")
  link.setAttribute('href', data) 
  link.setAttribute('download', name)

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

const csv = (P, selector, name, url) => {
  const nl = config.csv.newLine
  const sep = config.csv.separator

  window.csv = () => {
    const link = document.body.querySelector(selector)
    const i = link.querySelector('i')
    var icon = ''

    const finish = () => {
      if (i) {
        i.setAttribute('class', icon)
      }
      link.classList.remove('disabled')
    }

    if (i) {
      icon = i.getAttribute('class')
      i.setAttribute('class', 'fas fa-spinner fa-spin')
    }
    link.classList.add('disabled')

    get(url).then(Data => {
      var data = ''
      data += Object.keys(P)
        .map(key => P[key].title || key).join(sep)+nl
      data += Data.map(function (row) {
        return Object.keys(P).map(function (field) {
          return String(row[field])
        }).join(sep)
      }).join(nl)

      download(name, 'data:text/plain;charset=utf-8,'+encodeURIComponent(data))
      finish()
    }).catch(err => {
      finish()

      throw err
    })
  }
  return 'javascript:csv()'
}

window.backup = () => {
  fetch('backup/'+localStorage.getItem('TOKEN'))
    .then(response => response.blob())
    .then(data => {
      var reader = new FileReader()
      reader.onload = () => download('backup.db', reader.result)
      reader.readAsDataURL(data)
    })
}

window.logs = () => {
  get('logs/'+localStorage.getItem('TOKEN'))
    .then(data => data.forEach(err =>
      console.log('\n\n*******************************************\n'+err)
    ))
}

window.schemaApi = type => {
  if (location.hash.substr(1, 5) == '/api/') {
    var href = location.href.replace('/#/api/', type+'/api/')
    const token = localStorage.getItem('TOKEN')

    if (token) {
      href += (href.indexOf('?') == -1 ? '?' : '&')+'_token='+token
      window.open(href, "_blank")
    }
  }
}

const wrap = e => html(({div}) => div({
  class: 'container my-5'
}, e))

export {
  getIcon,
  get,
  post,
  wrap,
  csv
}
