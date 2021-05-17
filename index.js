import {h, text, patch} from 'https://unpkg.com/superfine'

const app = (run, component, state) => {
  state = state == null || typeof state != 'object' ? {} : state
  var el = null
  if (typeof run === 'object' && run.nodeType === 1) {
    el = run
    run = vdom => el && patch(el, vdom)
  }
  const render = (action) => {
    const hOverload = (tagName, attributes, children) => {
      if (tagName == null) {
        render()
      } else if (typeof attributes == 'function') {
        if (state[tagName] == null) {
          const rerender = app(vdom => {
            state[tagName] = {
              vdom: vdom,
              render: () => {
                rerender(true)
              }
            }
            render()
          }, attributes, children || {})
        }
        return state[tagName].vdom
      } else {
        if (attributes instanceof Array || typeof attributes != 'object') {
          children = attributes
          attributes = null
        }
        children = children instanceof Array ? children : [children]
        children = children.map(child =>
          child != null && typeof child != 'object' ? text(child) : child
        )

        const camelToKebab = s => s
          .replace(/([a-z])([A-Z])/g, '$1-$2')
          .toLowerCase()
        const A = attributes || {}
        attributes = Object.keys(A).reduce((R, key) => {
          if (typeof A[key] == 'function') {
            const f = A[key]
            R[key] = (ev) => {
              f(ev)
              hOverload()
            }
          } else if (key == 'class' && A[key] instanceof Array) {
            R[key] = A[key]
              .filter(cls => typeof cls == 'string')
              .join(' ')
              .replace(/\s\s+/g, ' ')
              .trim()
          } else if (key == 'style' && typeof A[key] == 'object') {
            R[key] = Object.keys(A[key])
              .map(css => A[key][css] == null ? '' :
                `${camelToKebab(css)}: ${A[key][css]}`
              ).filter(css => css).join(';')
          } else {
            R[camelToKebab(key)] = A[key]
          }
          return R
        }, {})

        return h(tagName, attributes, children)
      }
    }
    run(component(hOverload, state))
  }
  render()
  return (x) => {
    x ? render() : el = null
  }
}

export {app}
