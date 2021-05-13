import {h, text, patch} from 'https://unpkg.com/superfine'
import {app} from './index.js'

const counter = function (state, render) {
  state.count = isNaN(state.count) ? 0 : parseInt(state.count)
  console.log(state)

  return h("main", {}, [
    h("p", {}, text("The current count is: "+state.count)),
    h("button", {
      onclick: () => {
        render(false)
      }
    }, text("stop!")),
    h("button", {
      onclick: () => {
        render(true)
      }
    }, text("start")),
    h("button", {
      onclick: () => {
        setTimeout(function () {
          state.count += 10
          render()
        }, 1000)
      }
    }, text("+10 in 1sec")),
    h("button", {
      onclick: () => {
        state.count -= 1
        render()
      }
    }, text("-")),
    h("button", {
      onclick: () => {
        state.count += 1
        render()
      }
    }, text("+"))
  ])
}

const todo = function (state, render) {
  state.todos = state.todos || []
  state.todo = state.todo || ''

  return h("main", {}, [
    h("section", {}, [
      h("button", {
        onclick: () => {
          render(false)
        }
      }, text("stop!")),
      h("button", {
        onclick: () => {
          render(true)
        }
      }, text("start")),
      h("input", {
        type: "text",
        value: state.todo,
        style: 'display: inline-block',
        oninput: ({target}) => {
          state.todo = target.value
          render()
        }
      }),
      h("button", {
        onclick: () => {
          state.todos.push(state.todo)
          state.todo = ""
          render()
        }
      }, text("Add"))
    ]),
    h("div", {},
      state.todos.map((todo, i) =>
        h("div", {}, [
          h("button", {
            onclick: () => {
              state.todos.splice(i, 1)
              render()
            }
          }, text("remove")),
          h("span", {}, text(todo))
        ])
      )
    )
  ])
}

const parent = function (state, render) {
  const sub = (state, key, comp, init) => {
    if (state[key] == null) {
      state[key] = {}
      state[key].state = init || {}
      state[key].render = app(vdom => {
        state[key].vdom = vdom
        render()
      }, comp, state[key].state)
    }
  }

  state.toggle = state.toggle == null ? false : state.toggle
  sub(state, 'child1', counter, {count: 13})
  sub(state, 'child2', counter, {count: 17})

  return h('main', {}, [
    h('div', {}, [
      h('button', {
        onclick: () => {
          render(state.toggle)
          state.toggle = !state.toggle
          render()
        }
      }, text(state.toggle ? 'play Me' : 'stop Me!')),
      h('button', {
        onclick: () => {
          state.child1.render(false)
        }
      }, text('stop1!')),
      h('button', {
        onclick: () => {
          state.child2.state.count = 1
          state.child2.render()
        }
      }, text('child2 => 1'))
    ]),
    h('p', {}, text('first child')),
    state.child1.vdom,
    h('p', {}, text('second child')),
    state.child2.vdom
  ])
}

const builder = function (id) {
  var e = document.getElementById(id)
  return function (vdom) {
    if (e) {
      e = patch(e, vdom)
    }
  }
}

app(builder('counter'), counter, {count: 3})
app(builder('todo'), todo)
app(builder('parent'), parent)
