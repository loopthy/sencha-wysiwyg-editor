Ext.define('Wysiwyg.view.inspector.InspectorView', {
    extend: 'Ext.Panel',
    xtype: 'inspectorview',

    controller: 'inspectorview',
    viewModel: {
        type: 'inspectorview'
    },

    layout: 'fit',

    config: {
        selection: null
    },
    
    cls: 'inspector-view',
    
    title: 'Properties',

    bind: {
        title: 'Properties {selection.instanceName}',
        //twoWayBinding
        selection: '{selection}',
        //In this particular case we are using record to hold visual selection (components, views overriding applyRecord)
        record: '{selection}'
    },

    twoWayBindable: {
        selection: 1
    },

    items: [{
        xtype: 'fieldset',
        docked: 'top',
        items: [{
            xtype: 'searchfield',
            autoComplete: false,
            ui: 'solo',
            placeholder: 'Filter',
            listeners: {
                buffer: 500,
                clearicontap: 'onSearchClear',
                change: 'onSearchChange'
            }
        }]
    }, {
        xtype: 'tabpanel',
        
        tabBar: {
            layout: {
                type: 'hbox',
                pack: 'start'
            },
            animateIndicator: false,
            scrollable: {
                x: true
            }
        },
        tabBarPosition: 'bottom',

        layout: {
            type: 'card',
            animation: false
        },

        bind: {
            hidden: '{!selection}',
        },

        // defaults: {
        //     plugins: {
        //         dataviewtip: {
        //             align: 'tl-bl',
        //             maxHeight: 200,
        //             width: 300,
        //             scrollable: 'y',
        //             delegate: '.x-listitem',
        //             allowOver: true,
        //             anchor: true,
        //             bind: '{record}',
        //             cls: 'toolboxview-tooltip',
        //             tpl: `{text}`
        //         }
        //     }
        // },

        items: [{
            xtype: 'propertygrid',
            title: 'Configs',
            reference: 'configsGrid',
            collapsible: {
                collapsed: false
            },
            // grouped: true,
            bind: {
                store: '{configs}',
                methodOptions: '{methodOptions}'
            },
            listeners: {
                childdoubletap: 'onConfigDoubleTap'
            }
        }, {
            xtype: 'propertygrid',
            title: 'Events',
            reference: 'eventsGrid',
            collapsible: {
                collapsed: false
            },
            // grouped: true,
            bind: {
                store: '{events}',
                methodOptions: '{methodOptions}'
            },
            listeners: {
                childdoubletap: 'onEventDoubleTap'
            }
        }]
    }],

    applyRecord: function(newRecord) {
        if (newRecord instanceof Wysiwyg.model.Component || newRecord instanceof Wysiwyg.model.View) {
            return newRecord
        }
        return this.getRecord()
    }
})