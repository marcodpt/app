# App
> A component [hyperscript](https://github.com/hyperhype/hyperscript) framework on the top of [superfine](https://github.com/jorgebucaran/superfine)

[Live example](https://marcodpt.github.io/app/)

[Live example Source](https://github.com/marcodpt/app/blob/main/examples.js)

## Counter component
```js
import {app} from 'https://cdn.jsdelivr.net/gh/marcodpt/app/index.js'

const counter = (h, state) => {
  //state is always an object
  state.count = isNaN(state.count) ? 0 : parseInt(state.count)

  return h("main", [
    h("p", "The current count is: "+state.count),
    h("button", {
      onclick: () => {
        state.count -= 1
        //every on click rerender the component
      }
    }, "-"),
    h("button", {
      onclick: () => {
        state.count += 1
      }
    }, "+")
  ])
}

app(
  document.getElementById('app'), //the DOM element
  counter,                        //the component function
  {count: 5}                      //the inital state, always an object
)
```

### Parent and child. How to scale?
```js
import {app} from 'https://cdn.jsdelivr.net/gh/marcodpt/app/index.js'
//counter is the same component as defined above
import {counter} from '/path/to/counter/component/index.js'

const parent = h =>
  h('main', [
    h('h2', 'Parent and children'),
    //this is a component child1, based on counter and with initial state
    h('child1', counter, {count: 13, title: 'first child'}),
    h('p', 'second child'),
    //this is a component child2
    h('child2', counter, {count: 17, title: 'second child'})
  ])

app(
  document.getElementById('app'), //the DOM element
  parent                          //the component function with initial state = {}
)
```

## Contributing
There is no guidelines for contributing, any help is greatly appreciated!
