Ext.define('Wysiwyg.model.View', {
    extend: 'Wysiwyg.model.Object',

    statics: {
        codeTpl: 
`Ext.define('{project.name}.view.{viewPackage.name}.{view.name}', {
    extend: "{view.extend}",

    xtype: "{[values.view.alias.split('.')[1]]}",

    controller: "{[values.viewController.name.toLowerCase()]}",
    viewModel: {
        type: "{[values.viewModel.name.toLowerCase()]}"
    }<tpl if="Object.keys(values.view.overwrittenConfig).length &gt; 0">,
    {[this.applyConfig(values.indent, values.view.overwrittenConfig)]}</tpl><tpl if="view.children.length &gt; 0">,
    {[this.applyItems(values.indent, values.view.children)]}</tpl><tpl if="Object.keys(view.listeners).length &gt; 0">,
    {[this.applyListeners(values.indent, values.view.listeners)]}</tpl>
});`,

        itemsCodeTpl: 
`<tpl if="children.length &gt; 0">
{[this.applyIndent(values.indent)]}items: [<tpl for="children" between=",">
{[this.applyIndent(parent.indent + 1)]}{[this.applyItem(parent.indent + 1, values.alias, values.overwrittenConfig, values.children, values.listeners)]}</tpl>
{[this.applyIndent(values.indent)]}]</tpl>`,

        itemCodeTpl:
`{
{[this.applyIndent(values.indent + 1)]}xtype: "{xtype}",{[this.applyIndent(values.indent + 1)]}{[this.applyConfig(values.indent + 1, values.config)]}<tpl if="values.children.length &gt; 0">,
{[this.applyIndent(values.indent + 1)]}{[this.applyItems(values.indent + 1, values.children)]}</tpl><tpl if="Object.keys(values.listeners).length &gt; 0">,
{[this.applyIndent(values.indent + 1)]}{[this.applyListeners(values.indent + 1, values.listeners)]}</tpl>
{[this.applyIndent(values.indent)]}}`,

        configCodeTpl:
`<tpl for="config" between=",">
{[this.applyIndent(parent.indent)]}{name}: {value}</tpl>`,

        listenersCodeTpl:
`<tpl if="listeners.length &gt; 0">
{[this.applyIndent(values.indent)]}listeners: {<tpl for="listeners" between=",">
{[this.applyIndent(parent.indent + 1)]}{name}: {value}</tpl>
{[this.applyIndent(values.indent)]}}</tpl>`,

},
    isViewRecord: true,

    fields: ['extend'],

    constructor: function() {
        this.uniqueIds = {}
        return this.callParent(arguments)
    },

    applyIndent: function(indent) {
        let str = ''

        for(let i = 0; i < indent; i++) str += '\t'//'&#09;'
        return str
    },

    applyConfig: function(indent, config) {
        const me = this
        const tpl = Wysiwyg.model.View.configCodeTpl
        const applyIndent = me.applyIndent

        return (new Ext.XTemplate(tpl, {
            applyIndent
        })).apply({
            indent,
            config: Object.keys(config).map(name => {
                let value = config[name]

                if (Ext.isString(value)) {
                    value = `"${value}"`
                }
                else if (Ext.isObject(value) || Ext.isArray(value)) {
                    value = Ext.encode(value)
                }
                return { name, value }
            })    
        })
    },

    applyItem: function(indent, alias, config, children, listeners) {
        const me = this
        const tpl = Wysiwyg.model.View.itemCodeTpl
        const applyListeners = me.applyListeners
        const applyItems = me.applyItems
        const applyItem = me.applyItem
        const applyConfig = me.applyConfig
        const applyIndent = me.applyIndent
        
        return (new Ext.XTemplate(tpl, {
            applyIndent,
            applyConfig,
            applyItem,
            applyItems,
            applyListeners
        })).apply({
            indent,
            xtype: alias.split('.')[1],
            config, children, listeners  
        })
    },

    applyItems: function(indent, children) {
        const me = this
        const tpl = Wysiwyg.model.View.itemsCodeTpl
        const applyListeners = me.applyListeners
        const applyItems = me.applyItems
        const applyItem = me.applyItem
        const applyConfig = me.applyConfig
        const applyIndent = me.applyIndent

        return (new Ext.XTemplate(tpl, {
            applyIndent,
            applyConfig,
            applyItem,
            applyItems,
            applyListeners
        })).apply({
            indent,
            children    
        })
    },

    applyListeners: function(indent, listeners) {
        const me = this
        const tpl = Wysiwyg.model.View.listenersCodeTpl
        // const applyItems = me.applyItems
        // const applyItem = me.applyItem
        // const applyConfig = me.applyConfig
        const applyIndent = me.applyIndent

        return (new Ext.XTemplate(tpl, {
            applyIndent,
            // applyConfig,
            // applyItem,
            // applyItems
        })).apply({
            indent,
            listeners: Object.keys(listeners).map(name => {
                const value = `'${listeners[name]}'`
                return { name, value }
            })    
        })
    },

    getSourceCode: function() {
        const me = this
        const tpl = Wysiwyg.model.View.codeTpl
        const project = me.getRoot()
        const viewPackage = me.parentNode
        const viewModel = viewPackage.getViewModel()
        const viewController = viewPackage.getViewController()
        const applyListeners = me.applyListeners
        const applyItems = me.applyItems
        const applyItem = me.applyItem
        const applyConfig = me.applyConfig
        const applyIndent = me.applyIndent

        return (new Ext.XTemplate(tpl, {
            applyIndent,
            applyConfig,
            applyItem,
            applyItems,
            applyListeners
        })).apply({
            indent: 1,
            project: project.getData(), 
            viewPackage: viewPackage.getData(), 
            view: me.getNodeData(), 
            viewModel: viewModel.getData(), 
            viewController: viewController.getData()
        })
    }
})