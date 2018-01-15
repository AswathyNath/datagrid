dojo.require('dijit.form.Button');
dojo.require('dijit.form.TextBox');
dojo.require('dijit.form.CheckBox');
dojo.require('dojo.io.script');
dojo.require('dojox.grid.DataGrid');
dojo.require('dojo.data.ItemFileReadStore');


dojo.ready(function () {
	 var
	checks = dojo.query('input[type=checkbox]').map(function (el) {
		return new dijit.form.CheckBox({ checked: true, value: el.value}, el);
	}),
	
	structure = [
    { field: 'title', name: 'Title', width: '650px' },
    { field: 'creator', name: 'Author', width: 'auto' },
    { field: 'pubDate', name: 'Date', width: 'auto' }
	],
	
	grid = new dojox.grid.DataGrid({
    sortInfo: '-3',
    structure: structure,
    query: { title: '*' }
	}, 'table');
	grid.queryOptions = {ignoreCase: true};
	
	
	filterBox.set('onChange', function () {
    grid.filter({
        title : '*' + filterBox.get('value') + '*'
    });
	});
	
	function getSites (checks) {
    var urls = [];
    dojo.forEach(checks, function (check) {
        if (check.get('checked') === true){
            urls.push('&#39;http://feeds.feedburner.com/' + check.get('value') + '&#39;'); 
        }
    });
    return 'select creator, pubDate, title from rss where url in (' + urls.join(', ') + ')';
}

function getTuts (query) {
    return dojo.io.script.get({
        url : 'http://query.yahooapis.com/v1/public/yql',
        content: {
            q: query,
            format: 'json'
        }
    }).then(function (data) {
 
    });
};

var items = data.query.results.item,
typemap = {
    'Date' : {
        deserialize: function (value) {
            var date = new Date(value),
            month = date.getMonth(),
            day  = date.getDate();
 
            month = month < 10 ? '0' + month : month;
            day  = day < 10 ? '0' + day : day;
            return date.getFullYear() + '-' + month + '-' + day;
        }
    }
};

for ( var i = 0; items[i]; i++ ) {
    items[i].creator = (typeof items[i].creator === string) ? items[i].creator : items[i].creator.content;
    items[i].pubDate = { _value: items[i].pubDate, _type: 'Date' };
}

return new dojo.data.ItemFileReadStore({
    data: { items: items },
    typeMap: typemap
});

update.set('onClick', function () {
 
    getTuts(getSites(checks))
        .then(function (data) {
            grid.setStore(data);
        });
 
});

// initially fill table
getTuts(getSites(checks))
    .then(function (tutsdata) {
        grid.set('store', tutsdata);
        grid.startup();
    });
});