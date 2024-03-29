const selfClosing = [
  'area',
  'base',
  'br',
  'col',
  'embed',
  'hr',
  'img',
  'input',
  'link',
  'meta',
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
  'body',
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
  'head',
  'header',
  'html',
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
  'style',
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
  'title',
  'tr',
  'u',
  'ul',
  'var',
  'video'
]


const camelToKebab = string => string
  .replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2')
  .toLowerCase()

const h = (tagName, attributes, children) => {
  const e = document.createElement(tagName)

  Object.keys(attributes || {}).forEach(key => {
    const v = attributes[key]
    const k = camelToKebab(key)
    if (typeof v == 'function') {
      if (k.substr(0, 2) == 'on') {
        e.addEventListener(k.substr(2), v)
      } else {
        e[key] = v
      }
    } else if (v != null && v !== false) {
      e.setAttribute(k, v)
    }
  })

  if (children instanceof Array) {
    children.filter(c => c).forEach(child => e.appendChild(child))
  }

  return e
}

const Tags = {
  text: str => document.createTextNode(str)
}

selfClosing.forEach(tag => {
  Tags[tag] = attributes => h(tag, attributes)
})

normalTags.forEach(tag => {
  Tags[tag] = (attributes, children) => h(tag, attributes, children)
})

export default el => el(Tags)
