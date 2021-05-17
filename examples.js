import {app} from 'https://cdn.jsdelivr.net/gh/marcodpt/app/index.js'
import {query} from 'https://cdn.jsdelivr.net/gh/marcodpt/query/index.js'
import {router} from 'https://cdn.jsdelivr.net/gh/marcodpt/router/index.js'

const counter = (h, state) => {
  state.count = isNaN(state.count) ? 0 : parseInt(state.count)
  const hash = '#/counter?count=15'

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
    state.title || location.hash == hash ? null : h('a', {
      href: hash
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

const page = (h, state) => {
  if (state.lastPath === undefined) {
    state.Attributes = null
    state.component = null
    state.lastPath = null

    const setRoute = (path, comp) => {
      router(path, ctx => {
        if (state.lastPath != path) {
          state.Attributes = {}
          delete state.child
        }
        Object.assign(state.Attributes, query(ctx.query), ctx.params)

        if (state.lastPath == path) {
          state.child.render()
        }
        state.lastPath = path
        state.component = comp
        h()
      })
    }

    setRoute('/counter', counter)
    setRoute('/todo', todo)
    setRoute('/parent', parent)
    setRoute('*', () => {
      location.hash = '#/counter'
    })

    const tick = () => {
      console.log('tick')
      router(location.hash.substr(1))
    }
    window.addEventListener('hashchange', tick)
    window.addEventListener('load', tick)
  }

  return h('body', [
    h('h1', 'App'),
    h('p', 'A component approach to superfine!'),
    h('ul', [
      h('li', [
        h('a', {
          href: "#/counter"
        }, 'Counter')
      ]),
      h('li', [
        h('a', {
          href: "#/todo"
        }, 'Todo')
      ]),
      h('li', [
        h('a', {
          href: "#/parent"
        }, 'Parent and children')
      ]),
    ]),
    state.component == null ? null :
      h('child', state.component, state.Attributes)
  ])
}

app(document.body, page)
