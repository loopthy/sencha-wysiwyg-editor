Ext.define('Wysiwyg.view.structure.StructureViewController', {
	extend: 'Ext.app.ViewController',
	alias: 'controller.structureview',

	destroy: function() {
		const me = this

        me.toolMenu = Ext.destroy(me.contextMenu)
        me.callParent()
    },

	selectionChange: function(record) {
		const me = this
		
		if (record instanceof Wysiwyg.model.Component) {
			record = record.getParentView()
		}

		if (record instanceof Wysiwyg.model.View || record instanceof Wysiwyg.model.ViewModel || record instanceof Wysiwyg.model.ViewController) {
			const viewModel = me.getViewModel()
			const openFiles = viewModel.get('openFiles')

			if (openFiles.indexOf(record) === -1) {	
				openFiles.add(record)
			}
		}
	},

	getContextMenu: function() {
		const me = this
		let contextMenu = me.contextMenu

        if (!contextMenu) {
			const view = me.getView()

            contextMenu = me.contextMenu = Ext.create(Ext.apply({
                ownerCmp: view
            }, view.contextMenu))
        }

        return contextMenu
    },

	onSelectionChange: function(sender, records, selecting, selection) {
		const me = this

		if (selection.getCount() > 0) {
			const record = records[0]

			me.selectionChange(record)
		}
	},

	onContextMenu: function(event, target) {
		const me = this
		const { component } = Ext.get(target)

		if (component) {
			const view = me.getView()
			const record = component.getRecord()
			const contextMenu = me.getContextMenu()

			me.selectionChange(record)
			view.setSelection(record)

			contextMenu.showBy(target, 't-b?')
		}
	},

	onCopy: function() {

	},

	onDelete: function() {

	},

	onSourceCode: function() {
		const me = this
		const view = me.getView()
		const record = view.getSelection()

		if (record instanceof Wysiwyg.model.View) {
			record.set('mode', 'code')
			record.commit()
		}
	},

	onVisual: function() {
		const me = this
		const view = me.getView()
		const record = view.getSelection()

		if (record instanceof Wysiwyg.model.View) {
			record.set('mode', 'visual')
			record.commit()
		}
	}
})