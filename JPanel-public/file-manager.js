//include isMobile
!function(a){var b=/iPhone/i,c=/iPod/i,d=/iPad/i,e=/(?=.*\bAndroid\b)(?=.*\bMobile\b)/i,f=/Android/i,g=/(?=.*\bAndroid\b)(?=.*\bSD4930UR\b)/i,h=/(?=.*\bAndroid\b)(?=.*\b(?:KFOT|KFTT|KFJWI|KFJWA|KFSOWI|KFTHWI|KFTHWA|KFAPWI|KFAPWA|KFARWI|KFASWI|KFSAWI|KFSAWA)\b)/i,i=/IEMobile/i,j=/(?=.*\bWindows\b)(?=.*\bARM\b)/i,k=/BlackBerry/i,l=/BB10/i,m=/Opera Mini/i,n=/(CriOS|Chrome)(?=.*\bMobile\b)/i,o=/(?=.*\bFirefox\b)(?=.*\bMobile\b)/i,p=new RegExp("(?:Nexus 7|BNTV250|Kindle Fire|Silk|GT-P1000)","i"),q=function(a,b){return a.test(b)},r=function(a){var r=a||navigator.userAgent,s=r.split("[FBAN");return"undefined"!=typeof s[1]&&(r=s[0]),s=r.split("Twitter"),"undefined"!=typeof s[1]&&(r=s[0]),this.apple={phone:q(b,r),ipod:q(c,r),tablet:!q(b,r)&&q(d,r),device:q(b,r)||q(c,r)||q(d,r)},this.amazon={phone:q(g,r),tablet:!q(g,r)&&q(h,r),device:q(g,r)||q(h,r)},this.android={phone:q(g,r)||q(e,r),tablet:!q(g,r)&&!q(e,r)&&(q(h,r)||q(f,r)),device:q(g,r)||q(h,r)||q(e,r)||q(f,r)},this.windows={phone:q(i,r),tablet:q(j,r),device:q(i,r)||q(j,r)},this.other={blackberry:q(k,r),blackberry10:q(l,r),opera:q(m,r),firefox:q(o,r),chrome:q(n,r),device:q(k,r)||q(l,r)||q(m,r)||q(o,r)||q(n,r)},this.seven_inch=q(p,r),this.any=this.apple.device||this.android.device||this.windows.device||this.other.device||this.seven_inch,this.phone=this.apple.phone||this.android.phone||this.windows.phone,this.tablet=this.apple.tablet||this.android.tablet||this.windows.tablet,"undefined"==typeof window?this:void 0},s=function(){var a=new r;return a.Class=r,a};"undefined"!=typeof module&&module.exports&&"undefined"==typeof window?module.exports=r:"undefined"!=typeof module&&module.exports&&"undefined"!=typeof window?module.exports=s():"function"==typeof define&&define.amd?define("isMobile",[],a.isMobile=s()):a.isMobile=s()}(this);

var currentDir = "";
// prepare monaco
var editor;
var singleColumn = false;

var master = $('#masterColumn');
var detail = $('#detailColumn');

var editorContainer = $('#editor');

var header = $('#panel-header');

