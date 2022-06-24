import spa from 'https://cdn.jsdelivr.net/gh/marcodpt/spa@2.0.0/index.js'
import query from 'https://cdn.jsdelivr.net/gh/marcodpt/query@0.0.2/index.js'
import jsb from
  'https://cdn.jsdelivr.net/gh/marcodpt/json-schema-bootstrap@0.4.1/index.js'
import ui from
  'https://cdn.jsdelivr.net/gh/marcodpt/json-schema-bootstrap@0.4.1/interfaces.js'
import navbar from 'https://cdn.jsdelivr.net/gh/marcodpt/navbar@0.0.4/index.js'
import graph from 'https://cdn.jsdelivr.net/gh/marcodpt/graph@0.0.3/index.js'
import chart from 'https://cdn.jsdelivr.net/gh/marcodpt/chart@0.0.3/index.js'
import {
  hDom as html
} from 'https://cdn.jsdelivr.net/gh/marcodpt/h@1.0.0/index.js'

const interfaces = [''].concat(Object.keys(ui)
  .filter(key => [
    'null',
    'boolean',
    'integer',
    'number',
    'string',
    'object',
    'array',
    'select',
    'card',
    'primary',
    'secondary',
    'success',
    'danger',
    'warning',
    'info',
    'light',
    'dark',
    'data',
    'form',
    'table'
  ].indexOf(key) < 0))

export {
  spa,
  query,
  jsb,
  navbar,
  graph,
  chart,
  html,
  interfaces
}
