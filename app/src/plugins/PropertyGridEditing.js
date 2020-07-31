Ext.define('Wysiwyg.plugins.PropertyGridEditing', {
    extend: 'Ext.grid.plugin.CellEditing',
    alias: ['plugin.propertygridediting'],

    nameField: 'name',
    typeField: 'type',
    valueField: 'value',

    primitives: ['boolean', 'integer', 'number', 'string', 'object', 'array'],

    fieldDefaults: {
        default: {
            xtype: 'textfield',
            autoComplete: false,
            textAlign: undefined
        },
        'boolean': {
            xtype: 'selectfield',
            autoComplete: false,
            textAlign: undefined,
            options: [{
                text: 'true',
                value: true
            }, {
                text: 'false',
                value: false
            }]
        },
        'date': {
            xtype: 'datefield',
            textAlign: undefined
        },
        'number': {
            xtype: 'numberfield',
            textAlign: undefined
        },
        'integer': {
            xtype: 'numberfield',
            decimals: 0,
            textAlign: undefined
        },
        'enum': {
            xtype: 'selectfield',
            autoComplete: false,
            textAlign: undefined,
        },
        'function': {
            xtype: 'selectfield',
            autoComplete: false,
            textAlign: undefined,
        },
        'object': {
            xtype: 'propertygridfield'
        }
    },

    editors: {},

    init: function(grid) {
        const me = this

        me.callParent(arguments)
    },

    getValueType: function(value) {
        let type = 'string'

        if (Ext.isDate(value)) {
            type = 'date'
        }
        else if (Ext.isArray(value)) {
            type = 'array'
        }
        else if (Ext.isObject(value)) {
            type = 'object'
        }
        else if (Ext.isNumber(value)) {
            type = 'number'
        }
        else if (Ext.isBoolean(value)) {
            type = 'boolean'
        }
        return type
    },

    getFieldDefaults: function(record) {
        const me = this
        const fieldDefaults = me.fieldDefaults
        const propType = record.get(me.typeField)
        const primitives = me.primitives
        const types = propType.split('/').map(t => t.toLowerCase())
        let fieldType = types[0]
        let config = {}
        let isEnum = false

        if (types.length > 1) {
            isEnum = (types.findIndex(t => primitives.indexOf(t) !== -1) === -1)

            if (isEnum) {
                fieldType = 'enum'
                config = { options: types.map(t => ({ text: t, value: t })) }
            }
        }
        if (fieldType === 'function') {
            const propertyGrid = me.getGrid()
            const methodOptions = propertyGrid.getMethodOptions()

            if (methodOptions && methodOptions.length > 0) {
                const items = record.get('items')
                const argsLength = items.length
                //Func prototype match, for now just filter by args length
                config = { options: methodOptions
                    .filter(method => method.items.length === argsLength)
                    .map(({ name }) => ({ text: name, value: name })) 
                }
            }
        }
        if (!config.options) {
            const propValue = record.get(me.valueField)

            if (propValue) {
                fieldType = me.getValueType(propValue)
            }
        }
        //TODO:
        // if (fieldType === 'object') {
        //     debugger
        // }

        return Ext.apply(config, fieldDefaults[fieldType] ? fieldDefaults[fieldType] : fieldDefaults.default)
    },

    getEditor: function(location) {
        const me = this
        const column = location.column
        const editable = column.getEditable()

        if (editable) {
            const record = location.record
            const propName = record.get(me.nameField)
            let editor = me.editors[propName]

            if (!editor) {
                const field = Ext.create(me.getFieldDefaults(record))

                editor = Ext.create({
                    xtype: 'celleditor',
                    field,
                    plugin: me
                })

                editor.editingPlugin = me
                field.addUi('celleditor')
                //TODO: Uncomment this when all field types has validationField config
                // field.setValidationField(record.getField(propName), record)
            }
            return editor
        }
        return
    }
})