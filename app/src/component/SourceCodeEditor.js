Ext.define('Wysiwyg.component.SourceCodeEditor', {
    extend: 'Ext.Container',
    xtype: 'sourcecodeeditor',

    config: {
        theme: 'textmate',//'monokai',
        src: null
    },

    cls: 'sourcecode-editor',

    doDestroy: function() {
        const me = this
        
        me.destroyEditor()
        me.callParent(arguments)
    },

    destroyEditor: function() {
        const me = this
        const editor = me.editor

        if (editor) {
            editor.destroy()
            me.editor = null
        }
    },

    createEditor: function(id) {
        const me = this
        let editor = me.editor
        
        if (!editor && window.ace) {
            editor = me.editor = ace.edit(id)
            editor.setTheme(`ace/theme/${me.getTheme()}`)
            editor.session.setMode('ace/mode/javascript')
        }
    },

    updateSrc: function(newValue) {
        const me = this

        if (newValue && me.rendered) {
            const bodyEl = me.bodyElement

            me.destroyEditor()
            
            bodyEl.setHtml(newValue)
            me.createEditor(bodyEl.getId())
        }
    }
})