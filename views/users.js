import users from './data/users.js'
import schema from './data/schema.js'
import post from './plugins/post.js'
import count from './plugins/count.js'
import query from './plugins/query.js'
import group from './plugins/group.js'
import exporter from './plugins/exporter.js'
import remove from './plugins/remove.js'
import edit from './plugins/edit.js'

export default (X) => {
  const {render, table, wait} = X

  schema.links[0] = post(X, users)
  schema.links[1] = count(X)
  schema.links[2] = query(X, users)
  schema.links[3] = group(X)
  schema.links[4] = exporter(X)

  schema.items.links[0] = remove(X, users)
  schema.items.links[1] = edit(X, users)

  const tbl = table(schema)
  render(tbl)
  wait(500).then(() => tbl.setData(users))
}
