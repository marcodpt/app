import e from '../e.js'
import {rm, formatter} from '../lib.js'
import spinner from '../spinner.js'
import tag from '../tag.js'
import ctrl from '../ctrl/index.js'
import engine from './engine.js'

export default ({
  title,
  links,
  items,
  config,
  ...schema
}) => {
  config = config || {}

  items = items || {}
  const rowLinks = items.links || []
  const P = items.properties || {}
  const Y = Object.keys(P)
  const K = Y.filter(k => P[k].ui != 'info')
  const I = Y.filter(k => P[k].ui == 'info')
  const F = K.reduce((F, k) => ({
    ...F,
    [k]: formatter(P[k])
  }), {})
  const M = K.reduce((M, k) => {
    if (P[k].totals) {
      M[k] = P[k].totals
    }
    return M
  }, {})
  const U = Object.keys(M)
  const hasTotals = U.length > 0

  const refs = {}

  const state = {
    data: schema.default,
    base: null,
    checked: null,
    rows: null,
    search: '',
    noSearch: !!config.noSearch,
    noCheck: !!config.noCheck,
    noSort: !!config.noSort,
    sort: null,
    page: 1,
    limit: config.limit == null ? 10 : config.limit,
    css: (config.table || 'bordered center striped hover').split(' ')
      .map(c => c.trim()).filter(c => c).map(c => 'table-'+c).join(' ')+
      (config.css ? ' '+config.css : '')
  }

  const tbl = e(({
    table, thead, tbody, tr, th, td, div, a, text, button, ul, span, label
  }) =>
    table({
      class: 'table '+state.css
    }, [
      thead({}, [
        !title ? null : tr({}, [
          th({
            class: 'text-center',
            colspan: '100%'
          }, [
            tag({
              ...schema,
              title
            })
          ])
        ]),
        !links || !links.length ? null : tr({}, [
          th({
            class: 'text-center',
            colspan: '100%'
          }, [
            div({
              class: 'row gx-1 justify-content-center'
            }, (links || []).map(X =>
              div({
                class: 'col-auto'
              }, [
                ctrl({
                  ...X,
                  data: () => ({
                    rows: state.rows,
                    checked: state.checked,
                    F,
                    group: state.group,
                    setGroup: g => {
                      state.group = g
                      update()
                    }
                  })
                })
              ])
            ))
          ])
        ]),
        !state.limit ? null : tr({}, [
          td({
            class: 'text-center',
            colspan: '100%'
          }, [
            refs.pager = ctrl({
              ui: 'pagination'
            })
          ])
        ]),
        state.noSearch && !hasTotals ? null : tr({}, [
          th({
            class: 'text-center',
            colspan: '100%'
          }, [
            div({
              class: 'row gx-1 justify-content-center'
            }, [
              state.noSearch ? null : div({
                class: 'col-auto'
              }, [
                ctrl({
                  type: 'string',
                  description: '🔎',
                  noValid: true,
                  title: 'search',
                  default: state.search,
                  delay: 500,
                  update: (err, v) => {
                    if (!err && v != state.search) {
                      state.search = v
                      update()
                    }
                  }
                })
              ])
            ])
          ])
        ]),
        !hasTotals ? null : tr({}, [
          state.noCheck ? null : td({
            dataCtx: 'groupHide'
          })
        ].concat(rowLinks.map(() =>
          td({
            dataCtx: 'groupHide'
          })
        )).concat(K.map(k =>
          td({
            class: 'text-center align-middle',
            dataCtx: 'totals:'+k
          })
        ))),
        tr({}, [
          !hasTotals || state.noCheck ? null : th({
            class: 'text-center align-middle',
            dataCtx: 'groupHide'
          }, [
            ctrl({
              size: 'sm',
              link: 'success',
              icon: 'check',
              href: () => {
                (state.base || []).forEach(row => {
                  row.checked = !row.checked
                })
                update()
              }
            })
          ])
        ].concat(rowLinks.map(({icon, title}) =>
          th({
            class: 'text-center align-middle',
            dataCtx: 'groupHide'
          }, [
            tag({
              icon,
              title: icon ? '' : title
            })
          ])
        )).concat(K.map(k =>
          th({
            class: 'text-center align-middle'
          }, [
            span({
              title: P[k].description,
              dataCtx: 'field:'+k
            }, [
              text(P[k].title || k)
            ]),
            state.noSort ? null : text(' '),
            state.noSort ? null : a({
              dataCtx: 'sort:'+k,
              href: 'javascript:;',
              onclick: () => {
                state.sort = (state.sort == k ? '-' : '')+k
                update(true)
              }
            })
          ])
        )))
      ]),
      tbody()
    ])
  )

  const update = prevent => {
    const x = tbl.querySelector('tbody')
    x.innerHTML = ''
    const {view, totals, pages} = engine(state, M)
    if (view) {
      tbl.querySelectorAll('[data-ctx^="sort:"]').forEach(f => {
        const k = f.getAttribute('data-ctx').substr(5)
        const s = state.sort
        f.innerHTML = ''
        f.appendChild(tag({
          icon: 'sort'+(s == k ? '-down' : s == '-'+k ? '-up' : '')
        }))
      })

      if (state.limit) {
        if (!prevent) {
          refs.pager.replaceWith(ctrl({
            ui: 'pagination',
            noValid: true,
            default: state.page,
            maximum: pages,
            update: (err, v) => {
              if (!err && v && v != state.page) {
                state.page = v
                update(true)
              }
            },
            init: el => refs.pager = el
          }))
        }
      }

      tbl.querySelectorAll('[data-ctx="groupHide"]')
        .forEach(g => {
          g.classList[state.group ? 'add' : 'remove']('d-none')
        })

      const H = K.filter(
        k => state.group && state.group.indexOf(k) < 0 && U.indexOf(k) < 0 
      )
      K.forEach(k => {
        tbl.querySelectorAll(
          '[data-ctx="field:'+k+'"], [data-ctx="totals:'+k+'"]'
        ).forEach(g => {
          g.closest('th,td')
            .classList[H.indexOf(k) < 0 ? 'remove' : 'add']('d-none')
        })
      })

      tbl.querySelectorAll('[data-ctx^="totals:"]').forEach(t => {
        const k = t.getAttribute('data-ctx').substr(7)
        t.innerHTML = ''
        if (totals[k] != null) {
          t.appendChild(ctrl({
            ...P[k],
            readOnly: true,
            href: null,
            default: totals[k]
          }))
        }
      })

      view.forEach(row => {
        x.appendChild(e(({tr, td, a, text}) =>
          tr({
            title: I.map(k => row[k]).join('\n')
          }, [
            state.group || !hasTotals || state.noCheck ? null : td({
              class: 'text-center align-middle'
            }, [
              ctrl({
                type: 'boolean',
                noValid: true,
                default: !!row.checked,
                update: (err, v) => {
                  if (!err && !!row.checked !== v) {
                    row.checked = v
                    update()
                  }
                }
              })
            ])
          ].concat(rowLinks.map(L =>
            state.group ? null : td({
              class: 'text-center align-middle'
            }, [
              ctrl({
                ...L,
                size: 'sm',
                title: L.icon ? '' : L.title,
                data: row
              })
            ])
          )).concat(K.filter(k => H.indexOf(k) < 0).map(k =>
            td({
              class: 'align-middle text-'+
                (P[k].ui == 'text' ? 'left' : 'center'),
              style: P[k].ui == 'color' && row[k] && typeof row[k] == 'string' ?
                  'background-color:'+F[k](row[k]) : null,
              title: P[k].ui == 'color' ? row[k] : null
            }, [
              P[k].ui == 'color' ? null : ctrl({
                ...P[k],
                readOnly: true,
                href: state.group ? null : P[k].href,
                default: row[k],
                data: row,
                size: P[k].href && !state.group && P[k].link ? 'sm' : null
              })
            ])
          )))
        ))
      })
    } else {
      tbl.querySelectorAll('[data-ctx^="totals:"]').forEach(t => {
        const k = t.getAttribute('data-ctx').substr(7)
        const v = totals[k]
        t.textContent = v != null ? v : '' 
      })
      x.appendChild(e(({tr, td}) =>
        tr({}, [
          td({
            colspan: '100%'
          }, [
            spinner()
          ])
        ])
      ))
    }
  }
  update()

  tbl.setData = data => {
    state.data = data
    update()
  }

  return tbl
}
