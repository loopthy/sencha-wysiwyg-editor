Ext.define('Wysiwyg.view.editor.EditorViewController', {
	extend: 'Ext.app.ViewController',
    alias: 'controller.editorviewcontroller',

    overwrittenConfigs: {
        //modern
        'Ext.Label': function() {
            return { html: 'Label' }
        },
        'Ext.Chip': function() {
            return { text: 'Chip' } 
        },
        
        'Ext.Button': function() {
            return { text: 'Button', ripple: false }
        },
        'Ext.Container': () => ({ width: 100, height: 100 }),
        'Ext.Panel': () => ({ width: 100, height: 100 }),
        //classic
        'Ext.button.Button': function() {
            return { text: 'Button' }
        },
        'Ext.container.Container': () => ({ width: 100, height: 100 }),
    },

    initViewModel: function(viewModel) {
        const me = this

        viewModel.bind('{record}', me.onViewRecordUpdate, me, { deep: true })
    },

    bindConfig: function(extClass, config) {
        const cls = Ext.ClassManager.get(extClass)

        // return configs.reduce((bind, { name }) => {
        //     bind[name] = `{record.config.${name}}`
        //     return bind
        // }, {})
        return Object.keys(config)
            .reduce((bind, name) => {
                const setMethodName = `set${Ext.String.capitalize(name)}`
                
                if (cls.prototype[setMethodName]) {
                    bind[name] = `{record.config.${name}}`
                }
                return bind
            }, {})
    },

    onTargetDrop: async function(editor, info, newEvent) {
        const me = this
        const { currentTarget } = newEvent
        const { data } = info

        if (currentTarget && data) {
            const viewModel = me.getViewModel()
            const viewRecord = viewModel.get('record')

            if (viewRecord instanceof Wysiwyg.model.View) {
                const targetRecord = viewRecord.getNodeById(currentTarget.id)

                if (targetRecord) {
                    const record = Wysiwyg.ComponentHandler.createById(data.id, targetRecord)
                    const viewPackage = targetRecord.getParentViewPackage()

                    await editor.loadScript(viewPackage.getScriptCode(), viewRecord.getNodeRefs())
                    editor.setSelection(record)
                }
            }
        }
    },
    
    // onDragStart: function(source, info) {
    //     const me = this
    //     const { component } = Ext.get(info.eventTarget)

    //     if (component) {
    //         me.getVisualEditor().select(component.getParent())
    //     }
    // },

    onElementTap: function(editor, newEvent) {
        const me = this
        const { currentTarget } = newEvent

        if (currentTarget) {
            const viewModel = me.getViewModel()
            const viewRecord = viewModel.get('record')

            if (viewRecord instanceof Wysiwyg.model.View) {
                const record = viewRecord.getNodeById(currentTarget.id)

                editor.setSelection(record)
            }
        } 
    },

    onVisualEditorReady: function(visualEditor) {
        const me = this
        const viewModel = me.getViewModel()
        const record = viewModel.get('record')

        if (record instanceof Wysiwyg.model.View) {
            const viewPackage = record.getParentViewPackage()

            visualEditor.loadScript(viewPackage.getScriptCode(), record.getNodeRefs())
        }
    },

    onViewRecordUpdate: function(record) {
        const me = this

        if (record instanceof Wysiwyg.model.View) {
            const visualEditor = me.getVisualEditor()
            
            if (visualEditor.isReady) {
                const viewPackage = record.getParentViewPackage()

                visualEditor.loadScript(viewPackage.getScriptCode(), record.getNodeRefs())
            }
        }
    },

    getVisualEditor: function() {
		const me = this
		let visualEditor = me.visualEditor

        if (!visualEditor) {
			const view = me.getView()

            visualEditor = me.visualEditor = Ext.create(Ext.apply({
                ownerCmp: view
            }, view.visualEditor))
        }

        return visualEditor
    },

    getSourceCodeEditor: function() {
		const me = this
		let sourceCodeEditor = me.sourceCodeEditor

        if (!sourceCodeEditor) {
			const view = me.getView()

            sourceCodeEditor = me.sourceCodeEditor = Ext.create(Ext.apply({
                ownerCmp: view
            }, view.sourceCodeEditor))
        }

        return sourceCodeEditor
    },

    init: function() {
        const me = this
        const view = me.getView()
        const viewModel = me.getViewModel()
        const record = viewModel.get('record')

        me.targets = []
        view.removeAll()
        if (record instanceof Wysiwyg.model.View) {
            const visualEditor = me.getVisualEditor()
            const sourceCodeEditor = me.getSourceCodeEditor()

            view.add([visualEditor, sourceCodeEditor])
        }
        else if (record instanceof Wysiwyg.model.ViewModel || record instanceof Wysiwyg.model.ViewController) {
            const sourceCodeEditor = me.getSourceCodeEditor()

            view.add([sourceCodeEditor])
        }
    },

    destroy: function() {
        const me = this
        const props = ['visualEditor', 'sourceCodeEditor']

        props.forEach(name => {
            Ext.destroy(me[name])
            me[name] = null
        })

        me.targets.forEach(target => {
            Ext.destroy(target)
        })
        me.targets.length = 0
        me.targets = null

        me.callParent(arguments)
    }
})