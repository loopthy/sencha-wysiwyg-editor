Ext.define('Wysiwyg.component.ComponentWrapper', {
    extend: 'Ext.Container',
    
    config: {
        inner: null
    },

    updateInner: function(newValue, oldValue) {
        const me = this

        if (oldValue) {
            me.remove(oldValue)
        }
        if (newValue) {
            me.add(newValue)
        }
    }
})