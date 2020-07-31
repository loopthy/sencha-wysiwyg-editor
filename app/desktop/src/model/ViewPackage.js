Ext.define('Wysiwyg.model.ViewPackage', {
    extend: 'Wysiwyg.model.Object',

    statics: {
        scriptTpl: `
try {
    {viewControllerSrc}

    {viewModelSrc}

    {viewSrc}

    if (Ext.app.Application.instance) {
        Ext.mixin.Identifiable.uniqueIds = {}
        Ext.destroy(Ext.app.Application.instance)
    }

    Ext.application({
        name: '{project.name}',
        mainView: '{project.name}.view.{viewPackage.name}.{view.name}',

        syncItemRefs: function(metadata, attr) {
            const me = this
            const getDom = component => Ext.isModern ? component.element.dom : component.getEl().dom
            const mainView = me.getMainView()
            const sync = (component, data) => {
                getDom(component).setAttribute(attr, data.id)
                if ((component.items && component.items.length > 0) &&
                    (data.children && data.children.length > 0)) {
                    
                    if (component.items.length === data.children.length) {
                        component.items.each((item, index) => sync(item, data.children[index]))
                    }
                    else {
                        throw new Error("Sync item\'s references mismatch")
                    }
                }
            }
            sync(mainView, metadata)
        },

        launch: function() {
            const me = this
            
            me.syncItemRefs(scriptMetadata, attributeRef)
            postMessage({
                type: 'applaunched'
            })
        }
    });
}
catch(error) {
    console.log(error)
    postMessage({
        type: 'apperror',
        args: [error]
    })
}
`
    },

    getView: function() {
        return this.childNodes[0]
    },

    getViewModel: function() {
        return this.childNodes[1]
    },

    getViewController: function() {
        return this.childNodes[2]
    },

    getScriptCode: function() {
        const me = this
        const tpl = Wysiwyg.model.ViewPackage.scriptTpl
        const project = me.getRoot()
        const view = me.getView()
        const viewModel = me.getViewModel()
        const viewController = me.getViewController()

        return (new Ext.XTemplate(tpl, {})).apply({
            project: project.getData(),
            viewPackage: me.getData(),
            view: view.getData(),
            viewControllerSrc: viewController.getSourceCode(),
            viewModelSrc: viewModel.getSourceCode(),
            viewSrc: view.getSourceCode()
        })
    }
})