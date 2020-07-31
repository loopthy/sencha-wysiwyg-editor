Ext.define('Wysiwyg.model.ComponentDefinition', {
    extend: 'Wysiwyg.model.Base',
    fields: [
        'name', 'text', 'extends', 'extended',
        { name: 'group', calculate: function(data) {
            //TODO: Ext.plugins ?
            if (data.name) {
                const namespace = data.name.split('.')
                const group = (namespace.length > 2) ? namespace[1] : 'Basic'

                return Ext.String.capitalize(group)
            }
            return null
        }},
        { name: 'container', calculate: function(data) {
            const name = 'Ext.Container'
            return ((data.name === name) || (data.extends && data.extends === name) || (data.extended && data.extended.indexOf(name) !== -1))
        }}
    ]
})