Ext.define('Wysiwyg.view.InspectorViewModel', {
    extend: 'Ext.app.ViewModel',

    alias: 'viewmodel.inspectorview',
    
    formulas: {
        sorterFn: {
            bind: '{selection}',
            get: function() {
                return function() {
                    return 1
                }
            }
        },
        methodOptions: {
            bind: {
                bindTo: '{selection}',
                deep: true
            },
            get: function(selection) {
                if (selection) {
                    const parentViewController = selection.getParentViewController()
                    
                    return parentViewController ? parentViewController.get('children') : []
                } 
                return []   
            }   
        }
    },
    stores: {
        configs: {
            data: '{selection.configs}',
            // grouper: {
            //     property: 'group',
            //     sorterFn: '{sorterFn}'
            // },
            listeners: {
                update: 'onConfigUpdate'
            }
        },
        events: {
            data: '{selection.events}',
            listeners: {
                update: 'onEventUpdate'
            }
        }
    }
})