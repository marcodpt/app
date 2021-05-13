const app = function (run, component, state) {
  state = state == null || typeof state != 'object' ? {} : state
  var stop = false
  const render = (action) => {
    if (typeof action == 'boolean') {
      stop = !action
    } if (typeof action == 'function' && !stop) {
      action(state)
    }
    if (!stop) {
      run(component(state, render))
    }
  }

  render()
}

export {app}
