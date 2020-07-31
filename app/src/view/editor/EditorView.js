Ext.define('Wysiwyg.view.editor.EditorView', {
    extend: 'Ext.Panel',
    xtype: 'editorview',

    controller: 'editorviewcontroller',
    viewModel: {
        type: 'editorviewmodel'
    },

    layout: 'card',

    sourceCodeEditor: {
        xtype: 'sourcecodeeditor',
        viewModel: {},
        bind: {
            src: '{sourceCode}'
        }
    },

    visualEditor: {
        xtype: 'visualeditor',
        viewModel: {},
        bind: {
            content: '{contentDocument}'
        },
        listeners: {
            ready: 'onVisualEditorReady',
            tap: 'onElementTap',
            drop: 'onTargetDrop',
        }
    },

    bind: {
        activeItem: '{activeItem}'
    }
})