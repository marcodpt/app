import {app} from 'https://cdn.jsdelivr.net/gh/marcodpt/app/index.js'

const counter = (h, state) => {
  state.count = isNaN(state.count) ? 0 : parseInt(state.count)

  return h("main", [
    h('h2', state.title || 'Counter'),
    h("p", "The current count is: "+state.count),
    h("button", {
      onclick: () => {
        setTimeout(() => {
          state.count += 10
          h()
        }, 3000)
      }
    }, "+10 in 3sec"),
    h("button", {
      onclick: () => {
        state.count -= 1
      }
    }, "-"),
    h("button", {
      onclick: () => {
        state.count += 1
      }
    }, "+"),
    state.title ? null : h('a', {
      href: '#counter?15'
    }, 'force 15 via #hash')
  ])
}

const todo = (h, state) => {
  state.todos = state.todos || []
  state.todo = state.todo || ''

  return h("main", [
    h('h2', 'Todo'),
    h("section", [
      h("input", {
        type: "text",
        value: state.todo,
        class: [
          ' an strange  array  test ',
          null,
          false,
          'below is a style sugar',
          'test'
        ],
        style: {
          display: 'inline-block',
          verticalAlign: 'middle'
        },
        dataBsTarget: '#testCamelToKebab',
        oninput: ({target}) => {
          state.todo = target.value
        }
      }),
      h("button", {
        onclick: () => {
          state.todos.push(state.todo)
          state.todo = ""
        }
      }, "Add")
    ]),
    h("div",
      state.todos.map((todo, i) =>
        h("div", {}, [
          h("button", {
            onclick: () => {
              state.todos.splice(i, 1)
            }
          }, "remove"),
          h("span", {}, todo)
        ])
      )
    )
  ])
}

const parent = h =>
  h('main', [
    h('h2', 'Parent and children'),
    h('child1', counter, {count: 13, title: 'first child'}),
    h('p', 'second child'),
    h('child2', counter, {count: 17, title: 'second child'})
  ])

var view = () => {}
const scope = {}
var old = null
const tick = () => {
  const H = location.hash.split('?', 2)
  if (old != H[0]) {
    view()
  }
  const el = document.getElementById('app')
  if (H[0] == '#counter') {
    scope.count = H[1] || 3
    if (old == H[0]) {
      view(true)
    } else {
      view = app(el, counter, scope)
    }
  } else if (H[0] == '#todo') {
    view = app(el, todo)
  } else if (H[0] == '#parent') {
    view = app(el, parent)
  } else {
    view = app(el, h => h('main'))
  }
  old = H[0]
}

window.addEventListener('hashchange', tick)
window.addEventListener('load', () => {
  location.hash = '#counter'
  tick()
})
