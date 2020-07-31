Ext.define('Wysiwyg.ComponentHandler', {
    singleton: true,

    config: {
        store: null
    },
    //Framework instance requirements
    overwrittenConfigs: {
        //modern
        'Ext.Label': function() {
            return { html: 'Label' }
        },
        'Ext.Chip': function() {
            return { text: 'Chip' } 
        },
        'Ext.Button': function() {
            return { text: 'Button', ripple: false }
        },
        'Ext.Container': () => ({ width: 100, height: 100 }),
        'Ext.Panel': () => ({ width: 100, height: 100 }),
        //classic
        'Ext.button.Button': function() {
            return { text: 'Button' }
        },
        // 'Ext.container.Container': () => ({ width: 100, height: 100 }),
    },

    constructor: function(config) {
        this.initConfig(config)
    },

    sanitizeType: function(type) {
        return type && type.replace(/"|'/g, '')
    },

    convertValue: function(value) {
        if (value === 'null') {
            value = null
        }
        else if (value === 'undefined') {
            value = undefined
        }
        else if (value) {
            try {
                value = JSON.parse(value.replace(/"|'/g, '\"'))
            }
            catch(error) {
                // console.log(error.message)
            }
        }
        return value    
    },

    inheritsConfig: function(componentDefinition, overwrittenConfig = {}) {
        const me = this
        const store = me.getStore()
        const asConfig = (items, group ) => items && items
            .filter(item => !!item.accessor) //bindable?
            .map(({ type, name, value, text, optional, items }) => {
                return { 
                    type: me.sanitizeType(type), 
                    name, 
                    value: me.convertValue(overwrittenConfig[name] || value),
                    defaultValue: me.convertValue(value), 
                    items: items && items.map(({ name, type, text }) => ({ name, type, text })),
                    text, optional, group 
                }
            })

        return componentDefinition.get('extended').reduce((result, name) => {
            const record = store.getData().getSource().findBy(record => record.get('name') === name)

            if (record && record.get('configs')) {
                result = result.concat(asConfig(record.get('configs'), name))
            }
            return result
        }, asConfig(componentDefinition.get('configs'), componentDefinition.get('name')))
    },

    inheritsEvents: function(componentDefinition) {
        const me = this
        const store = me.getStore()
        const asEvents = (items, group) => items ? items
            .map(({ name, preventable, text, items }) => {
                let anonynous = 0

                return {
                    type: 'function', 
                    name, preventable, text, group, value: null,
                    items: items ? items.map(({ name , text, type }, index) => {
                        if (!name) {
                            name = `arg${anonynous > 0 ? anonynous : ''}`
                            anonynous++
                        }
                        name = (name === 'this') ? 'sender' : name

                        return { name, text, type }
                    }) : []
                }
            }) : []

        return componentDefinition.get('extended').reduce((result, name) => {
            const record = store.getData().getSource().findBy(record => record.get('name') === name)

            if (record && record.get('events')) {
                result = result.concat(asEvents(record.get('events'), name))
            }
            return result
        }, asEvents(componentDefinition.get('events'), componentDefinition.get('name')))
    },

    configurator: function(configs) {
        const me = this
        const store = me.getStore()

        return configs
            .filter(item => !item.optional) //conditionals config? Error setX without floated
            .reduce((config, item) => {
                    const { name, value } = item
                    // config[name] = store.convertValue(item.value)
                    config[name] = value
                    return config
            }, {})
    },

    createById: function(id, container, overwrittenDefaults) {
        const me = this
        const store = me.getStore()
        const componentDefinition = store.getById(id)

        return componentDefinition && me.createComponent(componentDefinition, container, overwrittenDefaults)
    },

    createByAlias: function(xtype, container, overwrittenDefaults) {
        const me = this
        const store = me.getStore()
        const componentDefinition = store.getAt(store.findBy(record => {
            const alias = record.get('alias')
            return alias ? (alias.split('.')[1] === xtype) : false
        }))

        return componentDefinition && me.createComponent(componentDefinition, container, overwrittenDefaults)
    },

    createComponent: function(componentDefinition, container, overwritten = {}) {
        const me = this
        const extClass = componentDefinition.get('name')
        const isContainer = (componentDefinition.get('container') === true) //? classic ?
        const { items, dockedItems, ...overwrittenDefaults } = overwritten
        const overwrittenConfig = Ext.apply(me.overwrittenConfigs[extClass] ? me.overwrittenConfigs[extClass].call(me) :  {}, overwrittenDefaults)
        const configs = me.inheritsConfig(componentDefinition, overwrittenConfig)
        const config = Ext.apply(me.configurator(configs), overwrittenConfig)
        const events = me.inheritsEvents(componentDefinition)
        const listeners = {}
        const { name, alias, extends: extend, extended, text, group } = componentDefinition.getData()
        const component = new Wysiwyg.model.Component({
            name, alias, extend, extended, text, group,
            configs, config, overwrittenConfig, events, listeners,
            children: isContainer ? [] : undefined,
            leaf: !isContainer,
            isWidget: true,
            isExtjsWidget: true
        })

        container.appendChild(component)
        
        items && items.forEach(item => {
            const { xtype, ...overwrittenDefaults } = item
            me.createByAlias(xtype, component, overwrittenDefaults)
        })

        // dockedItems && dockedItems.forEach(item => {
        //     const { xtype, ...overwrittenDefaults } = item
        //     me.createByAlias(xtype, component, overwrittenDefaults)
        // })

        return component
    },

    createView: function(name, template) {
        const me = this
        const store = me.getStore()
        const templateView = template.get('view')
        const { extend, items, ...overwrittenConfig } = templateView
        const componentDefinition = store.getRange().find(record => record.get('name') === extend)
        
        const configs = me.inheritsConfig(componentDefinition, overwrittenConfig)
        const config = Ext.apply(me.configurator(configs), overwrittenConfig)
        const events = me.inheritsEvents(componentDefinition)
        const listeners = {}
        const instanceName = `${name}View`
        const alias = `widget.${instanceName.toLocaleLowerCase()}`
        const extended = componentDefinition.get('extended')
        
        const view = new Wysiwyg.model.View({
            instanceName,
            name: instanceName, 
            // iconCls: 'x-fa fa-window-maximize',
            alias, extend, extended, configs, config, overwrittenConfig, events, listeners,
            children: [],
            isExtjsWidget: false,
            isWidget: true,
            mode: 'visual'
        })

        items && items.forEach(item => {
            const { xtype, ...overwrittenDefaults } = item
            me.createByAlias(xtype, view, overwrittenDefaults)
        })

        return view
    }
})