Ext.define('Wysiwyg.component.DesignEditor', {
    extend: 'Ext.Component',
    xtype: 'visualeditor',

    viewModel: {},

    config: {
        device: null,
        content: null,
        selection: null
    },

    bind: {
        device: '{device}',
        selection: '{selection}',
    },

    twoWayBindable: {
        selection: 1
    },

    isReady: false,

    //https://cdn.sencha.com/ext/commercial/7.0.0/build/ext-modern-all.js
    //https://cdn.sencha.com/ext/commercial/7.1.0/build/ext-modern-all.js
    //https://cdn.sencha.com/ext/commercial/7.2.0/build/ext-modern-all.js

    //https://cdn.sencha.com/ext/commercial/7.0.0/build/modern/theme-material/theme-material.js
    //https://cdn.sencha.com/ext/commercial/7.0.0/build/modern/theme-material/resources/theme-material-all.css

    element: {
        reference: 'element',
        cls: 'visual-editor',
        children: [{
            reference: 'wrapElement',
            cls: 'wrap',
            children: [{
                tag: 'iframe',
                reference: 'innerElement',
                frameborder: 0
            }]
        }]
    },

    initialize: function() {
        const me = this
        
        me.callParent(arguments)
        Wysiwyg.EditorDispatcher.register(me.getContextId(), me)
    },

    doDestroy: function() {
        const me = this

        Wysiwyg.EditorDispatcher.unregister(me.getContextId())
        me.callParent(arguments)
    },

    updateDevice: function(newDevice, oldDevice) {
        const me = this
        const wrapEl = me.wrapElement

        if (wrapEl) {
            if (oldDevice) {
                const name = oldDevice.get('name')
                wrapEl.removeCls(`editor-${name.toLowerCase()}`)
            }
            if (newDevice) {
                const name = newDevice.get('name')
                const isDesktop = (name === 'Desktop')
                const width = newDevice.get('width')
                const height = newDevice.get('height')

                wrapEl.setWidth(isDesktop ? width : width * newDevice.get('scale'))
                wrapEl.setHeight(isDesktop ? height : height * newDevice.get('scale'))
                wrapEl.addCls(`editor-${name.toLowerCase()}`)
            }
        }
    },

    updateContent: function(newContent) {
        const me = this
        const iframe = me.innerElement

        if (iframe && newContent) {
            const iframeDom = iframe.dom

            iframeDom.contentWindow.document.open()
            iframeDom.contentWindow.document.write(newContent)
            iframeDom.contentWindow.document.close()
        }
    },

    getContextId: function() {
        return this.innerElement.getId()
    },

    createLoadScriptListener: function(resolve, selection) {
        const me = this
        return function() {
            if (selection) {
                // me.select(selection.get('elementId'))
                me.select(selection.getId())
            }
            resolve()
        }
    },

    loadScript: function(src, metadata) {
        const me = this
        const selection = me.getSelection()
        const isReady = me.isReady
        
        return new Promise(resolve => {
            if (isReady) {
                me.postIframeMessage({
                    type: 'loadScript',
                    args: [src, metadata]
                })
                me.on('loadedscript', me.createLoadScriptListener(resolve, selection), me, { single: true })
            }
            else  {
                resolve()
            }
        })
    },

    fireMessage: function(name, ...args) {
        const me = this

        me.postIframeMessage({
            type: name,
            args
        })
    },

    postIframeMessage: function(message) {
        const me = this
        const iframe = me.innerElement

        if (iframe) {
            const iframeDom = iframe.dom

            iframeDom.contentWindow.postMessage(message)
        }
    },

    onIframeEvent: function(event) {
        const me = this

        if (event) {
            if (event.type === 'ready') me.isReady = true
            me.fireEvent(event.type, me, ...event.args)
        }
    },

    updateSelection: function(newSelection, oldSelection) {
        const me = this

        if (newSelection && newSelection != oldSelection) {
            const isView = (newSelection instanceof Wysiwyg.model.View)
            const viewRecord = isView ? newSelection : newSelection.getParentView()
            const record = me.getViewModel().get('record')

            if (viewRecord === record) {
                // me.select(newSelection.get('elementId'))
                me.select(newSelection.getId())
            }
        }
    },

    select: function(id) {
        const me = this

        me.postIframeMessage({
            type: 'select',
            args: [id]
        })
    }
})