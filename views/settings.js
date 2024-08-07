import deps from '../dependencies.js' 

const themes = [
  "Default",
  "Cerulean",
  "Cosmo",
  "Cyborg",
  "Darkly",
  "Flatly",
  "Journal",
  "Litera",
  "Lumen",
  "Lux",
  "Materia",
  "Minty",
  "Morph",
  "Pulse",
  "Quartz",
  "Sandstone",
  "Simplex",
  "Sketchy",
  "Slate",
  "Solar",
  "Spacelab",
  "Superhero",
  "United",
  "Vapor",
  "Yeti",
  "Zephyr"
].map(theme => ({
  value: theme == 'Default' ? deps.bootstrap.css : 
    deps.bootstrap.theme(theme.toLowerCase()),
  label: theme
}))

const variants = [
  {value: 'bg-dark navbar-dark', label: 'Dark'},
  {value: 'bg-dark navbar-light', label: 'Dark Inverted'},
  {value: 'bg-light navbar-light', label: 'Light'},
  {value: 'bg-light navbar-dark', label: 'Light Inverted'},
  {value: 'bg-primary navbar-dark', label: 'Primary'},
  {value: 'bg-primary navbar-light', label: 'Primary Inverted'},
  {value: 'bg-secondary navbar-dark', label: 'Secondary'},
  {value: 'bg-secondary navbar-light', label: 'Secondary Inverted'},
  {value: 'bg-success navbar-dark', label: 'Success'},
  {value: 'bg-success navbar-light', label: 'Success Inverted'},
  {value: 'bg-danger navbar-dark', label: 'Danger'},
  {value: 'bg-danger navbar-light', label: 'Danger Inverted'},
  {value: 'bg-warning navbar-dark', label: 'Warning'},
  {value: 'bg-warning navbar-light', label: 'Warning Inverted'},
  {value: 'bg-info navbar-dark', label: 'Info'},
  {value: 'bg-info navbar-light', label: 'Info Inverted'},
]

const bg = [
  {value: 'text-body-secondary', label: 'Raw'},
  {value: 'text-bg-dark', label: 'Dark'},
  {value: 'text-bg-light', label: 'Light'},
  {value: 'text-bg-primary', label: 'Primary'},
  {value: 'text-bg-secondary', label: 'Secondary'},
  {value: 'text-bg-success', label: 'Success'},
  {value: 'text-bg-danger', label: 'Danger'},
  {value: 'text-bg-warning', label: 'Warning'},
  {value: 'text-bg-info', label: 'Info'}
]

const langs = [
  {value: 'en', label: 'English'},
  {value: 'pt', label: 'Português'}
]

