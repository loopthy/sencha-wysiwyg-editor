Ext.define('Wysiwyg.view.editors.EditorsViewController', {
	extend: 'Ext.app.ViewController',
	alias: 'controller.editorsviewcontroller',

	getEditorRecord: function(value) {
		return value instanceof Wysiwyg.view.editor.EditorView ? value.getViewModel().get('record') : null
	},
	
	onActiveItemChange: function(sender, item, oldItem, eOpts) {
		const me = this
		const view = me.getView()
		const selection = view.getSelection()
		const record = me.getEditorRecord(item)
		
		if (selection && selection != record) {
			view.setSelection(record)
		}
	},

	onTabRemove: function(sender, item, index) {
		const me = this
		const viewModel = me.getViewModel()
		const openFiles = viewModel.get('openFiles')
		const record = me.getEditorRecord(item)
		
		if (openFiles && record) {
			openFiles.remove(record)
		}
	}
})