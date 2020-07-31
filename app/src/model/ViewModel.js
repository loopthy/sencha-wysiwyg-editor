Ext.define('Wysiwyg.model.ViewModel', {
    extend: 'Wysiwyg.model.Object',

    statics: {
        codeTpl: 
`Ext.define('{project.name}.view.{viewPackage.name}.{viewModel.name}', {
    extend: "{viewModel.extend}",
    alias: "viewmodel.{[values.viewModel.name.toLowerCase()]}",
});`,

},

    isViewModelRecord: true,

    fields: ['extend'],

    applyIndent: function(indent) {
        let str = ''

        for(let i = 0; i < indent; i++) str += '\t'//'&#09;'
        return str
    },

    getSourceCode: function() {
        const me = this
        const tpl = Wysiwyg.model.ViewModel.codeTpl
        const project = me.getRoot()
        const viewPackage = me.parentNode
        const applyIndent = me.applyIndent

        return (new Ext.XTemplate(tpl, {
            applyIndent
        })).apply({
            indent: 1,
            project: project.getData(), 
            viewPackage: viewPackage.getData(), 
            viewModel: me.getNodeData()
        })
    }
})