export default ({render, form, home, html}) => {
  const getNav = () => document.body.querySelector('nav.navbar')
  const getCss = nav => nav.getAttribute('class')
    .split(' ')
    .map(css => css.trim())
    .filter(css => /^bg-[a-z]+$/.test(css) || /^navbar-[a-z]+$/.test(css))
    .join(' ')
  const getFooter = () => document.body.querySelector('footer')

  const getTarget = href => !href || href.indexOf('://') < 0 ? null :
    '_blank'

  const getIcon = icon => 'fa-'+
    (icon.substr(0, 1) == '@' ? 'brands' : 'solid')+
    ' fa-'+
    (icon.substr(0, 1) == '@' ? icon.substr(1) : icon)

  const readIcon = i => {
    const cls = i?.getAttribute('class') || ''
    const prefix = cls.startsWith('fa-brands fa-') ? '@' :
      cls.startsWith('fa-solid fa-') ? '' : false

    return prefix !== false ? prefix+cls.split(' ')[1].substr(3) : ''
  }

  const navLinks = links => !links || !links.length ? '' : html(({
    ul, li, a, i, span, text
  }) => 
    ul({
      class: [
        'navbar-nav',
        'ms-auto'
      ]
    }, links.map(({
      title,
      icon,
      description,
      href,
      children
    }) => children instanceof Array && children.length ?
      li({
        class: [
          'nav-item',
          'dropdown'
        ],
        dataPawPath: title || null
      }, [
        a({
          class: [
            'nav-link',
            'dropdown-toggle'
          ],
          dataPawActive: 'active',
          dataBsToggle: 'dropdown',
          role: 'button',
          ariaExpanded: 'false',
          title: description || null
        }, [
          !icon ? null : i({
            class: getIcon(icon)
          }),
          text(title)
        ]),
        ul({
          class: 'dropdown-menu'
        }, children.map(({
          title,
          description,
          icon,
          href
        }) => 
          li({
            dataPawPath: title || null
          }, [
            a({
              href,
              target: getTarget(href),
              class: 'dropdown-item',
              dataPawActive: 'active',
              title: description || null
            }, [
              span({
                dataBsToggle: 'collapse',
                dataBsTarget: '.navbar-collapse.show'
              }, [
                !icon ? null : i({
                  class: getIcon(icon)
                }),
                text(title)
              ])
            ])
          ])
        ))
      ]) :
      li({
        class: 'nav-item',
        dataPawPath: title || null
      }, [
        a({
          href,
          target: getTarget(href),
          class: 'nav-link',
          dataPawActive: 'active',
          title: description || null
        }, [
          span({
            dataBsToggle: 'collapse',
            dataBsTarget: '.navbar-collapse.show'
          }, [
            !icon ? null : i({
              class: getIcon(icon)
            }),
            text(title)
          ])
        ])
      ])
    ))
  )

  const footerLinks = links => links.map(({
    href,
    icon,
    title,
    description
  }) => html(({
    li, a, i, text
  }) =>
    li({
      class: 'nav-item'
    }, [
      a({
        href,
        class: [
          'nav-link',
          'px-2',
          'text-reset'
        ],
        target: getTarget(href),
        title: description || null
      }, [
        !icon ? null : i({
          class: getIcon(icon)
        }),
        title
      ])
    ])
  )).join('\n')

  const rebuild = (doc, {
    pageTitle,
    description,
    copyright,
    lang,
    theme,
    navbar,
    links,
    linksFooter,
    variantFooter
  }) => {
    [document.body, home].forEach(e => {
      e.querySelectorAll('[data-paw-text=title]').forEach(e => {
        e.textContent = pageTitle
      })
      e.querySelectorAll('[data-paw-text=description]').forEach(e => {
        e.textContent = description
      })
    })
    document.title = pageTitle 
    document.documentElement.lang = lang
    document.getElementById('theme').setAttribute('href', theme)
    const nav = getNav()
    nav.setAttribute('class',
      nav.getAttribute('class').replace(getCss(nav), navbar)
    )
    nav.querySelector('.navbar-collapse').innerHTML = navLinks(links)
    
    const f = getFooter()
    const Css = f.getAttribute('class').split(' ')
    Css.shift()

    f.querySelector('p').innerHTML = copyright
    f.querySelector('ul').innerHTML = footerLinks(linksFooter)
    f.setAttribute('class', [variantFooter].concat(Css).join(' '))
  }

  return render(form({
    css: 'container my-5',
    icon: 'cog',
    title: 'Settings',
    description: 'Setup your preferences!',
    type: 'object',
    block: true,
    properties: {
      pageTitle: {
        title: 'Title',
        type: 'string',
        default: document.title,
        minLength: 1
      },
      description: {
        title: 'Description',
        type: 'string',
        default: home
          .querySelector('[data-paw-text="description"]')?.textContent
      },
      lang: {
        title: 'Lang',
        type: 'string',
        options: langs,
        default: document.documentElement.lang
      },
      theme: {
        title: 'Theme',
        type: 'string',
        options: themes,
        default: document.getElementById('theme').getAttribute('href')
      },
      navbar: {
        title: 'Navbar',
        type: 'string',
        options: variants,
        default: getCss(getNav())
      },
      links: {
        title: 'Links',
        size: 'sm',
        items: {
          properties: {
            icon: {
              title: 'Icon',
              type: 'string',
              ui: 'icon'
            },
            title: {
              title: 'Title',
              type: 'string'
            }, 
            description: {
              title: 'Description',
              type: 'string'
            }, 
            href: {
              title: 'Href attribute',
              type: 'string'
            },
            children: {
              title: 'Items',
              items: {
                properties: {
                  icon: {
                    title: 'Icon',
                    type: 'string',
                    ui: 'icon'
                  },
                  title: {
                    title: 'Title',
                    type: 'string'
                  }, 
                  description: {
                    title: 'Description',
                    type: 'string'
                  }, 
                  href: {
                    title: 'Href attribute',
                    type: 'string'
                  }
                }
              }
            }
          }
        },
        default: Array.from(document.body.
          querySelector('nav')?.
          querySelector('.navbar-collapse')?.
          querySelectorAll('li.nav-item') || []
        ).map(li => ({
          li,
          a: li.querySelector('a')
        })).map(({li, a}) => ({
          title: li.getAttribute('data-paw-path'),
          description: a?.getAttribute('title') || '',
          icon: readIcon(a?.querySelector('i')),
          href: a?.getAttribute('href'),
          children: Array.from(li.
            querySelector('ul.dropdown-menu')?.
            querySelectorAll('li') || []
          ).map(li => ({
            li,
            a: li.querySelector('a')
          })).map(({li, a, icon}) => ({
            title: li.getAttribute('data-paw-path'),
            description: a?.getAttribute('title') || '',
            icon: readIcon(a?.querySelector('i')),
            href: a?.getAttribute('href')
          }))
        }))
      },
      linksFooter: {
        title: 'Footer Links',
        size: 'sm',
        items: {
          properties: {
            icon: {
              title: 'Icon',
              type: 'string',
              ui: 'icon'
            },
            title: {
              title: 'Title',
              type: 'string'
            }, 
            description: {
              title: 'Description',
              type: 'string'
            }, 
            href: {
              title: 'Href attribute',
              type: 'string'
            }
          }
        },
        default: Array.from(document.body.
          querySelector('footer')?.
          querySelectorAll('li.nav-item') || []
        ).map(li => ({
          li,
          a: li.querySelector('a')
        })).map(({li, a}) => ({
          title: a?.textContent?.trim() || '',
          description: a?.getAttribute('title') || '',
          icon: readIcon(a?.querySelector('i')),
          href: a?.getAttribute('href')
        }))
      },
      variantFooter: {
        title: 'Footer',
        type: 'string',
        options: bg,
        default: getFooter().getAttribute('class')?.split(' ')[0]
      },
      copyright: {
        title: 'Footer Note',
        type: 'string',
        default: document.body.
          querySelector('footer')?.
          querySelector('p')?.
            innerHTML.trim()
      }
    },
    update: (err, Data) => err ? null : rebuild(document, Data),
    download: 'index.html',
    mime: 'text/html',
    submit: ({
      theme,
      lang,
      pageTitle,
      description,
      navbar,
      links,
      linksFooter,
      variantFooter,
      copyright
    }) => html(({
      html,
      head,
      meta,
      link,
      script,
      title,
      text,
      body,
      nav,
      div,
      ul,
      li,
      a,
      i,
      span,
      main,
      h1,
      p,
      footer
    }) => html({
      lang: lang
    }, [
      head({}, [
        meta({
          charset: 'utf-8'
        }),
        meta({
          httpEquiv: 'x-ua-compatible',
          content: 'ie=edge'
        }),
        meta({
          name: 'viewport',
          content: 'width=device-width, initial-scale=1'
        }),
        link({
          rel: 'icon',
          href: 'favicon.ico',
          sizes: 'any'
        }),
        link(deps.fontawesome),
        link({
          id: 'theme',
          rel: 'stylesheet',
          href: theme
        }),
        script(deps.bootstrap.js),
        title({}, [
          text(pageTitle)
        ])
      ]),
      body({
        class: 'min-vh-100 d-flex flex-column'
      }, [
        nav({
          class: [
            'navbar',
            'navbar-expand-lg',
            navbar
          ]
        }, [
          div({
            class: 'container-fluid'
          }, [
            ul({
              class: 'navbar-nav'
            }, [
              li({
                class: 'nav-item'
              }, [
                a({
                  href: '#sidebar',
                  class: [
                    'nav-link',
                    'invisible'
                  ],
                  dataBsToggle: 'offcanvas',
                  role: 'button',
                  ariaControls: 'sidebar'
                }, [
                  i({
                    class: [
                      'fa-solid',
                      'fa-bars'
                    ]
                  })
                ])
              ])
            ]),
            a({
              class: 'navbar-brand',
              href: '#/',
              dataPawText: 'title'
            }, [
              text(pageTitle)
            ]),
            span({
              class: 'navbar-text',
              dataPawText: 'current'
            }),
            a({
              class: [
                'navbar-toggler',
                'border-0'
              ],
              dataBsToggle: 'collapse',
              dataBsTarget: '.navbar-collapse',
              role: 'button'
            }, [
              i({
                class: [
                  'fa-solid',
                  'fa-ellipsis-vertical'
                ]
              })
            ]),
            div({
              class: [
                'collapse',
                'navbar-collapse'
              ]
            }, [
              navLinks(links)
            ])
          ])
        ]),
        main({}, [
          div({
            class: [
              'container',
              'my-5'
            ]
          }, [
            h1({
              dataPawText: 'title'
            }, [
              text(pageTitle)
            ]),
            p({
              class: [
                'lead',
                'text-body-secondary'
              ],
              dataPawText: 'description'
            }, [
              text(description)
            ])
          ])
        ]),
        footer({
          class: [
            variantFooter, 
            'mt-auto'
          ]
        }, [
          div({
            class: [
              'container',
              'py-5'
            ]
          }, [
            ul({
              class: [
                'nav',
                'justify-content-center',
                'border-bottom',
                'pb-3',
                'mb-3'
              ]
            }, [
              footerLinks(linksFooter)
            ]),
            p({
              class: [
                'text-center'
              ]
            }, [
              copyright
            ])
          ])
        ]),
        script({
          type: 'module',
          src: 'app.js'
        })
      ])
    ]))
  }))
}
