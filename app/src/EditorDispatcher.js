Ext.define('Wysiwyg.EditorDispatcher', {
    singleton: true,

    items: {},

    constructor: function() {
        window.addEventListener('message', this.onMessage.bind(this), false)
    },

    register: function(id, item) {
        this.items[id] = item
    },

    unregister: function(id) {
        const me = this
        const items = me.items

        items[id] = null
        delete items[id]
    },

    onMessage: function(message) {
        const me = this
        const event = Ext.isString(message.data) ? Ext.decode(message.data, true) : message.data

        if (event) {
            const contextId = event.contextId

            if (contextId) {
                const items = me.items
                const visualEditor = items[contextId]

                if (visualEditor) {
                    visualEditor.onIframeEvent(event)
                }
            }
        }
    }
})