Ext.define('Wysiwyg.field.PropertyGrid', {
    extend: 'Ext.picker.Picker',

    xtype: 'propertygridfield',

    config: {
        store: null
    },

    floatedPicker: {
        xtype: 'propertygrid',
        floated: true,
        listeners: {
            tabout: 'onTabOut',
            select: 'onPickerChange',
            scope: 'owner'
        },
        keyMap: {
            ESC: 'onTabOut',
            scope: 'owner'
        }
    },
 
    edgePicker: {
    },

    createFloatedPicker: function() {
        const me = this
        const store = me.getStore()

        return Ext.merge({ store }, me.getFloatedPicker())
    },
 
    createEdgePicker: function() {
        const me = this
        const store = me.getStore()
        
        return Ext.merge({ store }, me.getEdgePicker())
    },

    onPickerChange: function(picker, value) {
        var me = this;
 
        if (me.$ignorePickerChange) {
            return
        }
 
        me.forceSetValue(value)
        me.fireEvent('select', me, value)
        me.onTabOut(picker)
    },
 
    onTabOut: function() {
        this.collapse()
    },
})