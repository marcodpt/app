export default ({graph, get}) => ({id}) => {
  var vertices = ''
  var edges = ''

  if (id == 'db') {
    vertices = 'api/get/columns?name=id&_filter[]=created~gt~0'
    edges = 'api/get/columns?_filter[]=created~gt~0'
  } else {
    vertices = 'api/get/columns?name=id&created=0'
    edges = 'api/get/columns?created=0'+
      '&_filter[]=columns_id~gt~0'+
      '&_filter[]=name~ne~users_id'+
      '&_filter[]=name~nc~booleans_id'+
      '&_filter[]=tag~ge~0'
  }

  const R = {data: []}
  const cast = {}
  return get(vertices).then(data => {
    data.forEach(row => {
      cast[row.tables_id_] = 'v'+row.id
      R.data.push({
        id: 'v'+row.id,
        label: row.tables_id_ || 'defaults',
        info: new Promise(resolve => {
          get('api/get/columns?tables_id='+row.tables_id).then(data => {
            resolve(data.map(row =>
              (row.tag < 0 ?  ':' : row.tag > 0 ? '*' : '')+
                row.name_+': '+(
                  row.precision == 0 ? 'TEXT' :
                  row.precision < 0 ? 'REAL:'+(-row.precision) :
                    'INTEGER'
                )
            ).join('\n'))
          })
        }),
        color: 'black'
      })
    })

    return get(edges)
  }).then(data => {
    data.forEach(row => {
      if (cast[row.tables_id_]) {
        R.data.push({
          id: 'e'+row.id,
          label: row.id_,
          info: row.actions_id_,
          color: row.actions_id_ == 'RESTRICT' ? 'red' : 
            (row.actions_id_ == 'CASCADE' ? 'green' : 'yellow'),
          source: cast[row.tables_id_],
          target: 'v'+row.columns_id
        })
      }
    })

    return graph(R)
  })
}
