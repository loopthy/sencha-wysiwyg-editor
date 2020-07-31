Ext.define('Wysiwyg.view.toolbox.ToolboxView', {
    extend: 'Ext.Panel',
    xtype: 'toolboxview',

    requries: [
        'Ext.dataview.plugin.ItemTip',
    ],

    controller: 'toolboxview',
    viewModel: {
        type: 'toolboxview'
    },

    layout: 'fit',

    cls: 'toolbox-view',

    title: 'Toolbox',

    items: [{
        xtype: 'fieldset',
        docked: 'top',
        items: [{
            xtype: 'searchfield',
            ui: 'solo',
            placeholder: 'Filter components',
            listeners: {
                buffer: 500,
                clearicontap: 'onSearchClear',
                change: 'onSearchChange'
            }
        }]
    },  {
        xtype: 'list',
        reference: 'list',
        cls: 'toolboxview-list',
        indexBar: false,
        itemTpl: '{name}',
        collapsible: {
            collapsed: false
        },
        grouped: true,
        pinHeaders: false,
        // itemConfig: {
        //     bind: {}
        // },
        bind: {
            store: '{projectComponents}'
        },
        plugins: {
            dataviewtip: {
                align: 'tr-bl?',
                maxHeight: 200,
                width: 300,
                scrollable: 'y',
                delegate: '.x-listitem',
                allowOver: true,
                anchor: true,
                bind: '{record}',
                cls: 'toolboxview-tooltip',
                tpl: `<div classs='toolview-tooltip-title'>{name}</div><div>{text}</div>`
            }
        }
    }],

    initialize: function() {
        const me = this

        me.callParent(arguments)
        const list = me.getItems().getAt(0)
        me.listRelayers = me.relayEvents(list, ['select'])
    },

    doDestroy: function() {
        const me = this

        Ext.destroy(me.listRelayers)
        me.callParent(arguments)
    }
})