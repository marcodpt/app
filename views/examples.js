const normalizeDesc = desc => (desc || '').trim().split('\n')
  .map(l => l.trim()).join('\n')

export default ({render, Params, form, e}) => {
  return render(import(`../spec/${Params.component}.js`).then(mod => {
    const M = mod.default
    const {title, description, data, html} = M.examples[Params.index]
    const desc = normalizeDesc(description)
    const mark = '*****'
    const fnStr = X => {
      if (typeof X == 'object') {
        Object.keys(X).forEach(k => {
          X[k] = fnStr(X[k])
        })
      }
      return typeof X == 'function' ? mark+X.toString()+mark : X
    }
    const print = X => JSON.stringify(fnStr(X), undefined, 2)
      .replaceAll('"'+mark, '').replaceAll(mark+'"', '')
      .replaceAll('\\n        ', '\n')
    const style = 'white-space:pre-wrap'
    return e(({div, h5, p, hr, text, code}) => div({
      class: 'container my-5 mx-auto'
    }, [
      div({
        class: 'card'
      }, [
        div({
          class: 'card-body'
        }, [
          h5({
            class: 'card-title'
          }, [
            text(title)
          ]),
          p({
            class: 'card-text',
            style
          }, [
            text(desc)
          ]),
          hr(),
          div({}, [
            M.component(data[0])
          ]),
          hr(),
          code({
            class: 'card-text',
            style
          }, [
            text(Params.component+'('+print(data[0])+')')
          ]),
          !html ? null : hr(),
          !html ? null : code({
            class: 'card-text',
            style
          }, [
            text(html)
          ])
        ])
      ])
    ]))
  }))
}