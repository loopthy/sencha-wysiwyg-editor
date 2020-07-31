Ext.define('Wysiwyg.view.explorer.ExplorerView', {
    extend: 'Ext.Panel',
    xtype: 'explorerview',

    controller: 'explorerview',
    viewModel: {
        type: 'explorerview'
    },

    layout: 'fit',

    items: [{
        xtype: 'tree',
        rootVisible: false,
        rowLines: false,
        bind: '{projectFiles}'
    }]
})