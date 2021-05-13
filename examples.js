import {h, text, patch} from 'https://unpkg.com/superfine'
import {app} from './index.js'

const counter = function (state, render) {
  state.count = isNaN(state.count) ? 0 : parseInt(state.count)

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
          render(state => {
            state.count += 10
          })
        }, 1000)
      }
    }, text("+10 in 1sec")),
    h("button", {
      onclick: () => {
        render(state => {
          state.count -= 1
        })
      }
    }, text("-")),
    h("button", {
      onclick: () => {
        render(state => {
          state.count += 1
        })
      }
    }, text("+"))
  ])
}

const todo = function (state, render) {
  state.todos = state.todos || []
  state.todo = state.todo || ''

  return h("main", {}, [
    h("div", {},
      state.todos.map((todo, i) =>
        h("div", {}, [
          h("button", {
            onclick: () => {
              render(state => {
                state.todos.splice(i, 1)
              })
            }
          }, text("remove")),
          h("span", {}, text(todo))
        ])
      )
    ),
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
          render(state => {
            state.todo = target.value
          })
        }
      }),
      h("button", {
        onclick: () => {
          render(state => {
            state.todos.push(state.todo)
            state.todo = ""
          })
        }
      }, text("Add"))
    ])
  ])
}

const parent = function (state, render) {
  if (state.child1 == null) {
    app(vdom => {
      render(state => {
        state.child1 = vdom
      })
    }, counter, {count: 13})
  }
  if (state.child2 == null) {
    app(vdom => {
      render(state => {
        state.child2 = vdom
      })
    }, counter, {count: 17})
  }

  return h('main', {}, [
    h('p', {}, text('first child')),
    state.child1,
    h('p', {}, text('second child')),
    state.child2
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
