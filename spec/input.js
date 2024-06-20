import ctrl from '../src/ctrl/index.js'

const d = new Date()
const iso = d.toISOString().substr(0, 10)
const iso_min = d.getFullYear()+'-'+('0'+(d.getMonth() + 1)).slice(-2)+'-01'
const unix = Math.round(d.getTime() / 1000)
const unix_min = (d.getTime() - 24 * 60 * 60 * 1000) / 1000
const unix_max = (d.getTime() + 7 * 24 * 60 * 60 * 1000) / 1000

const update = (err, v) => {
  console.log(err)
  console.log(v)
}
export default ({
  icon: 'pencil',
  title: 'input',
  description: 'Form inputs.',
  component: ctrl,
  properties: {},
  examples: [
    {
      title: 'Raw Boolean',
      data: [
        {
          type: 'boolean',
          default: true,
          update
        }
      ],
      html: 
`<div>
  <input type="checkbox" class="form-check-input is-valid">
  <div class="invalid-feedback"></div>
</div>`
    }, {
      title: 'Raw String',
      data: [
        {
          type: 'string',
          default: 'test',
          minLength: 1,
          maxLength: 5,
          update
        }
      ],
      html: 
`<div>
  <input
    type="text"
    class="form-control is-valid"
  >
  <div class="invalid-feedback"></div>
</div>`
    }, {
      title: 'Raw Integer',
      data: [
        {
          type: 'integer',
          default: 7,
          update
        }
      ],
      html: 
`<div>
  <input
    type="number"
    step="1"
    class="form-control is-valid"
  >
  <div class="invalid-feedback"></div>
</div>`
    }, {
      title: 'Raw Number',
      data: [
        {
          type: 'number',
          default: 2.7,
          update
        }
      ],
      html: 
`<div>
  <input
    type="number"
    class="form-control is-valid"
  >
  <div class="invalid-feedback"></div>
</div>`
    }, {
      title: 'A currency example with precision',
      data: [
        {
          type: 'number',
          minimum: 0,
          ui: 'num.2',
          update
        }
      ],
      html: 
`<div>
  <input
    type="number"
    step="0.01"
    min="0.00"
    class="form-control is-valid"
  >
  <div class="invalid-feedback"></div>
</div>`
    }, {
      title: 'Integer representing a currency',
      data: [
        {
          type: 'integer',
          ui: 'num.2',
          default: 699,
          minimum: 698,
          maximum: 710,
          update
        }
      ],
      html:
`<div>
  <input
    type="number"
    step="0.01"
    min="6.98"
    max="7.10"
    class="form-control is-valid"
  >
  <div class="invalid-feedback"></div>
</div>`
    }, {
      title: 'A boolean with integer type',
      data: [
        {
          type: 'integer',
          ui: 'bool',
          default: 1,
          update
        }
      ],
      html: 
`<div>
  <input
    type="text"
    class="form-control is-valid"
    list="app.data.list"
  >
  <div class="invalid-feedback"></div>
  <datalist id="app.data.list">
    <option value="No"></option>
    <option value="Yes"></option>
  </datalist>
</div>`
    }, {
      title: 'A date string using ISO dates',
      data: [
        {
          type: 'string',
          ui: 'date',
          default: iso,
          minimum: iso_min,
          update
        }
      ],
      html: 
`<div>
  <input
    type="date"
    min="${iso_min}"
    class="form-control is-valid"
  >
  <div class="invalid-feedback"></div>
</div>`
    }, {
      title: 'A date integer using Unix timestamp',
      data: [
        {
          type: 'integer',
          ui: 'date',
          default: unix,
          minimum: unix_min,
          maximum: unix_max,
          update
        }
      ],
      html:
`<div>
  <input
    type="date"
    min="${new Date(unix_min * 1000).toISOString().substr(0, 10)}"
    max="${new Date(unix_max * 1000).toISOString().substr(0, 10)}"
    class="form-control is-valid"
  >
  <div class="invalid-feedback"></div>
</div>`
    }, {
      title: 'A multiline text string',
      data: [
        {
          type: 'string',
          ui: 'text',
          default: 'Text is used for store multiline text!\nAs you can see it!',
          minLength: 1,
          update
        }, {
          type: 'string',
          ui: 'info',
          default: 'Text is used for store multiline text!\nAs you can see it!',
          minLength: 1,
          update
        }
      ],
      html:
`<div>
  <textarea
    class="form-control is-valid"
    rows="6"
  ></textarea>
  <div class="invalid-feedback"></div>
</div>`
    }, {
      title: 'A password string',
      data: [
        {
          type: 'string',
          ui: 'password',
          default: 'secret',
          minLength: 5,
          maxLength: 10,
          update
        }
      ]
    }, {
      title: 'An array of files',
      data: [
        {
          type: 'array',
          ui: 'file',
          update
        }
      ]
    }, {
      title: 'Raw FileList',
      data: [
        {
          ui: 'file',
          type: 'FileList',
          update
        }
      ]
    }, {
      title: 'Bootstrap btn string',
      data: [
        {
          type: 'string',
          ui: 'link',
          default: 'primary',
          update
        }
      ]
    }, {
      title: 'FontAwesome icon string',
      data: [
        {
          type: 'string',
          ui: 'icon',
          default: 'check',
          update
        }
      ]
    }, {
      title: 'Bootstrap navbar class string',
      data: [
        {
          type: 'string',
          ui: 'navbar',
          default: 'Dark',
          update
        }
      ]
    }, {
      title: 'Bootswatch theme string',
      data: [
        {
          type: 'string',
          ui: 'theme',
          default: 'Simplex',
          update
        }
      ]
    }, {
      title: 'Lang string',
      data: [
        {
          type: 'string',
          ui: 'lang',
          default: 'pt',
          update
        }
      ]
    }, {
      title: 'UI string',
      data: [
        {
          type: 'string',
          ui: 'ui',
          default: 'ui',
          update
        }
      ]
    }
  ]
})
