Ext.define('Wysiwyg.view.editor.EditorViewModel', {
	extend: 'Ext.app.ViewModel',
    alias: 'viewmodel.editorviewmodel',

    data: {
        record: null
    },
    formulas: {
        activeItem: {
            bind: '{record.mode}',
            get: function(mode) {
                return (mode === 'visual') ? 0 : 1
            }
        },
        contentDocument: {
            bind: {
                bindTo: '{record}',
                deep: true
            },
            get: function(selection) {
                if (selection instanceof Wysiwyg.model.View) {
                    return selection.getRoot().getContentDocument()
                }
                return ''
            }
        },
        sourceCode: {
            bind: {
                bindTo: '{record}',
                deep: true
            },
            get: function(record) {
                if (record instanceof Wysiwyg.model.View ||
                    record instanceof Wysiwyg.model.ViewModel ||
                    record instanceof Wysiwyg.model.ViewController
                ) {
                    return record.getSourceCode()
                }
                return ''
            }   
        }
    }
})