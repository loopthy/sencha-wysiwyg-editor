Ext.define('Wysiwyg.model.Object', {
    extend: 'Ext.data.TreeModel',
    requires: ['Ext.data.identifier.Uuid'],
    identifier: 'uuid',

    fields: [
        { name: 'isWidget', defaultValue: false },
        { name: 'nodeName', convert: function(v, record) {
            const data = record.getData()
            return data['instanceName'] ? data['instanceName'] : data['name'] ? data['name'] : ''
        }},
    ],

    appendChild: function(record) {
        const me = this
        const result = me.callParent(arguments)

        if (!Ext.isArray(record)) {
            const data = record.getData()
            const isWidget = (data && data.isWidget) || false

            if (isWidget) {
                const viewRecord = (record instanceof Wysiwyg.model.View) ? record : (me instanceof Wysiwyg.model.View) ? me : me.getParentView()
                
                if (viewRecord) {
                    const uniqueIds = viewRecord.uniqueIds //Unique Ids in the view scope
                    const { alias } = data
                    //Inspired in Ext.mixin.Identifiable
                    const defaultIdSeparator = '-'
                    const idCleanRe = /\.|[^\w-]/g
                    const xtype = alias.split('.')[1]
                    let prefix = ''

                    if (xtype) {
                        prefix += xtype.replace(idCleanRe, defaultIdSeparator) + defaultIdSeparator
                    }
                    else {
                        prefix += 'anonymous' + defaultIdSeparator
                    }

                    if (!uniqueIds.hasOwnProperty(prefix)) {
                        uniqueIds[prefix] = 0
                    }
                    
                    uniqueIds[prefix]++
                    
                    const instanceName = Ext.String.capitalize(xtype) + uniqueIds[prefix]
                    
                    record.set('instanceName', instanceName)
                }
            }
        }
        return result
    },

    getNodeById: function(id) {
        const node = this

        if (node.getId() === id) {
            return node
        }
        else if (node.childNodes.length > 0) {
            let child = null

            for(let i = 0, ln = node.childNodes.length; i < ln && !child; i++) {
                child = node.childNodes[i].getNodeById(id)
            }
            return child     
        }
        return null
    },
    getRoot: function() {
        const node = this

        if (!node) {
            return;
        }
        if (node.get('root') === true) {
            return node
        }
        parentNode = node.parentNode
        if (parentNode) {
            return parentNode.getRoot()
        }
    },
    getParentItemPackage: function(ItemType) {
        const node = this

        if (!node) {
            return;
        }
        if (node instanceof ItemType) {
            return node
        }
        parentNode = node.parentNode
        if (parentNode) {
            return parentNode.getParentItemPackage(ItemType)
        }
    },
    getParentViewPackage: function() {
        return this.getParentItemPackage(Wysiwyg.model.ViewPackage)
    },
    getParentView: function() {
        return this.getParentItemPackage(Wysiwyg.model.View)
    },
    getParentViewModel: function() {
        const me = this
        const viewPackage = me.getParentViewPackage()

        return viewPackage && viewPackage.getViewModel()
    },
    getParentViewController: function() {
        const me = this
        const viewPackage = me.getParentViewPackage()

        return viewPackage && viewPackage.getViewController()
    },
    getNodeData: function(map) {
        const node = this
        
        if (!map) map = item => item

        return Ext.apply(map(node.getData()), {
            children: node.childNodes.map(child => child.getNodeData(map))
        })
    },
    getNodeRefs: function() {
        return this.getNodeData(({ id, alias }) => ({ id, alias }))
    }
})