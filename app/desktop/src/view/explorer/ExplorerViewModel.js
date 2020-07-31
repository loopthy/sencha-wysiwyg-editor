Ext.define('Wysiwyg.view.explorer.ExplorerViewModel', {
    extend: 'Ext.app.ViewModel',

    alias: 'viewmodel.explorerview',

    stores: {
        projectFiles: {
            type: 'projectfiles'
        }
    }
})