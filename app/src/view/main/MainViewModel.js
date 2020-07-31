Ext.define('Wysiwyg.view.main.MainViewModel', {
	extend: 'Ext.app.ViewModel',
	alias: 'viewmodel.mainviewmodel',

	data: {
		project: null,
		selection: null, 	//Object Selection
		device: null,
		template: null
	},
	formulas: {
		emptyProject: function(get) {
			return !get('project')
		},
		frameworkToolkit: {
			bind: ['{framework.value}', '{frameworks}'],
			get: function([frameworkId, frameworks]) {
				const framework = frameworks && frameworks.getById(frameworkId)
				return framework && framework.get('toolkit')
			}
		}
	},
	stores: {
		frameworks: {
			fields: ['id', 'version', 'toolkit', 'description'],
			data: [
				{ id: 1, version: '7.2.0', toolkit: 'modern', description: '7.2.0 modern' },
				{ id: 2, version: '7.2.0', toolkit: 'classic', description: '7.2.0 classic' }
			]
		},
		devices: {
			fields: ['id', 'name', 'toolkit'],
			data: [
				{ id: 1, name: 'Phone', toolkit: 'modern', width: 640, height: 1136, scale: 0.7, iconCls: 'x-fa fa-mobile' },
				{ id: 2, name: 'Tablet', toolkit: 'modern', width: 2048, height: 1536, scale: 0.5, iconCls: 'x-fa fa-tablet' },
				{ id: 3, name: 'Tablet', toolkit: 'classic', width: 2048, height: 1536, scale: 0.5, iconCls: 'x-fa fa-tablet' },
				{ id: 4, name: 'Desktop', toolkit: 'modern', width: '100%', height: '100%', scale: 1, iconCls: 'x-fa fa-desktop' },
				{ id: 5, name: 'Desktop', toolkit: 'classic', width: '100%', height: '100%', scale: 1, iconCls: 'x-fa fa-desktop' }
			],
			filters: [{
                property: 'toolkit',
                value: '{frameworkToolkit}',
                operator: '='
            }]
		},
		templates: {
			fields: ['id', 'name', 'toolkit'],
			data: [
				{ name: 'Blank', toolkit: 'modern', iconCls: 'x-fa fa-file', view: {
					extend: 'Ext.Container'
				} },
				{ name: 'Blank form', toolkit: 'modern', iconCls: 'x-fa fa-list-alt', view: {
					extend: 'Ext.form.Panel',

					title: 'Untitled',

					autoSize: true,
					bodyPadding: 10,
				} },	
				{ name: 'Contact Us', toolkit: 'modern', iconCls: 'x-fa fa-list-alt', view: {
					extend: 'Ext.form.Panel',

					title: 'Contact Us',

					autoSize: true,
					bodyPadding: 10,

					items: [{
						xtype: 'textfield',
						name: 'firstName',
						placeholder: 'First',
						required: true
					}, {
						xtype: 'textfield',
						name: 'lastName',
						placeholder: 'Last',
						required: true
					}, {
						xtype: 'emailfield',
						name: 'email',
						label: 'Email',
						allowBlank: false,
						required: true,
						validators: 'email'
					}, {
						xtype: 'textfield',
						label: 'Subject',
						name: 'subject',
						allowBlank: false,
						required: true
					}, {
						xtype: 'textareafield',
						name: 'message',
						label: 'Message',
						flex: 1,
						allowBlank: false,
						required: true
					}, {
						xtype: 'toolbar',
						docked: 'bottom',
						layout: {
							pack: 'end'
						},
						items: [
							{ xtype: 'button', text: 'Cancel' },
							{ xtype: 'button', text: 'OK' }
						]
					}]
				} },
				{ name: 'Blank', toolkit: 'classic', iconCls: 'x-fa fa-file', view: {
					extend: 'Ext.container.Container'
				} },
				{ name: 'Login', toolkit: 'classic', iconCls: 'x-fa fa-list-alt', view: {
					extend: 'Ext.form.Panel',

					title: 'Login',
					frame: true,
					width: 320,
					bodyPadding: 10,

					height: '100%',

					items: [{
						xtype: 'textfield',
						allowBlank: false,
						fieldLabel: 'User ID',
						name: 'user',
						emptyText: 'user id',
						msgTarget: 'under'
					}, {
						xtype: 'textfield',
						allowBlank: false,
						fieldLabel: 'Password',
						name: 'pass',
						emptyText: 'password',
						inputType: 'password'
					}, {
						xtype: 'checkbox',
						fieldLabel: 'Remember me',
						name: 'remember'
					}],

					// dockedItems: [{
					// 	xtype: 'toolbar',
					// 	dock: 'bottom',
					// 	layout: {
					// 		pack: 'end'
					// 	},
					// 	items: [
					// 		{ xtype: 'button', text: 'Register' },
					// 		{ xtype: 'button', text: 'Login' }
					// 	]
					// }],
					buttons: [
						{ xtype: 'button', text: 'Register' },
						{ xtype: 'button', text: 'Login' }
					],

					defaults: {
						anchor: '100%',
						labelWidth: 120
					}
				} }
			],
			filters: [{
                property: 'toolkit',
                value: '{frameworkToolkit}',
                operator: '='
            }]
		},
		themes: {
			fields: ['id', 'name', 'toolkit'],
			data: [
				{ id: 1, name: 'material', toolkit: 'modern', description: 'Material' },
				{ id: 2, name: 'material', toolkit: 'classic', description: 'Material' },
				{ id: 3, name: 'neptune', toolkit: 'modern', description: 'Neptune' },
				{ id: 4, name: 'neptune', toolkit: 'classic', description: 'Neptune' },
			],
			filters: [{
                property: 'toolkit',
                value: '{frameworkToolkit}',
                operator: '='
            }]
		},
        projectObjects: {
            type: 'projectobjects'
		},
		openFiles: {
            type: 'openfiles'
		},
		projectComponents: {
			type: 'projectcomponents',
			filters: [
				record => {
					return (
						record.get('$type') === 'class' &&
						record.get('access') == undefined &&
						record.get('abstract') !== true &&
						record.get('singleton') !== true &&
						record.get('extended') &&
						record.get('extended').indexOf('Ext.Component') !== -1 &&
						record.get('configs') !== undefined
					)
				}
			],
			proxy: {
				type: 'ajax',
				url: 'doxi_output/{project.toolkit}/{project.toolkit}-all-classes.json',
				reader: {
					type: 'json',
					transform: function(data) {
						return data.global.items
						.map(({ extended, items, ...others }) => {
							const configs = items && items.find(item => item.$type === 'configs')
							const events = items && items.find(item => item.$type === 'events')
							
							return {
								extended: extended && extended.split(','),
								configs: configs && configs.items.filter(config => (
									config.access == undefined
								)),
								events: events && events.items,
								...others
							}
						})
					}
				}
			},
			autoLoad: '{project}'
		}
	}
})
