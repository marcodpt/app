const app = (onChange, component, attrs) => {
  var stop = false
  var state = {}

  const update = action => {
    if (typeof action == 'function') {
      action(state)
    }
    if (!stop) {
      onChange(component.view(state, update))
    }
  }

  const change = attrs => {
    component.change ?
      component.change(attrs || {}, update) :
      update(state => {
        Object.assign(state, attrs || {})
      })
  }

  change(attrs)

  return attrs => {
    if (attrs == null) {
      stop = true
      if (component.end) {
        component.end(state)
      }
    } else {
      change(attrs)
    }
  }
}

const sub = (state, update, key, component, attrs) => {
  if (!component || !component.view) {
    return null
  }
  if (state[key] == null) {
    state[key] = {}
    state[key].change = app(vDom => {
      state[key].vDom = vDom
      update()
    }, component, attrs)
  }
  return state[key].vDom
}

const change = (state, key, attrs) => {
  if (state[key] != null && typeof state[key].change == 'function') {
    state[key].change(attrs)
    if (attrs == null) {
      delete state[key]
    }
  }
}

export {app, sub, change}
