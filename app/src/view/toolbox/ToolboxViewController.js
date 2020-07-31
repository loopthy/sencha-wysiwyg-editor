Ext.define('Wysiwyg.view.toolbox.ToolboxViewController', {
	extend: 'Ext.app.ViewController',
	alias: 'controller.toolboxview',

	onSearchClear: function() {
		const me = this
		const filter = me.filter

		if (filter) {
			const list = me.lookup('list')
			const store = list.getStore()
			const filters = store.getFilters()

			filters.remove(filter)
			me.filter = null
		}
	},

	onSearchChange: function(sender) {
		const me = this
		const list = me.lookup('list')
		const store = list.getStore()
		const filters = store.getFilters()
		const value = sender.getValue()
		let filter = me.filter

		if (!filter) {
			filter = me.filter = new Ext.util.Filter({
				property: 'name',
				anyMatch: true,
				value
			})	
			filters.add(filter)	
		}
		else {
			filters.beginUpdate()
			filter.setValue(value)
			filters.endUpdate()
		}
	}
})