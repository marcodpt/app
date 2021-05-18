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
  if (state[key] == null) {
    update(state => {
      state[key] = {vDom: null}
      if (typeof component == 'object') {
        state[key].change = app(vDom => {
          update(state => {
            state[key].vDom = vDom
          })
        }, component, attrs)
      }
    })
  }
  return state[key].vDom
}

export {app, sub}
