Ext.define('Wysiwyg.view.main.MainViewController', {
	extend: 'Ext.app.ViewController',
	alias: 'controller.mainviewcontroller',

	destroy: function() {
		Ext.destroy(this.newView)
		Ext.destroy(this.newProject)
		this.callParent()
	},

	initViewModel: function(viewModel) {
		const me = this

		viewModel.bind('{devices}', function(store) {
			if (store.isLoaded()) {
				const device = viewModel.get('device')

				if (!device) {
					viewModel.set('device', store.getAt(0))
				}
			}
		}, me, { deep: true })

		viewModel.bind('{templates}', function(store) {
			if (store.isLoaded()) {
				const template = viewModel.get('template')

				if (!template) {
					viewModel.set('template', store.getAt(0))
				}
			}
		}, me, { deep: true })

		viewModel.bind('{selection}', selection => {
			console.log('MainController:initViewModel',selection)
		})
	},

	init: function() {
		this.onNewProject()
	},

	createViewPackage: function(project, name) {
		const me = this
		const viewModel = me.getViewModel()
		
		if (project) {
			const template = viewModel.get('template')
			const viewRecord = Wysiwyg.ComponentHandler.createView(name, template)
			const viewModelRecord = new Wysiwyg.model.ViewModel({
				name: `${name}ViewModel`,
				// iconCls: 'x-fa fa-database',
				extend: 'Ext.app.ViewModel',
				mode: 'visual'
			})
			const viewControllerRecord = new Wysiwyg.model.ViewController({
				name: `${name}ViewController`,
				// iconCls: 'x-fa fa-code',
				extend: 'Ext.app.ViewController',
				mode: 'code',
				children: [],
				leaf: true
			})
			const viewPackageRecord = new Wysiwyg.model.ViewPackage({
				name: name.toLowerCase(),
				children: [viewRecord, viewModelRecord, viewControllerRecord]
			})

			project.appendChild(viewPackageRecord)
			viewModel.set('selection', viewRecord)
		}
	},

	createProject: function(projectName, framework, theme) {
		const me = this
		const viewModel = me.getViewModel()
		const projectObjects = viewModel.getStore('projectObjects')
		const senchaCdn = 'https://cdn.sencha.com/ext/commercial'
		const extVersion = framework.get('version')
		const extToolkit =  framework.get('toolkit')
		const extTheme = theme.get('name')
		const debug = ''//'-debug'
		const project = new Wysiwyg.model.Project({
			name: projectName,
			toolkit: extToolkit, //?
			expanded: true,
			senchaCdn,
			extVersion,
			extToolkit,
			extTheme,
			assets: {
				js: [
					`ext${extToolkit === 'modern' ? '-modern' : ''}-all${debug}.js`, 
					`${extToolkit}/theme-${extTheme}/theme-${extTheme}${debug}.js`
				],
				css: [
					`${extToolkit}/theme-${extTheme}/resources/theme-${extTheme}-all${debug}.css`
				]
			},

			children: []
		})

		const mainViewName = 'Main'
		//Project Components Definition after initialization & loaded all framework specific component definitions
		const binding = viewModel.bind('{projectComponents}', function(store) {
			if (store.isLoaded()) {
				Ext.destroy(binding)
				
				Wysiwyg.ComponentHandler.setStore(store)
				me.createViewPackage(project, mainViewName)
			}
		}, me, { deep: true })

		viewModel.set('project', project.getData())

		projectObjects.setRoot(project)
	},

	closeProject: function() {
		const me = this
		const viewModel = me.getViewModel()
		const openFiles = viewModel.get('openFiles')
		const projectObjects = viewModel.getStore('projectObjects')

		openFiles.removeAll()
		projectObjects.removeAll()
	},

	onNewProjectCancel: function() {
		this.newProject.hide()
	},

	onNewProjectCreate: function() {
		const me = this
		const newProject = me.newProject
		const form = newProject.getInnerAt(0)

		if (form.validate()) {
			const viewModel = me.getViewModel()
			const projectObjects = viewModel.getStore('projectObjects')
			const project = projectObjects.getRoot()
			const framework = form.lookupName('framework').getSelection()
			const theme = form.lookupName('theme').getSelection()
			const projectName = form.lookupName('name').getValue()

			newProject.hide()

			if (project && project.childNodes.length > 0) {
				Ext.Msg.confirm('Confirmation', 'Are you sure you want to close this project without saving ?', function(buttonId) {
					if (buttonId === 'yes') {
						me.closeProject()
						me.createProject(projectName, framework, theme)
					}
				})
			}
			else {
				me.createProject(projectName, framework, theme)
			}
		}
	},

	onNewProject: function() {
		const me = this
		const view = me.getView()
		let dialog = me.newProject

		if (!dialog) {
			dialog = me.newProject = Ext.create(Ext.apply({
                ownerCmp: view
            }, view.newProject))
		}
		const form = dialog.getInnerAt(0) 
		
		form.lookupName('name').setValue(null)
		dialog.show()
	},

	onNewViewCancel: function() {
		this.newView.hide()
	},

	onNewViewCreate: function() {
		const me = this
		const newView = me.newView
		const form = newView.getInnerAt(0)

		if (form.validate()) {
			const viewModel = me.getViewModel()
			const projectObjects = viewModel.getStore('projectObjects')
			const project = projectObjects.getRoot()
			const extend = (project.get('extToolkit') === 'modern') ? 'Ext.Container' : 'Ext.container.Container'
			const name = form.getValues()['name']

			me.createViewPackage(project, name, extend)

			newView.hide()
		}
	},

	onNewView: function() {
		const me = this
		const view = me.getView()
		let dialog = me.newView

		if (!dialog || (dialog && dialog.isDestroyed)) {
			dialog = me.newView = Ext.create(Ext.apply({
                ownerCmp: view
            }, view.newView))
		}
		dialog.show()
	},

	onItemDragStart: function(source, info, event, eOpts) {
		const me = this
		//TODO: Better way to access to visualEditor
		const editors = me.lookup('editorsview')
		const activeEditor = editors.getActiveItem()
		const editorRecord = activeEditor && activeEditor.getViewModel().get('record')

		if (editorRecord instanceof Wysiwyg.model.View && editorRecord.get('mode') === 'visual') {
			//Let's cache visualEditor to track item dragging throught the iframe
			const activeVisualEditor = me.activeVisualEditor = activeEditor.getController().getVisualEditor()
			const dragInfo = { data: (info.data && info.data.record) ? { id: info.data.record.getId() } : null }
			activeVisualEditor.on({
				drag: 'onEditorDrag', 
				dragend: 'onEditorDragEnd', 
				scope: me
			})
			activeVisualEditor.fireMessage('dragStart', dragInfo)
		}
		source.getProxy().setHtml(info.eventTarget.innerHTML)
	},

	onItemDragMove: function(source, info, event, eOpts) {
		const me = this
		//Here becasue drag.Source has handle and dragstart does not report the right element
		if (!me.dragEventCache) {
			me.dragEventCache = { element: source.getElement(), event }
		}
	},

	onItemDragEnd: function(source, info, event, eOpts) {
		const me = this
		const activeVisualEditor = me.activeVisualEditor

		if (activeVisualEditor) {
			me.dragEventCache = null

			activeVisualEditor.un({
				drag: 'onEditorDrag', 
				dragend: 'onEditorDragEnd',
				scope: me
			})
			activeVisualEditor.fireMessage('dragEnd')
			me.activeVisualEditor	= null
		}
	},

	handleEditorDraggable: function(name, editor, newEvent) {
		const me = this
		const dragEventCache = me.dragEventCache

		if (dragEventCache) {
			let { element, event } = dragEventCache
			const padding = editor.element.getBorderPadding()
			const [deltaX, deltaY] = editor.element.getXY()

			newEvent.pageX = newEvent.clientX = newEvent.pageX + deltaX + padding.afterX
			newEvent.pageY = newEvent.clientY = newEvent.pageY + deltaY + padding.afterY
			
			//Spoofing event
			event.xy = null
			event.point = null
			element.fireEvent(name, Ext.apply(event, newEvent))
		}
	},

	onEditorDrag: function(editor, newEvent) {
		this.handleEditorDraggable('drag', editor, newEvent)
	},

	onEditorDragEnd: function(editor, newEvent) {
		this.handleEditorDraggable('dragend', editor, newEvent)	
	}

})