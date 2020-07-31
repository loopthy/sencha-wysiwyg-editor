Ext.define('Wysiwyg.view.inspector.InspectorViewController', {
	extend: 'Ext.app.ViewController',
	alias: 'controller.inspectorview',

	// initViewModel: function(viewModel) {
	// 	const me = this

	// 	viewModel.bind('{events.data.items}', function(data) {
	// 		console.log(data)
	// 	}, { deep: true })
	// },

	addViewControllerMethod: function(record) {
		const me = this
		const view = me.getView()
		const selection = view.getRecord()
		const viewControllerRecord = selection.getParentViewController()

		if (viewControllerRecord) {
			const viewModel = me.getViewModel()
			const openFiles = viewModel.get('openFiles')

			const name = `on${selection.get('instanceName')}${Ext.String.capitalize(record.get('name'))}`
			const methods = viewControllerRecord.get('children') || []
			
			if (methods.findIndex(method => method.name === name) === -1) {
				const items = record.get('items')

				methods.push({ name, items })
				viewControllerRecord.set('children', methods)
				viewControllerRecord.commit()
				//Set method name
				record.set('value', name)
			}
			//Trying show ViewController source code in Editor
			if (openFiles.indexOf(viewControllerRecord) === -1) {	
				openFiles.add(viewControllerRecord)
			}
			view.setSelection(viewControllerRecord)
		}
	},

	onSearchClear: function() {
		const me = this
		const configsGrid = me.lookup('configsGrid')
		const eventsGrid = me.lookup('eventsGrid')
		const stores = [configsGrid.getStore(), eventsGrid.getStore()]

		stores.forEach((store) => {
			store.clearFilter()
		})
	},

	onSearchChange: function(sender) {
		const me = this
		const configsGrid = me.lookup('configsGrid')
		const eventsGrid = me.lookup('eventsGrid')
		const stores = [configsGrid.getStore(), eventsGrid.getStore()]
		const value = sender.getValue()

		stores.forEach((store) => {
			// const record = store.findRecord('name', value, 0, true, false)

			// if (record) {
			// 	grid.scrollToRecord(record)
			// 	grid.setSelection(record)
			// }
			store.clearFilter(true)
			store.filterBy(function(record) {
				return (record.get('name').toLowerCase().indexOf(value.toLowerCase()) !== -1)
			})
		})
	},

	onConfigDoubleTap: function(sender, location, e) {
		const me = this
		
		if (location.column && location.column.getDataIndex() === 'value') {
			const record = location.record
			const propType = record.get('type')
			const types = propType.split('/').map(t => t.toLowerCase())
			const fieldType = types[0]

			if (fieldType === 'function') {
				me.addViewControllerMethod(record)
			}
		}
	},
	
	onConfigUpdate: function(sender, record, operation, modifiedFieldNames, details, eOpts) {
		const me = this
		const selection = me.getView().getRecord()
		const config = selection.get('config')
		const name = record.get('name')
		const value = record.get('value')

		selection.set('config', Ext.apply(config, {
			[name]: value
		}))
		if (record.get('defaultValue') !== value) {
			const overwrittenConfig = selection.get('overwrittenConfig')

			selection.set('overwrittenConfig', Ext.apply(overwrittenConfig, {
				[name]: value
			}))	
		}
		selection.commit()
		//If selection is a component let's commit the parent view to refresh it code
		if (selection instanceof Wysiwyg.model.Component) {
			const viewRecord = selection.getParentView()
			viewRecord.commit()
		}
	},

	onEventDoubleTap: function(sender, location, e) {
		const me = this
		
		if (location.column && location.column.getDataIndex() === 'value') {
			const record = location.record

			me.addViewControllerMethod(record)
		}
	},

	onEventUpdate: function(sender, record, operation, modifiedFieldNames, details, eOpts) {
		const me = this
		const selection = me.getView().getRecord()
		const listeners = selection.get('listeners')
		const name = record.get('name')
		const value = record.get('value')
		const viewControllerRecord = selection.getParentViewController()

		selection.set('listeners', Ext.apply(listeners, {
			[name]: value
		}))

		selection.commit()
		viewControllerRecord.commit()
		//If selection is a component let's commit the parent view to refresh it code
		if (selection instanceof Wysiwyg.model.Component) {
			const viewRecord = selection.getParentView()
			viewRecord.commit()
		}
	},
})