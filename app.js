import {navbar, route, start} from './index.js'

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
  QUERY: {
    _limit: 10,
    _skip: 0
  }
})
