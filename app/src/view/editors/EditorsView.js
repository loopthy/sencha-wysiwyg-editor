Ext.define('Wysiwyg.view.editors.EditorsView', {
    extend: 'Ext.tab.Panel',
    xtype: 'editorsview',

    controller: 'editorsviewcontroller',
    viewModel: {
        type: 'editorsviewmodel'
    },

    privates: {
        attachStoreEvents: function(store, listeners) {
            this.storeListeners = store.on(listeners)
        },
    },

    storeListeners: null,

    config: {
        selection: null
    },

    cachedConfig: {
        storeEventListeners: {
            add: 'onStoreAdd',
            clear: 'onStoreClear',
            remove: 'onStoreRemove',
        }
    },

    eventedConfig: {
        store: null
    },

    items: [{
        xtype: 'toolbar',
        title: '',
        docked: 'bottom',
        layout: {
            pack: 'end'
        },
        bind: {
            hidden: '{emptyProject}'
        },
        items: [{
            xtype: 'selectfield',
            valueField: 'id',
            displayField: 'name',
            bind: {
                selection: '{device}',
                store: '{devices}'
            }
        }]
    }],

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

    layout: {
        type: 'card',
        animation: false
    },

    defaultType: 'editorview',

    defaults: {
        title: 'untitled',
        tab: {
            minWidth: 100
        },
        closable: true,
        bind: {
            title: '{record.name}',
        }
    },

    bind: {
        selection: '{selection}',
        store: '{openFiles}'
    },

    twoWayBindable: {
        selection: 1
    },

    listeners: {
        activeItemchange: 'onActiveItemChange', 
        remove: 'onTabRemove'
    },

    updateSelection: function(newSelection, oldSelection) {
        const me = this
        
        if (newSelection && newSelection != oldSelection) {
            const store = me.getStore()
            const record = (newSelection instanceof Wysiwyg.model.Component) ? newSelection.getParentView() : newSelection
            
            if (record instanceof Wysiwyg.model.View || record instanceof Wysiwyg.model.ViewModel || record instanceof Wysiwyg.model.ViewController) {
                const activeIndex = store.indexOf(record)

                if (activeIndex > -1) {
                    const innerItems = me.getInnerItems()
                    const activeItem = innerItems[activeIndex]

                    if (activeItem) {
                        if (activeItem != me.getActiveItem()) {
                            me.setActiveItem(activeItem)
                        }
                    }
                }        
            }    
        }
    },

    applyStore: function(store) {
        const newStore = this.store = store ? Ext.data.StoreManager.lookup(store) : null
        return newStore
    },
 
    updateStore: function(newStore, oldStore) {
        const me = this;

        if (oldStore) {
            if (!oldStore.destroyed) {
                if (oldStore.getAutoDestroy()) {
                    oldStore.destroy()
                }
                else {
                    Ext.destroy(me.storeListeners)
                }
            }
 
            // me.dataRange = me.storeListeners = Ext.destroy(me.dataRange);
 
            // If we are not destroying, refresh is triggered below if there is a newStore
            // if (!me.destroying && !me.destroyed && !newStore) {
            //     me.doClear();
            // }
        }
 
        if (newStore) {
            if (me.destroying) {
                return
            }
 
            me.attachStoreEvents(newStore, Ext.apply({
                scope: me,
                destroyable: true
            }, me.getStoreEventListeners()))
        }
    },

    onStoreAdd: function(store, records) {
        const me = this
        
        me.add(records.map((record, index) => ({ 
            viewModel: { data: { record } }
        })))
    },
 
    onStoreClear: function() {
        this.removeAll(true)
    },
 
    onStoreRemove: function(store, records, index) {
        // this.removeAt(index)
    }

})