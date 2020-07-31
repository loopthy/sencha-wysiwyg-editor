Ext.define('Wysiwyg.store.ProjectComponents', {
    extend: 'Ext.data.Store',
    alias: 'store.projectcomponents',

    model: 'Wysiwyg.model.ComponentDefinition',
    sorters: 'name',
    grouper: 'group'
})