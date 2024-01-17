import e from '../e.js'
import {iconify} from '../lib.js'

export default ({children}) => e(({div, a, ul, li, i, text}) => 
  div({
    class: 'collapse navbar-collapse'
  }, [
    ul({
      class: 'navbar-nav ms-auto'
    }, children.map(({children, href, icon, title}) => children ?
      li({
        class: 'nav-item dropdown',
        dataAppTitle: title
      }, [
        a({
          class: 'nav-link dropdown-toggle',
          dataAppActive: 'active',
          dataBsToggle: 'dropdown',
          role: 'button',
          ariaExpanded: 'false'
        }, [
          icon ? i({class: iconify(icon)}) : null,
          icon && title ? text(' ') : null,
          text(title)
        ]),
        ul({
          class: 'dropdown-menu'
        }, children.map(({href, icon, title}) => 
          li({
            dataAppTitle: title
          }, [
            a({
              class: 'dropdown-item',
              dataAppActive: 'active',
              href
            }, [
              icon ? i({class: iconify(icon)}) : null,
              icon && title ? text(' ') : null,
              text(title)
            ])
          ])
        ))
      ]) : li({
        class: 'nav-item',
        dataAppTitle: title
      }, [
        a({
          class: 'nav-link',
          dataAppActive: 'active',
          href
        }, [
          icon ? i({class: iconify(icon)}) : null,
          icon && title ? text(' ') : null,
          text(title)
        ])
      ])
    ))
  ])
)
