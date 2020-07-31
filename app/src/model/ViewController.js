Ext.define('Wysiwyg.model.ViewController', {
    extend: 'Wysiwyg.model.Object',

    statics: {
        codeTpl: 
`Ext.define('{project.name}.view.{viewPackage.name}.{viewController.name}', {
    extend: "{viewController.extend}",
    alias: "controller.{[values.viewController.name.toLowerCase()]}",
    {[this.applyMethods(values.indent, values.viewController.children)]}
});`,
        methodsCodeTpl:
`<tpl if="children.length &gt; 0"><tpl for="children" between=",">
{[this.applyIndent(parent.indent)]}{name}: function(<tpl for="items" between=", ">{name}</tpl>) {
{[this.applyIndent(parent.indent + 1)]}//TODO: Add your code here
{[this.applyIndent(parent.indent)]}}</tpl>
</tpl>`
    },
    
    isViewControllerRecord: true,

    fields: ['extend'],

    applyIndent: function(indent) {
        let str = ''

        for(let i = 0; i < indent; i++) str += '\t'//'&#09;'
        return str
    },

    applyMethods: function(indent, children) {
        const me = this
        const tpl = Wysiwyg.model.ViewController.methodsCodeTpl
        const applyIndent = me.applyIndent

        return (new Ext.XTemplate(tpl, {
            applyIndent
        })).apply({
            indent,
            children
        })
    },

    getSourceCode: function() {
        const me = this
        const tpl = Wysiwyg.model.ViewController.codeTpl
        const project = me.getRoot()
        const viewPackage = me.parentNode
        const applyIndent = me.applyIndent
        const applyMethods = me.applyMethods
        
        return (new Ext.XTemplate(tpl, {
            applyIndent,
            applyMethods
        })).apply({
            indent: 1,
            project: project.getData(), 
            viewPackage: viewPackage.getData(), 
            viewController: me.getData()//me.getNodeData()
        })
    }
})