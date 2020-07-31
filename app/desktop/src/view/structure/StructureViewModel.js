Ext.define('Wysiwyg.view.structure.StructureViewModel', {
    extend: 'Ext.app.ViewModel',

    alias: 'viewmodel.structureview',

    formulas: {
        contextMenuItems: {
            bind: ['{actions.data.items}', '{selection}', '{selection.mode}'],
            get: function([items, selection]) {
                return items
                .map(item => item.getData())
                .filter(item => !item.context || (item.context && item.context(selection)))
            }
        }
    },
    stores: {
        actions: {
            data: [
                { text: 'Delete', handler: 'onDelete' },
                { text: 'Source Code', separator: true, handler: 'onSourceCode', context: function(selection) {
                    return (selection instanceof Wysiwyg.model.View && selection.get('mode') === 'visual')
                } },
                { text: 'Visual', separator: true, handler: 'onVisual', context: function(selection) {
                    return (selection instanceof Wysiwyg.model.View && selection.get('mode') === 'code')
                } }    
            ]
        }
    }
})