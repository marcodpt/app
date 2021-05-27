import {app, sub} from 'https://cdn.jsdelivr.net/gh/marcodpt/app/index.js'
import {query} from 'https://cdn.jsdelivr.net/gh/marcodpt/query/index.js'
import {router} from 'https://cdn.jsdelivr.net/gh/marcodpt/router/index.js'
import {h, text, patch} from 'https://unpkg.com/superfine'

const counter = {
  change: (attrs, update) => {
    update(state => {
      state.count = isNaN(attrs.count) ? 0 : parseInt(attrs.count)
      state.title = attrs.title || ''
      state.hash = '#/counter?count=15'
    })
  },
  view: (state, update) => 
    h("main", {}, [
      h('h2', {}, text(state.title || 'Counter')),
      h("p", {}, text("The current count is: "+state.count)),
      h("button", {
        onclick: ev => {
          setTimeout(() => {
            update(state => {
              state.count += 10
            })
          }, 3000)
        }
      }, text("+10 in 3sec")),
      h("button", {
        onclick: ev => {
          update(state => {
            state.count -= 1
          })
        }
      }, text("-")),
      h("button", {
        onclick: ev => {
          update(state => {
            state.count += 1
          })
        }
      }, text("+")),
      state.title || location.hash == state.hash ? null : h('a', {
        href: state.hash
      }, text('force 15 via #hash'))
    ])
}

const todo = {
  change: (attrs, update) => {
    update(state => {
      state.todos = attrs.todos || []
      state.todo = attrs.todo || ''
    })
  },
  view: (state, update) => 
    h("main", {}, [
      h('h2', {}, text('Todo')),
      h("section", {}, [
        h("input", {
          type: "text",
          value: state.todo,
          style: 'display: inline-block',
          oninput: ev => {
            update(state => {
              state.todo = ev.target.value
            })
          }
        }),
        h("button", {
          onclick: ev => {
            update(state => {
              if (state.todo) {
                state.todos.push(state.todo)
                state.todo = ""
              }
            })
          }
        }, text("Add"))
      ]),
      h("div", {}, state.todos.map((todo, i) =>
        h("div", {}, [
          h("button", {
            onclick: () => {
              state.todos.splice(i, 1)
            }
          }, text("remove")),
          h("span", {}, text(todo))
        ])
      ))
    ])
}

const parent = {
  view: (state, update) => 
    h('main', {}, [
      h('h2', {}, text('Parent and children')),
      sub(state, update, 'child1', counter, {
        count: 13,
        title: 'first child'
      }),
      sub(state, update, 'child2', counter, {
        count: 17,
        title: 'second child'
      })
    ])
}

const page = {
  change: (attrs, update) => {
    update(state => {
      const setRoute = (path, comp) => {
        router(path, ctx => {
          update(state => {
            if (state.lastPath != path) {
              if (state.child && state.child.change) {
                state.child.change()
              }
              delete state.child
            }
            state.Attributes = {}
            Object.assign(state.Attributes, query(ctx.query), ctx.params)

            if (state.lastPath == path) {
              state.child.change(state.Attributes)
            }
            state.lastPath = path
            state.component = comp
          })
        })
      }

      setRoute('/counter', counter)
      setRoute('/todo', todo)
      setRoute('/parent', parent)
      setRoute('*', {
        view: () => {
          location.hash = '#/counter'
        }
      })

      const tick = () => {
        router(location.hash.substr(1))
      }
      window.addEventListener('hashchange', tick)
      window.addEventListener('load', tick)
    })
  },
  view: (state, update) =>  {
    return h('body', {}, [
      h('a', {
        class: 'github-fork-ribbon',
        href: 'https://github.com/marcodpt/app',
        'data-ribbon': 'Fork me on GitHub',
        title: 'Fork me on GitHub'
      }, text('Fork me on GitHub')),
      h('h1', {}, text('App')),
      h('p', {}, text('A component approach to vDom!')),
      h('ul', {}, [
        h('li', {}, [
          h('a', {
            href: "#/counter"
          }, text('Counter'))
        ]),
        h('li', {}, [
          h('a', {
            href: "#/todo"
          }, text('Todo'))
        ]),
        h('li', {}, [
          h('a', {
            href: "#/parent"
          }, text('Parent and children'))
        ]),
      ]),
      sub(state, update, 'child', state.component, state.Attributes)
    ])
  }
    
}

app(vDom => patch(document.body, vDom), page, {})
