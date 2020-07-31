Ext.define('Wysiwyg.view.main.MainView', {
    extend: 'Ext.Panel',
    xtype: 'mainview',

    requires: [
        'Ext.panel.Resizer',
        'Ext.Toolbar'
    ],

    controller: 'mainviewcontroller',
    viewModel: {
        type: 'mainviewmodel'
    },

    layout: 'fit',

    tbar: [{
        iconCls: 'x-fa fa-folder',
        margin: 2,
        ui: 'raised',
        handler: 'onNewProject'
    }, {
        iconCls: 'x-fa fa-file',
        margin: 2,
        ui: 'raised',
        bind: {
            disabled: '{!project}'
        },
        handler: 'onNewView'
    }, {
        xtype: 'spacer',
        flex: 1
    }, {
        xtype: 'displayfield',
        bind: {
            value: 'ExtJS {project.extVersion} {project.extToolkit} - {project.extTheme}'
        }
    }],

    newProject: {
        xtype: 'dialog',
        title: 'New Project',
        
        closable: true,
        defaultFocus: '#ok',
        maskTapHandler: 'onNewProjectCancel',

        bodyPadding: 8,
        minWidth: 400,

        items: {
            xtype: 'formpanel',
            items: [{
                xtype: 'selectfield',
                label: 'Framework',
                name: 'framework',
                reference: 'framework',
                autoSelect: true,
                required: true,
                valueField: 'id',
                displayField: 'description',
                bind: {
                    store: '{frameworks}'
                }
            }, {
                xtype: 'selectfield',
                label: 'Theme',
                reference: 'theme',
                name: 'theme',
                required: true,
                valueField: 'id',
                displayField: 'description',
                bind: {
                    store: '{themes}'
                }
            }, {
                xtype: 'textfield',
                label: 'Project name',
                reference: 'name',
                name: 'name',
                allowBlank: false,
                required: true
            }, {
                xtype: 'fieldset',
                cls: 'project-dataview-fieldset',
                title: 'Devices',
                margin: '16 0 0 0',
                items: {
                    xtype: 'dataview',
                    inline: {
                        wrap: false
                    },
                    minHeight: 116,
                    selectable: {
                        deselectable: false
                    },
                    itemTpl: `<div class="icon {iconCls}"></div>
                            <div class="name">{name}</div>`,
                    bind: {
                        store: '{devices}',
                        selection: '{device}'
                    }
                }
            }, {
                xtype: 'fieldset',
                cls: 'project-dataview-fieldset',
                title: 'Templates',
                margin: '16 0 0 0',
                items: {
                    xtype: 'dataview',
                    inline: {
                        wrap: false
                    },
                    minHeight: 116,
                    selectable: {
                        deselectable: false
                    },
                    itemTpl: `<div class="icon {iconCls}"></div>
                            <div class="name">{name}</div>`,
                    bind: {
                        store: '{templates}',
                        selection: '{template}'
                    }
                }
            }],
        },

        buttons: {
            ok: 'onNewProjectCreate',
            cancel: 'onNewProjectCancel'
        }
    },

    newView: {
        xtype: 'dialog',
        title: 'New View',

        closable: true,
        defaultFocus: '#ok',
        maskTapHandler: 'onNewViewCancel',

        bodyPadding: 8,
        minWidth: 400,

        items: {
            xtype: 'formpanel',
            items: [{
                xtype: 'textfield',
                placeholder: 'View name',
                name: 'name',
                allowBlank: false,
                required: true
            }, {
                xtype: 'fieldset',
                cls: 'project-dataview-fieldset',
                title: 'Templates',
                margin: '16 0 0 0',
                items: {
                    xtype: 'dataview',
                    inline: {
                        wrap: false
                    },
                    minHeight: 116,
                    selectable: {
                        deselectable: false
                    },
                    itemTpl: `<div class="icon {iconCls}"></div>
                            <div class="name">{name}</div>`,
                    bind: {
                        store: '{templates}',
                        selection: '{template}'
                    }
                }
            }],
        },
      
        buttons: {
            ok: 'onNewViewCreate',
            cancel: 'onNewViewCancel'
        }
    },

    items: [{
        layout: {
            type: 'vbox',
            align: 'stretch'
        },
    
        defaultType: 'panel',

        //Handle Toolbox items drag
        draggable: {
            constrain: Ext.getBody(),
            handle: '.toolboxview-list .x-listitem',
            proxy: {
                type: 'placeholder',
                cls: 'toolview-draggable-proxy',
                invalidCls: 'toolview-draggable-proxy-invalid',
                validCls: 'toolview-draggable-proxy-valid'
            },
            groups: ['editor-dropable'],
            describe: function(info) {
                const itemEl = Ext.get(info.eventTarget).up('.x-listitem')
                
                if (itemEl) {
                    const item = itemEl.component
                    info.setData('record', item.getRecord())
                }
            },
            listeners: {
                dragstart: 'onItemDragStart',
                dragmove: 'onItemDragMove',
                dragend: 'onItemDragEnd'
            },
        },
    
        items: [{
            xtype: 'structureview',
            docked: 'left',
            minWidth: 200,
            resizable: {
                split: true,
                edges: 'east'
            },
            listeners: {
                selectionchange: 'onSelectionChange'
            }
        }, {
            layout: 'fit',
            docked: 'right',
            minWidth: 250,
            resizable: {
                split: true,
                edges: 'west'
            },
            items: [{
                xtype: 'container',
                layout: {
                    type: 'vbox',
                    align: 'stretch'
                },
                items: [{
                    xtype: 'toolboxview',
                    flex: 1
                }, {
                    xtype: 'inspectorview',
                    docked: 'bottom',
                    minHeight: '50%',
                    resizable: {
                        split: true,
                        edges: 'north'
                    }
                }]
            }]
        }, {
            xtype: 'editorsview',
            reference: 'editorsview',
            flex: 1
        }, {
            docked: 'bottom',
            minHeight: 150,
            resizable: {
                split: true,
                edges: 'north'
            }
        }]
    }]
})
