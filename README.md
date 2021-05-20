# App
> A vDom framework on the top of any vDom library you want!

[Live example](https://marcodpt.github.io/app/)

[Live example Source](https://github.com/marcodpt/app/blob/main/examples.js)

Examples was build with [superfine](https://github.com/jorgebucaran/superfine) but it is very easy to adapt to any vDom library, or template engine, or even raw strings!

## Counter component
```js
import {app} from 'https://cdn.jsdelivr.net/gh/marcodpt/app/index.js'
import {h, text, patch} from 'https://unpkg.com/superfine'

const counter = {
  change: (attrs, update) => {
    update(state => {
      state.count = isNaN(attrs.count) ? 0 : parseInt(attrs.count)
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
      }, text("+"))
    ])
}

app(
  vDom => patch(     //the onChange function build with help of superfine patch
    document.getElementById('app'),
    vDom
  ),
  counter,           //the component function
  {count: 5}         //the inital state, always an object
)
```

## Parent and child. How to scale?
```js
import {app, sub} from 'https://cdn.jsdelivr.net/gh/marcodpt/app/index.js'
//counter is the same component as defined above
import {counter} from '/path/to/counter/component/index.js'
import {h, text, patch} from 'https://unpkg.com/superfine'

const parent = {
  view: (state, update) => 
    h('main', {}, [
      h('h2', {}, 'Parent and children'),
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

app(
  vDom => patch(     //the onChange function build with help of superfine patch
    document.getElementById('app'),
    vDom
  ),
  parent            //the component function with initial state = {}
)
```

## Api

### app(onChange, component, attrs)
 - function `onChange` (`vDom`): a function to handle any vDom changes, no return value, you tipically want to update the `DOM` with this function 
 - object `component` properties:
   - function `view` (object `state`, function `update` (`state`)): a function that given a `state` and an `update` function return a `vDom` that will be passed to `onChange`. This property is required!
   - function `change` (object `attributes`, function `update` (`state`)): a function that given the external `attributes` to component and an `update` function will set up the `state` via `update` function! It is optional, in case you don't use this function `attributes` will be the initial state!
   - function `end` (object `state`): a function that will be called after component halt! It is optional!
 - object `attrs`: the initial `attributes` passed to `component.change`
 - returns function (`attrs`): a function to update the `attrs` via `component.change`! In case `attrs` = `null` the component will halt and `component.end` with current `state` will be called! 

### sub(state, update, key, component, attrs)
Create a child component inside a component!
 - object `state`: the current `parent` `state` object
 - function `update`: the `parent` `update` function
 - string `key`: the `state` `key` that will be stored `child` component information.
 - object `component`: an object that defines a `component` in the same way as `app` API.
 - object `attrs`: an object that defines the initial `attrs` in the same way as `app` API.

## Contributing
There is no guidelines for contributing, any help is greatly appreciated!
