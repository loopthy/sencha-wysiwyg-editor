Ext.define('Wysiwyg.view.structure.StructureView', {
    extend: 'Ext.Panel',
    xtype: 'structureview',

    controller: 'structureview',
    viewModel: {
        type: 'structureview'
    },

    cls: 'structure-view',
    
    title: 'Project',

    config: {
        tree: {
            xtype: 'tree',
            reference: 'tree',
            columns: [{
                xtype: 'wysiwygtreecolumn',
                dataIndex: 'nodeName',
                // dataIndex: 'name',
                flex: 1,

                indentSize: 12,
            }],
            hideHeaders: true,
            rootVisible: true,
            rowLines: false,
            bind: {
                store: '{projectObjects}',
                selection: '{selection}'
            },
            listeners: {
                selectionchange: 'onSelectionChange',
                contextmenu: {
                    fn: 'onContextMenu',
                    delegate: '.x-listitem',
                    element: 'element',
                    stopEvent: true
                }
            }
        },
        selection: null,
    },

    contextMenu: {
        xtype: 'menu',
        anchor: true,
        padding: 10,
        viewModel: {},
        defaults: {
            margin: '10 0 0'
        },
        bind: {
            items: '{contextMenuItems}'
        }
    },

    layout: 'fit',

    bind: {
        hidden: '{emptyProject}',
        selection: '{tree.selection}'
    },

    createTree: function(config) {
        return Ext.apply({
            ownerCmp: this
        }, config)
    },

    applyTree: function(tree, oldTree) {
        return Ext.Factory.widget.update(oldTree, tree, this, 'createTree')
    },

    updateTree: function(newTree, oldTree) {
        const me = this

        if (oldTree) {
            me.remove(oldTree)
        }
        if (newTree) {
            me.add(newTree)
        }
    },
   
    updateSelection: function(newSelection, oldSelection) {
        const me = this
        const tree = me.getTree()

        if (newSelection && newSelection != oldSelection) {
            const expandParent = node => {
                if (!node) {
                    return;
                }
                if (!node.isExpanded()) {
                    node.expand()
                }
                parentNode = node.parentNode
                if (parentNode) {
                    expandParent(parentNode)
                }
            }
            
            expandParent(newSelection.parentNode)
            tree.select(newSelection, false, true)
        }
        else {
            tree.deselectAll(true)
        }
    }
}, function() {
    Ext.define('Wysiwyg.view.structure.TreeColumn', {
        extend: 'Ext.grid.column.Tree',
     
        xtype: 'wysiwygtreecolumn',
     
        config: {
            indentSize: 23,
            cell: {
                xtype: 'treecell'
            }
        }
    })
})