Ext.define('Wysiwyg.component.PropertyGrid', {
    extend: 'Ext.grid.Grid',
    alias: 'widget.propertygrid',

    config: {
        methodOptions: null
    },

    plugins: {
        propertygridediting: {
            triggerEvent: 'singletap',
            selectOnEdit: true
        }
    },

    // infinite: false, ///
    // maxHeight: '50%',

    selectable: {
        rows: false,
        cells: true
    },

    hideHeaders: true,
    columnLines: true,
    titleBar: null,

    columns: [{
        text:'Name',
        flex: 1,
        dataIndex: 'name',
        editable: false
    }, {
        text: 'Value',
        flex: 1,
        dataIndex: 'value',
        editable: true,
    }]

})