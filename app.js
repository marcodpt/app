import {
  navbar, route, start
} from 'https://cdn.jsdelivr.net/gh/marcodpt/app@0.1.10/index.js'

navbar({
  type: 'dark',
  whiteText: true,
  fixed: 'top',
  expand: 'lg',
  image: 'favicon.ico',
  title: 'Serverino',
  home: '#',
  items: [
    {
      icon: 'fas fa-tools',
      title: 'Ferramentas',
      access: ['master'],
      items: [
        {
          icon: 'fas fa-project-diagram',
          title: 'Fluxograma Cliente',
          href: '#/graph/db'
        }, {
          icon: 'fas fa-database',
          title: 'Fluxograma do Sistema',
          href: '#/graph/core'
        }, {
          icon: 'fas fa-chart-line',
          title: 'Exemplo de Gráfico',
          href: '#/chart/tables'
        }, {
          icon: 'fas fa-file',
          title: 'Importar Arquivos',
          href: '#/upload/files'
        }, {
          icon: 'fas fa-paper-plane',
          title: 'Esquema de Requisição',
          href: "javascript:schemaApi('/request')"
        }, {
          icon: 'fas fa-inbox',
          title: 'Esquema de Resposta',
          href: "javascript:schemaApi('/response')"
        }, {
          icon: 'fas fa-table',
          title: 'Dados brutos',
          href: "javascript:schemaApi('')"
        }, {
          icon: 'fas fa-bug',
          title: 'Logs do sistema',
          href: 'javascript:logs()'
        }, {
          icon: 'fas fa-server',
          title: 'Backup do banco de dados',
          href: 'javascript:backup()'
        }
      ]
    },
    "api/get/tables",
    "api/get/users/",
    "api/login/users",
    "api/logout/users"
  ]
})

route('/chart/:id', ({id}, {html, jsb, chart, graph, get, post}) => 
  get('api/get/tables?_filter[]=id~gt~1')
    .then(data => chart((data || []).reduce((R, row) => {
      R.X.push(row.title)
      R.Y[0].data.push(row.count_columns)
      R.Y[1].data.push(row.count_triggers)

      return R
    }, {
      X: [],
      Y: [
        {
          label: 'Colunas',
          borderColor: 'lightgreen',
          data: []
        }, {
          label: 'Gatilhos',
          borderColor: 'blue',
          data: []
        }
      ]
    })))
)

start({
  LANGUAGE: 'pt',
  HOME: '#',
  QUERY: {
    _limit: 10,
    _skip: 0
  },
  ROUTES: {
    tables: {
      links: [
        {
          rel: 'self',
          href: '#/api/post/{name}/0',
          icon: 'fas fa-plus',
          ui: 'btn btn-secondary',
          title: 'Default'
        }
      ],
      hide: []
    },
    triggers: {
      ignore: ['sql']
    },
    columns: {
      ignore: [
        'created',
        'users_id',
        'count_columns',
        'columns_id',
        'description',
        'label',
        'rule',
        'dflt',
        'pattern',
        'minlength',
        'maxlength',
        'minimum',
        'maximum'
      ],
      href: {
        ui: '@interfaces'
      }
    },
    properties: {
      ignore: [
        'description',
        'pattern',
        'minlength',
        'maxlength',
        'minimum',
        'maximum'
      ],
      href: {
        ui: '@interfaces'
      }
    }
  },
  BATCH: {
    delete: {
      title: 'Excluir em lote',
      params: {},
      request: count => {
        const s = count > 1 ? 's' : ''
        return `${count} item${s} selecionado${s}`
      },
      response: (success, error) => {
        const plural = x => x > 1 ? 's' : ''
        const s = plural(success)
        const e = plural(error)
        return [
          !error ? '' : error > 1 ?
            `Ocorreram ${error} erros!` :
            `Ocorreu 1 erro!`,
          !success ? '' : success > 1 ?
            `${success} exclusões realizadas com sucesso!` :
            `1 exclusão realizada com sucesso!`
        ].filter(x => x).join('\n')
      }
    }
  }
})
