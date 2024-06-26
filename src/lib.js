import T from './lang/index.js'

const rm = el => {
  if (el && el.parentNode) {
    el.parentNode.removeChild(el)
  }
}

const formatter = ({type, ui, maximum, minimum}) => {
  if (ui == 'password') {
    return () => '********'
  } else if (type == 'boolean' || ui == 'bool') {
    return x => x ? T('boolTrue') : T('boolFalse')
  } else if (ui == 'date') {
    return x => {
      if (typeof x == 'number' && x) {
        x = (x < 0 ? x+1 : x) * 1000
      } else if (typeof x == 'string' && /^\d{4}-\d{2}-\d{2}/.test(x)) {
        if (x.length == 10) {
          x += 'T12:00'
        }
      } else {
        return ''
      }

      const d = new Date(x)
      return d.toLocaleDateString(T('lang'))
    }
  } else if (/^num\.[1-9][0-9]*$/.test(ui)) {
    const precision = parseInt(ui.substr(4))
    const pow = 10 ** precision

    return x => {
      if (isNum(x)) {
        if (type == 'number' ||
          (typeof x == 'string' && x.indexOf('.') >= 0)
        ) {
          x = parseFloat(x)
        } else {
          x = parseInt(x) / pow
        }
        return x.toLocaleString(T('lang'), {
          minimumFractionDigits: precision,
          maximumFractionDigits: precision
        })
      }
      return x == null ? '' : x
    }
  } else if (/^len:[1-9][0-9]*$/.test(ui)) {
    const len = parseInt(ui.substr(4))
    return x => {
      if (x == null) {
        return ''
      } else if (type == 'number' || type == 'integer') {
        return String(x).padStart(len, '0')
      } else {
        return String(x).padEnd(len, ' ').substr(0, len)
      }
    }
  } else if (ui == 'color') {
    return x => typeof x == 'string' ?
      (/^[\dA-Fa-f]{6}$/.test(x) ? '#' : '')+x : x
  } else if (ui == 'progress') {
    return x => {
      if (typeof x != 'number') {
        return x == null || !isNum(x) ? 0 : x
      }
      const a = minimum == null ? 0 : minimum
      const b = maximum == null ? (type == 'number' ? 1 : 100) : maximum
      x = (x - a) / (b - a)
      x = x < 0 ? 0 : x
      return 100 * x
    }
  } else if (type == 'integer' || type == 'number') {
    return x => !isNum(x) ? x == null ? '' : x :
      (type == 'integer' ? Math.round(x) : parseFloat(x))
        .toLocaleString(T('lang'))
  } else if (type != 'string') {
    return x => JSON.stringify(x, undefined, 2)
  } else {
    return x => x == null ? '' : x
  }
}

const isNum = x =>
  x != null && typeof x != 'boolean' && x !== '' && !isNaN(x)

const hasStep = ui => /^num\.[1-9][0-9]*$/.test(ui)

const getStep = ui => !hasStep(ui) ? 1 : 1 / (10 ** parseInt(ui.substr(4)))

const parser = ({type, ui}) => data => {
  var value = null

  if (ui == 'date' && (type == 'integer' || type == 'number')) {
    if (!data) {
      value = 0
    } else {
      var d = new Date(data+'T12:00').getTime() / 1000
      d = d <= 0 ? d-1 : d
      if (type == 'integer') {
        d = Math.round(d)
      }
      value = d
    }
  } else if (type == 'integer' && isNum(data)) {
    value = parseInt(Math.round(data / getStep(ui)))
  } else if (type == 'number' && isNum(data)) {
    value = parseFloat(data)
  } else if (type == 'boolean') {
    value = !!(isNum(data) ? parseInt(data) : data)
  } else if (type != 'string' && ui != 'file') {
    try {
      value = JSON.parse(data)
    } catch (err) {}
  } else {
    value = data
  }

  return value
}

const selfClosing = [
  'area',
  'br',
  'col',
  'embed',
  'hr',
  'img',
  'input',
  'param',
  'source',
  'track',
  'wbr'
]

const normalTags = [
  'a',
  'abbr',
  'address',
  'article',
  'aside',
  'audio',
  'b',
  'bdi',
  'bdo',
  'blockquote',
  'button',
  'canvas',
  'caption',
  'cite',
  'code',
  'colgroup',
  'data',
  'datalist',
  'dd',
  'del',
  'details',
  'dfn',
  'dialog',
  'div',
  'dl',
  'dt',
  'em',
  'fieldset',
  'figcaption',
  'figure',
  'footer',
  'form',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'header',
  'i',
  'iframe',
  'ins',
  'kbd',
  'label',
  'legend',
  'li',
  'main',
  'map',
  'mark',
  'meter',
  'nav',
  'noscript',
  'object',
  'ol',
  'optgroup',
  'option',
  'output',
  'p',
  'picture',
  'pre',
  'progress',
  'q',
  'rp',
  'rt',
  'ruby',
  's',
  'samp',
  'script',
  'section',
  'select',
  'small',
  'span',
  'strong',
  'sub',
  'summary',
  'sup',
  'svg',
  'table',
  'tbody',
  'td',
  'template',
  'textarea',
  'tfoot',
  'th',
  'thead',
  'time',
  'tr',
  'u',
  'ul',
  'var',
  'video'
]

export {
  rm,
  formatter,
  hasStep,
  getStep,
  parser,
  selfClosing,
  normalTags
}
