import e from '../html/e.js'
import tag from '../tag.js'
import opt from './options.js'

export default ({
  link,
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
  link = opt('link', true).indexOf(link) >= 0 ? link :
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

  const spinner = !run ? null : e(({span}) =>
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

  const btn = e(({button, a, span}) => (isBtn ? button : a)({
    class: [
      link ? 'btn btn-'+link : '',
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
    tag(extra),
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

  return !hasDrop ? btn : e(({div, ul, li, a, button}) => 
    div({
      class: 'btn-group'
    }, [
      btn,
      !hasSplit ? null : button({
        class: [
          link ? 'btn btn-'+link : '',
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
            tag(extra)
          ])
        ])
      ))
    ])
  )
}
