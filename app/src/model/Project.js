Ext.define('Wysiwyg.model.Project', {
    extend: 'Wysiwyg.model.Object',

    statics: {
        indexTpl: `
<!DOCTYPE HTML>
<html manifest="">
<head>
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=10, user-scalable=yes">
    <title>{name}</title>
    <style>
        html, body {
            margin: 0;
            width: 100%;
            height: 100%;
        }
        .x-component, [data-componentid] {
            cursor: pointer !important;
        }
        .editor-valid-dropable {
            background-color: rgba(33, 150, 243, 0.3) !important;
        }
        .editor-selected, .editor-selected.x-noborder-trbl {
            border: 1px solid #2196f3 !important;
        }
    </style>
    <tpl for="css">
        <link rel="stylesheet" type="text/css" href="{.}" >
    </tpl>
    <tpl for="js">
        <script type="text/javascript" src="{.}"></script>
    </tpl>
    <script type="text/javascript">
        const contextId = window.frameElement.id
        const componentCls = 'x-component'
        componentIdAttr = 'data-componentid'
        const containerCls = 'x-container'
        const validDropZoneCls = 'editor-valid-dropable'
        const dropTargetSelector = '.x-viewport .' + containerCls
        const selectedCls = 'editor-selected'
        const attributeRef = 'editor-record-id'
        let scriptMetadata = null
        let selected = null
        let dragInfo = null
        let targets = null
        let scriptEl = null
        let isDraggingParent = false
        let dropZones = []
        let currentCmp = null

        const getCurrentTarget = target => {
            if (Ext.isModern) {
                return target.classList.contains(componentCls) ? target : target.closest('.' + componentCls)
            }
            else {
                return target.getAttribute(componentIdAttr) ? target : target.closest('[' + componentIdAttr + ']')
            }
        }
        const isDragEvent = event => (event.buttons === 1)
        const emptyNode = node => { while(node.lastChild) node.removeChild(node.lastChild) }
        const postMessage = message => window.parent.postMessage(JSON.stringify(Object.assign(message, message.args ? message : { args: [] }, { contextId })), '*')
        const handleElementMouseEnter = event => {
            if (isDraggingParent && isDragEvent(event)) {
                const { clientX, clientY, pageX, pageY, target } = event

                event.stopPropagation()
                
                dropZones.forEach(el => el.classList.remove(validDropZoneCls))
                target.classList.add(validDropZoneCls)
                dropZones.push(target)

                postMessage({ 
                    type: 'dragenter',
                    args: [{ clientX, clientY, pageX, pageY }]
                })   
            }
        }
        const handleElementMouseLeave = event => {
            if (isDraggingParent && isDragEvent(event)) {
                const { clientX, clientY, pageX, pageY, target } = event
                
                event.stopPropagation()

                target.classList.remove(validDropZoneCls)
                dropZones.pop()
                if (dropZones.length > 0) {
                    dropZones[dropZones.length - 1].classList.add(validDropZoneCls)
                }
                
                postMessage({ 
                    type: 'dragleave',
                    args: [{ clientX, clientY, pageX, pageY }]
                })
            }
        }
        const handleElementMouseUp = event => {
            if (isDraggingParent && !isDragEvent(event)) {
                const { clientX, clientY, pageX, pageY, target } = event
                const currentTarget = target.classList.contains(containerCls) ? target : target.closest('.' + containerCls)
                
                event.stopPropagation()

                postMessage({ 
                    type: 'drop',
                    args: [dragInfo, { clientX, clientY, pageX, pageY, target: { id: target.id } , currentTarget: { id: currentTarget.getAttribute(attributeRef) } }]
                })

                postMessage({ 
                    type: 'dragend',
                    args: [{ clientX, clientY, pageX, pageY }]
                })
            }   
        }
        const handleMouseEnter = event => {
            // if (isDraggingParent && isDragEvent(event)) {
            //     const { clientX, clientY, pageX, pageY } = event
            //     console.log('mouseenter', event)
            //     postMessage({ 
            //         type: 'dragenter',
            //         args: [{ clientX, clientY, pageX, pageY }]
            //     })   
            // }
        }
        const handleMouseMove = event => {
            if (isDraggingParent && isDragEvent(event)) {
                const { clientX, clientY, pageX, pageY } = event
                
                postMessage({ 
                    type: 'drag',
                    args: [{ clientX, clientY, pageX, pageY }]
                })    
            }
        }
        const handleMouseDown = event => {
            const { target } = event
            const currentTarget = currentCmp = getCurrentTarget(target)

            event.stopPropagation()
        }
        const handleMouseUp = event => {
            const { clientX, clientY, pageX, pageY, target } = event
            const currentTarget = currentCmp = getCurrentTarget(target)

            event.stopPropagation()

            if (currentCmp && currentCmp.id === currentTarget.id) {
                postMessage({ 
                    type: 'tap',
                    args: [{ currentTarget: { id: currentTarget.getAttribute(attributeRef) } }]
                })
            }

            if (isDraggingParent && !isDragEvent(event)) {
                postMessage({ 
                    type: 'dragend',
                    args: [{ clientX, clientY, pageX, pageY }]
                })
            }
        }
        const observables = enabled => {
            if (enabled) {
                document.addEventListener("mouseenter", handleMouseEnter, false)
                document.addEventListener("mousemove", handleMouseMove, false)
                // document.addEventListener("mouseleave", handleMouseLeave, false)
                document.addEventListener("mouseup", handleMouseUp, false)
            }
            else {
                document.removeEventListener("mouseenter", handleMouseEnter, false)
                document.removeEventListener("mousemove", handleMouseMove, false)
                // document.removeEventListener("mouseleave", handleMouseLeave, false)
                document.removeEventListener("mouseup", handleMouseUp, false)
            }
        }
        const listeners = {
            loadScript: (src, metadata) => {
                const code = new Blob([src], { type : 'text/javascript' })
                const scriptObjectURL = URL.createObjectURL(code)

                if (scriptEl) {
                    targets.forEach(element => {
                        element.removeEventListener("mouseenter", handleElementMouseEnter, false)
                        element.removeEventListener("mouseleave", handleElementMouseLeave, false)
                        element.addEventListener("mouseup", handleElementMouseUp, false)
                    })
                    emptyNode(document.body)
                    document.head.removeChild(scriptEl)
                }
                scriptEl = document.createElement('script')

                scriptEl.onload = function() {
                    //Register all drop target/selector
                    targets = document.querySelectorAll(dropTargetSelector)

                    targets.forEach(element => {
                        element.addEventListener("mouseenter", handleElementMouseEnter, false)
                        element.addEventListener("mouseleave", handleElementMouseLeave, false)
                        element.addEventListener("mouseup", handleElementMouseUp, false)
                    })

                    postMessage({ 
                        type: 'loadedscript'
                    })

                    URL.revokeObjectURL(scriptObjectURL)
                }
                
                scriptMetadata = metadata
                scriptEl.src = scriptObjectURL
                document.head.appendChild(scriptEl)
            },
            select: id => {
                if (selected) {
                    selected.classList.remove(selectedCls)   
                }
                // const el = document.getElementById(id)
                const selector = '[' + attributeRef + '="' + id + '"]'
                const el = document.querySelector(selector)
                if (el) {
                    el.classList.add(selectedCls)
                    selected = el
                }
            },
            dragStart: info => {
                // draggable(true)
                dragInfo = info
                isDraggingParent = true
            },
            dragEnd: () => {
                dragInfo = null
                isDraggingParent = false
                // draggable(false)
            }
        }

        document.addEventListener("mousedown", handleMouseDown, false)
        observables(true)

        window.addEventListener("message", message => {
            const event = message.data
            const listener = listeners[event.type]
            
            if (listener) {
                listener(...event.args)
            }
        }, false)

        var Ext = Ext || {}

        Ext.onReady(() => {
            postMessage({
                type: 'ready' 
            })
        })
    </script>
</head>
</html>
`,
},

    fields: ['id', 'name', 'extVersion', 'extToolkit', 'extTheme'],

    getContentDocument: function() {
        const me = this
        const tpl = Wysiwyg.model.Project.indexTpl
        const { senchaCdn, extVersion, assets } = me.getData()

        return (new Ext.XTemplate(tpl, {})).apply({
            uuid: Ext.data.identifier.Uuid.Global.generate(),
            css: assets.css.map(css => `${senchaCdn}/${extVersion}/build/${css}`),
            js: assets.js.map(js => `${senchaCdn}/${extVersion}/build/${js}`)
        })
    }
})