Ext.define('Wysiwyg.store.ProjectObjects', {
    extend: 'Ext.data.TreeStore',
    alias: 'store.projectobjects',

    requires: [
        'Wysiwyg.model.Project',
        'Wysiwyg.model.View',
        'Wysiwyg.model.ViewModel',
        'Wysiwyg.model.ViewController',
        'Wysiwyg.model.Component'
    ],

    model: 'Wysiwyg.model.Object'
    
})