var yamlDef = {
	// Set defaultToken to invalid to see what you do not tokenize yet
	defaultToken: 'invalid',

	keywords: [], // yaml has no key words

	operators: [],

	brackets: [
		['(',')','delimiter.parenthesis'],
		['{','}','delimiter.curly'],
		['[',']','delimiter.square']
	],

	// operator symbols
	symbols:    /[=><!~&|+\-*\/\^%]+/,
	delimiters: /[;=.@:,`]/,

	yamlkeys: /(?:[A-z0-9_-]*)(:)/,

	// strings
	escapes: /\\(?:[abfnrtv\\"'\n\r]|x[0-9A-Fa-f]{2}|[0-7]{3}|u[0-9A-Fa-f]{4}|U[0-9A-Fa-f]{8}|N\{\w+\})/,
	rawpre: /(?:[rR]|ur|Ur|uR|UR|br|Br|bR|BR)/,
	strpre: /(?:[buBU])/,

	// The main tokenizer for our languages
	tokenizer: {
		root: [
			[/@yamlkeys/, { token: 'keyword', bracket: '@open' }], // bracket for indentation

			// strings: need to check first due to the prefix
			[/@strpre?("""|''')/, { token: 'string.delim', bracket: '@open', next: '@mstring.$1' } ],
			[/@strpre?"([^"\\]|\\.)*$/, 'string.invalid' ],  // non-teminated string
			[/@strpre?'([^'\\]|\\.)*$/, 'string.invalid' ],  // non-teminated string
			[/@strpre?(["'])/,  { token: 'string.delim', bracket: '@open', next: '@string.$1' } ],

			[/@rawpre("""|''')/, { token: 'string.delim', bracket: '@open', next: '@mrawstring.$1' } ],
			[/@rawpre"([^"\\]|\\.)*$/, 'string.invalid' ],  // non-teminated string
			[/@rawpre'([^'\\]|\\.)*$/, 'string.invalid' ],  // non-teminated string
			[/@rawpre(["'])/,  { token: 'string.delim', bracket: '@open', next: '@rawstring.$1' } ],

			// identifiers and keywords
			[/__[\w$]*/, 'predefined' ],
			[/[a-z_$][\w$]*/, { cases: { '@keywords': 'keyword',
				'@default': 'identifier' } }],
			[/[A-Z][\w]*/, { cases: { '~[A-Z0-9_]+': 'constructor.identifier',
				'@default'   : 'namespace.identifier' }}],  // to show class names nicely

			// whitespace
			{ include: '@whitespace' },

			// delimiters and operators
			[/[{}()\[\]]/, '@brackets'],
			[/@symbols/, { cases: { '@keywords' : 'keyword',
				'@operators': 'operator',
				'@default'  : '' } } ],

			// numbers
			[/\d*\.\d+([eE][\-+]?\d+)?/,   'number.float'],
			[/0[xX][0-9a-fA-F]+[lL]?/,     'number.hex'],
			[/0[bB][0-1]+[lL]?/,           'number.binary'],
			[/(0[oO][0-7]+|0[0-7]+)[lL]?/, 'number.octal'],
			[/(0|[1-9]\d*)[lL]?/,          'number'],

			//[/@yamlkeys/, 'keyword'],

			// delimiter: after number because of .\d floats

			[/@delimiters/, { cases: { '@keywords': 'keyword',
				'@default': 'delimiter' }}],

		],

		comment: [
			[/[^\/*]+/, 'comment' ],
			[/\/\*/,    'comment', '@push' ],    // nested comment
			["\\*/",    'comment', '@pop'  ],
			[/[\/*]/,   'comment' ]
		],

		// Regular strings
		mstring: [
			{ include: '@strcontent' },
			[/"""|'''/,  { cases: { '$#==$S2':  { token: 'string.delim', bracket: '@close', next: '@pop' },
				'@default': { token: 'string' } } }],
			[/["']/, 'string' ],
			[/./,    'string.invalid'],
		],

		string: [
			{ include: '@strcontent' },
			[/["']/, { cases: { '$#==$S2': { token: 'string.delim', bracket: '@close', next: '@pop' },
				'@default': { token: 'string' } } } ],
			[/./, 'string.invalid'],
		],

		strcontent: [
			[/[^\\"']+/,  'string'],
			[/\\$/,       'string.escape'],
			[/@escapes/,  'string.escape'],
			[/\\./,       'string.escape.invalid'],
		],

		// Raw strings: we distinguish them to color escape sequences correctly
		mrawstring: [
			{ include: '@rawstrcontent' },
			[/"""|'''/,  { cases: { '$#==$S2':  { token: 'string.delim', bracket: '@close', next: '@pop' },
				'@default': { token: 'string' } } }],
			[/["']/, 'string' ],
			[/./,    'string.invalid'],
		],

		rawstring: [
			{ include: '@rawstrcontent' },
			[/["']/, { cases: { '$#==$S2': { token: 'string.delim', bracket: '@close', next: '@pop' },
				'@default': { token: 'string' } } } ],
			[/./, 'string.invalid'],
		],

		rawstrcontent: [
			[/[^\\"']+/, 'string'],
			[/\\["']/,   'string'],
			[/\\u[0-9A-Fa-f]{4}/, 'string.escape'],
			[/\\/, 'string' ],
		],

		// whitespace
		whitespace: [
			[/[ \t\r\n]+/, 'white'],
			[/#.*$/,       'comment'],
		],
	},
};

var miniEditor = {
	setValue: function (text) {
		this.textArea.text(text);
	},
	getValue: function () {
		return this.textArea.text();
	},
	layout: function () {
		return null; // stub function
	}
};

$(document).ready(function () {
    $("#save-btn").hide();

	if (isMobile.any) {
		//editorContainer.attr("contentEditable", true);
		editor = miniEditor;
		editor.textArea = $("<textarea id='editorArea'></textarea>");
		editor.textArea.addClass("editorArea");
		editorContainer.append(editor.textArea);

		tabIndent.config.tab = '  ';
		tabIndent.render(document.getElementById("editorArea"));
	} else {
		require.config({paths: {'vs': '/monaco-editor/dev/vs'}});
		require(['vs/editor/editor.main'], function () {
			monaco.languages.register({id: 'yaml'});
			monaco.languages.setMonarchTokensProvider('yaml', yamlDef);
		});
	}

    $.ajax({
        url: "/file/",
        success: function (result) {
            var result = JSON.parse(result);
            var fileList = $("#file-list");
            for (var i = 0; i < result.folders.length; i++) {
                var folder = {"folder": result.folders[i]};
                fileList.append(tmpl("item_tmpl", folder));
            }
            for (var i = 0; i < result.files.length; i++) {
                var file = {"file": result.files[i]};
                fileList.append(tmpl("file_tmpl", file));
            }
        }
	});
	responsiveUi()
});

window.addEventListener('resize', function(event){
	responsiveUi();
	editor.layout();
});

function responsiveUi() {
	var w = window.innerWidth
		|| document.documentElement.clientWidth
		|| document.body.clientWidth;

	if (singleColumn && w <= 600) return;
	if (!singleColumn && w >= 600) return;

		singleColumn = (w <= 600);

	if (!singleColumn) {
		master.show();
		detail.show();
		editorContainer.height(editorContainer.height() - 76);

		header.show()
	} else {
		master.show();
		detail.hide();
	}
}

function loadCurrentDir() {
	$.ajax({
		url: "/file/" + currentDir,
		success: function (result) {
			var result = JSON.parse(result);
			var fileList = $("#file-list");
			fileList.html("");
			var folder = {"folder": ".."};
			fileList.append(tmpl("item_tmpl", folder));
			for (var i = 0; i < result.folders.length; i++) {
				var folder = {"folder": result.folders[i]};
				fileList.append(tmpl("item_tmpl", folder));
			}
			for (var i = 0; i < result.files.length; i++) {
				var file = {"file": result.files[i]};
				fileList.append(tmpl("file_tmpl", file));
			}
		}});
}

function openFolder(folder) {
    if (folder == "..") {
        var folders = currentDir.split("/");
        folders.pop(-1);
        currentDir = folders.join("/");
    } else {
        currentDir += "/" + folder;
    }

    console.log(currentDir);

	loadCurrentDir();
}

$("#upload-btn").change(function(){
	var file = this.files[0];
	var name = file.name;

	var formData = new FormData($('#uploadForm')[0]);
	$.ajax({
		url: "/file/" + currentDir + "/" + name,
		type: 'POST',
		xhr: function() {  // Custom XMLHttpRequest
			var myXhr = $.ajaxSettings.xhr();

			function onProgress(e) {
				$('#upload-btn-label').text("Uploading " + name + ": " + e.loaded);
			}

			if(myXhr.upload) { // Check if upload property exists
				myXhr.upload.addEventListener('progress', onProgress, false); // For handling the progress of the upload
			}
			return myXhr;
		},
		//Ajax events
		success: function () {
			$('#upload-btn-label').text("Upload File");
			alert("File uploaded");
		},
		// Form data
		data: formData,
		//Options to tell jQuery not to process data or worry about content-type.
		cache: false,
		contentType: false,
		processData: false
	});
});

function openFile(file) {
    currentFile = currentDir + "/" + file;

    console.log(currentFile);
    $.ajax({
        url: "/file/" + currentFile,
        success: function (result) {
            $("#save-btn").show();

			if (editor || isMobile.any) {
				editor.setValue(result);
			} else {
				editor = monaco.editor.create(document.getElementById("editor"), {
					value: result,
					scrollBeyondLastLine: false,
					renderWhitespace: true,
					folding: true,
					indentGuides: false,
					theme: "vs-dark",
					language: 'yaml'
				});
			}

			if (singleColumn) {
				master.hide();
				detail.show();

				editorContainer.height(editorContainer.height() + 76);

				header.hide();
			}

			console.log(document.getElementById('panel-header').style.height);

			editor.layout();
		}});
}

function saveFile() {
    $.post( "/file/" + currentFile, editor.getValue(), function(result) {
        if (result == 0) {
            alert( "You're not allowed to edit files!" );
        } else {
            alert( "File successfully saved!" );
        }

		if (singleColumn) {
			master.show();
			detail.hide();
			editorContainer.height(editorContainer.height() - 76);

			header.show();
		}
    });
}

// Simple JavaScript Templating
// John Resig - http://ejohn.org/ - MIT Licensed
(function(){
    var cache = {};

    this.tmpl = function tmpl(str, data){
        // Figure out if we're getting a template, or if we need to
        // load the template - and be sure to cache the result.
        var fn = !/\W/.test(str) ?
            cache[str] = cache[str] ||
                tmpl(document.getElementById(str).innerHTML) :

            // Generate a reusable function that will serve as a template
            // generator (and which will be cached).
            new Function("obj",
                "var p=[],print=function(){p.push.apply(p,arguments);};" +

                    // Introduce the data as local variables using with(){}
                "with(obj){p.push('" +

                    // Convert the template into pure JavaScript
                str
                    .replace(/[\r\t\n]/g, " ")
                    .split("<%").join("\t")
                    .replace(/((^|%>)[^\t]*)'/g, "$1\r")
                    .replace(/\t=(.*?)%>/g, "',$1,'")
                    .split("\t").join("');")
                    .split("%>").join("p.push('")
                    .split("\r").join("\\'")
                + "');}return p.join('');");

        // Provide some basic currying to the user
        return data ? fn( data ) : fn;
    };
})();

