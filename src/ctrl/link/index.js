import {node, ctrl} from '../../components.js'
import opt from '../options.js'

export default ({
  context,
  href,
  size,
  data,
  description,
  download,
  mime,
  links,
  ...extra
}) => {
  const hasDrop = links instanceof Array
  const hasLinks = hasDrop && links.length
  const isDisabled = !href && !hasLinks
  const hasSplit = href && hasDrop
  const isBtn = typeof href != 'string' || (hasDrop && !hasSplit)

  size = ['lg', 'sm'].indexOf(size) < 0 ? '' : size
  context = opt('context', true).indexOf(context) >= 0 ? context :
    isBtn ? 'primary' :
      size || isDisabled ? 'link' : ''

  const run = typeof href == 'function' ? href : null
  const resolve = () => typeof data == 'function' ? data() : data

  if (isBtn) {
    href = null
  } else if (!href) {
    href = 'javascript:;'
  } else {
    const X = resolve()
    href = href.replace(/{([^{}]*)}/g, (a, b) => X &&
      (typeof X[b] == 'string' || typeof X[b] == 'number') ? X[b] : a
    )
  }
  const target = typeof href == 'string' && href.indexOf('://') > 0 ?
    '_blank' : null

  const spinner = !run ? null : node(({span}) =>
    span({
      class: 'spinner-border spinner-border-sm',
      ariaHidden: 'true'
    })
  )
  const toggle = pending => {
    btn.classList[pending ? 'add' : 'remove']('disabled')

    if (pending) {
      if (icon) {
        icon.replaceWith(spinner)
      } else {
        btn.prepend(spinner)
      }
    } else {
      if (icon) {
        spinner.replaceWith(icon)
      } else {
        btn.removeChild(spinner)
      }
    }
  }
  const onclick = !run ? null : () => {
    Promise.resolve().then(() => {
      toggle(true)
      return run(resolve())
    }) .then(data => {
      toggle(false)
      if (trigger && data) {
        const href = trigger.getAttribute('href')
        trigger.setAttribute('href', href+encodeURIComponent(data))
        trigger.click()
        trigger.setAttribute('href', href)
      }
    }).catch(err => {
      toggle(false)
      throw err
    })
  }

  const btn = node(({button, a, span}) => (isBtn ? button : a)({
    class: [
      context ? 'btn btn-'+context : '',
      size ? 'btn-'+size : '',
      isDisabled ? 'disabled' : '',
      hasDrop && !hasSplit ? 'dropdown-toggle' : ''
    ],
    title: description || null,
    type: isBtn ? 'button' : null,
    onclick,
    href,
    target,
    dataBsToggle: hasDrop && !hasSplit ? 'dropdown' : null,
    ariaExpanded: hasDrop && !hasSplit ? 'false' : null
  }, [
    ctrl(extra),
    !download || !mime ? null : a({
      class: 'd-none',
      href: `data:${mime},`,
      download,
      onclick: ev => {
        ev.stopPropagation()
      }
    })
  ])) 
  const trigger = btn.querySelector('a.d-none')
  const icon = btn.querySelector('i')

  return !hasDrop ? btn : node(({div, ul, li, a, button}) => 
    div({
      class: 'btn-group'
    }, [
      btn,
      !hasSplit ? null : button({
        class: [
          context ? 'btn btn-'+context : '',
          size ? 'btn-'+size : '',
          !hasLinks ? 'disabled' : '',
          'dropdown-toggle',
          'dropdown-toggle-split'
        ],
        type: 'button',
        dataBsToggle: 'dropdown',
        ariaExpanded: 'false'
      }),
      ul({
        class: 'dropdown-menu'
      }, links.map(({href, ...extra}) => 
        li({}, [
          a({
            class: [
              'dropdown-item',
              !href ? 'disabled' : ''
            ],
            href: href && typeof href == 'string' ? href : 'javascript:;',
            onclick: typeof href != 'function' ? null : href,
            ariaDisabled: !href ? 'true' : null
          }, [
            ctrl(extra)
          ])
        ])
      ))
    ])
  )
}
