# App
Ultra minimalistic [hyperscript](https://github.com/hyperhype/hyperscript) component based front end javascript framework based on [superfine](https://github.com/jorgebucaran/superfine)

## Motivation
 - I think [hyperscript](https://github.com/hyperhype/hyperscript) is the correct way of use virtual dom, because there is no better template language than javascript with functional composition.
 - I hate to work with build steps in the front end application so I don't like JSX and even Svelte.
 - I think [superfine](https://github.com/jorgebucaran/superfine) is the most beautiful front end javascript framework ever inventend.
 - And I think [hyperapp](https://github.com/jorgebucaran/hyperapp) is the correct way of doing things with pure functions.

## What you did?
 - I create a minamilistic API for a component based framework on top of [superfine](https://github.com/jorgebucaran/superfine)
 - I overload [superfine](https://github.com/jorgebucaran/superfine) `h` function with some magic
 - I use it in production and I get the job done!

## Examples
Please check the live working [example](https://marcodpt.github.io/app/)

Some [superfine](https://github.com/jorgebucaran/superfine) knowledge is desirable to understand deep what has been done. But is not absolutely necessary.

### Counter component
```js
import {app} from 'https://cdn.jsdelivr.net/gh/marcodpt/app/index.js'

const counter = (h, state) => {
  state.count = isNaN(state.count) ? 0 : parseInt(state.count)

  return h("main", [
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
    }, "+")
  ])
}

app(document.getElementById('app'), counter, {count: 5})
```

This is a `counter component`.

Let me start with the end. Observe that I call `app` with 3 parameters. The first the `DOM element`, the second the `counter component` and the last which maybe ommitted the initial `state`.

In my component based approach, differently from [hyperapp](https://github.com/jorgebucaran/hyperapp), `state` is always an `object`.

Let me speak a little about `h` overloads!

So observe there is no `text` function. If you do not pass `vDom` object, it will apply `text`.

In the `h` function, attributes can be ommitted!

If you observe inside the first `button`, the `setTimeout` made a call to `h()`, `h` with no params means rerender. 

All others `onclick` inside others `buttons` don't call `h()` because at the end of every function application the `app` calls automatically.

Use `h()` for everything outside the normal flow, like async functions.

`state` is always an object!

At the beginning of the component I sanitize data and you can make async calls or watch events, then you simply update `state` and call `h()` for a rerender!

Now you probably understand that all the subscribes that [hyperapp](https://github.com/jorgebucaran/hyperapp) carefully take away from pure functions I put inside my components. But this components do not comunicate with outside world! And scale very well like black box! Keep with me to the end...

### Todo component
```js
import {app} from 'https://cdn.jsdelivr.net/gh/marcodpt/app/index.js'

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
          'array',
          'style',
          'classes'
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

app(document.getElementById('app'), todo)
```

This is a `todo` component. Let me start with some `h` overload magic again.

Observe inside the attributes of `input`:
 - `class` maybe an array that will be joined, everything that is not a string will be ignored so feel free to do some ternary logic if you want
 - `style` maybe an object and I will apply a `camelToKebab` function to convert `verticalAlign` in `vertical-align`, and you can write beautiful javascript, in this case only `null`, `undefined` and `objects` will be ignored
 - the `attributes` I will use a `camelToKebab` convert too. And `dataBsTarget` will be `data-bs-target`.

This examples has no utility for the component, but I want to introduce this things because I praise a lot for beautiful javascript inside components.

The rest is self explanatory, at the beginning of component some `state` sanitization logic, again you can watch browser events or do async calls here. For everything outside the normal flow call `h()` for a rerender. All other functions calls do it by itself without the need for do this manually. So when you click `add` button it will work flawlessly, at least I hope so :).

### Parent and child. How to scale?
```
import {app} from 'https://cdn.jsdelivr.net/gh/marcodpt/app/index.js'
import {counter} from '/path/to/counter/component/index.js'

const parent = h =>
  h('main', [
    h('h2', 'Parent and children'),
    h('child1', counter, {count: 13, title: 'first child'}),
    h('p', 'second child'),
    h('child2', counter, {count: 17, title: 'second child'})
  ])

app(document.getElementById('app'), parent)
```

In this example I will show the reason why I create this `app`

So the `parent` component does not update `state` so it will ignore it!

But again I will present a `h` overload, but this time very useful for functionality of the `app`

Observe that there is 2 special calls to `h`, `child1` and `child2`, the second parameter is the component function definition (the exactly `counter` component that I defined above).

So when the second parameter of `h` is a function it will store in the `state.child1` the `vDom` associatewith `child1` and `h` will return here. The analogous heappens for `child2`. So even if you don't see `state` here the keys `child1` and `child2` are in use. Don't mix with it to avoid bugs.

Here we have two absolutely independent `counter` components with they own `states`

### Outside world comunication
```
import {app} from 'https://cdn.jsdelivr.net/gh/marcodpt/app/index.js'
import {table} from '/path/to/table/component/index.js'
import {profile} from '/path/to/profile/component/index.js'
import {router} from '/path/to/router/third/party/library/index.js'

var oldComponent = null
var view = () => {}
var Data = null
const el = document.getElementById('app')
const display = component => params => {
  if (oldComponent !== component) {
    Data = params
    view()
    view = app(el, component, Data)
  } else {
    Data.id = params.id
    view(true)
  }
  oldComponent = component
}

router('table/:id', display(table))
router('profile/:id', display(profile))
```
Sometimes you need to update components parameters or just stop one component. A typical case will be a `router` implementation.

In this example I show an imaginary `router` with 2 imaginary components: `table` and `profile`
The `params` variable is an imaginary `object` containing the url `params`. Something like:
```json
{
  "id": 7
}
```

So `app` calls returns a function, until now we do not use it! We store this function in the `view` variable.

When you call `view` with falsy first param it will stop the `oldComponent` from render in the `DOM`.

When you call `view` with a truthy first param it will rerender the `component` with the updated `id`. Observe that components can't change it `state` object and the variable `Data` is garanteed to store the `state` of the component. 

## Contributing
So if you read until now, you probabily master this project because it is a single `index.js` javascript es6 module file with [superfine](https://github.com/jorgebucaran/superfine) as a dependency.

The file has less than a hundred lines of code, and I include a lot of desnecessary things, like most of `h` overloads. So the logic there is very small and any one could master it. Don't fear this file it is very easy to follow.

There is no guidelines for contributing, any help is greatly appreciated!

## Self hosted
Use something like, and have fun:
```
python3 -m http.server 9000
```
