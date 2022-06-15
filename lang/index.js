import en from './en.js'
import pt from './pt.js'

const wrap = X => Object.keys(X).reduce((R, key) => {
  R[key] = X[key] instanceof Array ? X[key].join('\n') : X[key] 
  return R
}, {})

export default {
  en: wrap(en),
  pt: wrap(pt)
}
