Ext.define('Wysiwyg.Application', {
	extend: 'Ext.app.Application',
	name: 'Wysiwyg',
	requires: [
		'Ext.Label',
		'Wysiwyg.*'
	],

	removeSplash: function () {
		Ext.getBody().removeCls('launching')
		const elem = document.getElementById('splash')
		elem.parentNode.removeChild(elem)
	},

	launch: function () {
		this.removeSplash()
		const whichView = 'mainview'
		Ext.Viewport.add([{xtype: whichView}])
	},

	onAppUpdate: function () {
		Ext.Msg.confirm('Application Update', 'This application has an update, reload?',
			function (choice) {
				if (choice === 'yes') {
					window.location.reload()
				}
			}
		)
	}
})
