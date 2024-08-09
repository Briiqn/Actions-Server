var connected = true;

function refresh() {
    var progressCPU = $("#cpu");
    var textCPU = $("#cpu-text");

    var progressRAM = $("#ram");
    var textRAM = $("#ram-text");

    var progressTPS = $("#tps");
    var textTPS = $("#tps-text");

    if (connected) {
        $.ajax({
            url: "/stats",
            success: function (result) {
                var result = JSON.parse(result);
                progressRAM.attr("class", "determinate");
                progressRAM.css("width", (result.free / result.total) * 100 + "%");
                textRAM.text("RAM: " + Math.round(result.free / 1024) + "MB / " + Math.round(result.total / 1024) + "MB");

                progressCPU.attr("class", "determinate");
                progressCPU.css("width", result.cpu + "%");
                textCPU.text("CPU usage: " + result.cpu + "%");

                progressTPS.attr("class", "determinate");
                progressTPS.css("width", (result.tps * 5) + "%");
                textTPS.text("TPS: " +  Math.round(result.tps));
            },
            error: function (result) {
                Materialize.toast('Connection failed!', 10000,'',function(){connected = true});
                textCPU.text("CPU usage: ?");
                textTPS.text("TPS: ?");
                textRAM.text("RAM: ?");

                connected = false;
            }
        });
    }
}

function ansiformat(data) {
    var ansiTextArray = ansiparse(data);
    var text = "";

    for (i = 0; i < ansiTextArray.length; i++) {
        var data = ansiTextArray[i];
        if ('foreground' in data) {
            text += '<span style="color: ' + data.foreground + '">' + data.text + '</span>';
        } else {
            text += data.text;
        }
    }

    return text;
}


$(document).ready(function () {
    var scrollback;
    var fragment = document.createDocumentFragment();
    var term = $('#term-content');

	var protocol = window.location.protocol != "https:" ? "ws" : "wss";

	var socket = new WebSocket(protocol + "://" + document.domain + ":" + window.location.port + "/socket");

	socket.onmessage = function (event) {
		if (event.data.contains("SCROLLBACK")) {
			dataArray = event.data.split(" ");
			scrollback = dataArray[1];
		}

		if (scrollback > 0) {
			var newLine = document.createElement('p');
			newLine.className = "term_line";
			newLine.innerHTML = ansiformat(event.data);
			fragment.appendChild(newLine);
			scrollback--;
		} else if (scrollback == 0) {
			var newLine = document.createElement('p');
			newLine.className = "term_line";
			newLine.innerHTML = ansiformat(event.data);
			fragment.appendChild(newLine);
			term.append(fragment);
			scrollback--;
			term.scrollTop(term.prop("scrollHeight"));
		} else {
			var newLine = document.createElement('p');
			newLine.className = "term_line";
			newLine.innerHTML = ansiformat(event.data);
			term.append(newLine);
			term.scrollTop(term.prop("scrollHeight"));
		}
	}

    $("#cmd_box").on('keypress', function (event) {
        if(event.which === 13){
            event.preventDefault()
            runCommand($(this).val());
            $(this).val("");
        }
    });

    $("#cmd_form").submit(function(){
        runCommand( $("#cmd_box").val());
        $("#cmd_box").val("");
        return false;
    });

    function runCommand(command) {
        if (command !== '') {
            if ((command == 'stop') || (command == 'reload')) {
                var cmd = command;
                if (confirm("Are you sure you want to " + cmd + " the server?")) {
                    socket.send(cmd);
                }
            } else {
                socket.send(command);
            }
        }
    }

    window.setInterval(function(){
        refresh();
    }, 1000);

});


// include ansi renderer
// Taken from: https://github.com/travis-ci/travis-web/blob/76af32013bc3ab1e5f540d69da3a97c3fec1e7e9/assets/scripts/vendor/ansiparse.js
var ansiparse = function (str) {
    //
    // I'm terrible at writing parsers.
    //
    var matchingControl = null,
        matchingData = null,
        matchingText = '',
        ansiState = [],
        result = [],
        state = {},
        eraseChar;

    //
    // General workflow for this thing is:
    // \033\[33mText
    // |     |  |
    // |     |  matchingText
    // |     matchingData
    // matchingControl
    //
    // In further steps we hope it's all going to be fine. It usually is.
    //

    //
    // Erases a char from the output
    //
    eraseChar = function () {
        var index, text;
        if (matchingText.length) {
            matchingText = matchingText.substr(0, matchingText.length - 1);
        }
        else if (result.length) {
            index = result.length - 1;
            text = result[index].text;
            if (text.length === 1) {
                //
                // A result bit was fully deleted, pop it out to simplify the final output
                //
                result.pop();
            }
            else {
                result[index].text = text.substr(0, text.length - 1);
            }
        }
    };

    for (var i = 0; i < str.length; i++) {
        if (matchingControl != null) {
            if (matchingControl == '\033' && str[i] == '\[') {
                //
                // We've matched full control code. Lets start matching formating data.
                //

                //
                // "emit" matched text with correct state
                //
                if (matchingText) {
                    state.text = matchingText;
                    result.push(state);
                    state = {};
                    matchingText = "";
                }

                matchingControl = null;
                matchingData = '';
            }
            else {
                //
                // We failed to match anything - most likely a bad control code. We
                // go back to matching regular strings.
                //
                matchingText += matchingControl + str[i];
                matchingControl = null;
            }
            continue;
        }
        else if (matchingData != null) {
            if (str[i] == ';') {
                //
                // `;` separates many formatting codes, for example: `\033[33;43m`
                // means that both `33` and `43` should be applied.
                //
                // TODO: this can be simplified by modifying state here.
                //
                ansiState.push(matchingData);
                matchingData = '';
            }
            else if (str[i] == 'm') {
                //
                // `m` finished whole formatting code. We can proceed to matching
                // formatted text.
                //
                ansiState.push(matchingData);
                matchingData = null;
                matchingText = '';

                //
                // Convert matched formatting data into user-friendly state object.
                //
                // TODO: DRY.
                //
                ansiState.forEach(function (ansiCode) {
                    if (ansiparse.foregroundColors[ansiCode]) {
                        state.foreground = ansiparse.foregroundColors[ansiCode];
                    }
                    else if (ansiparse.backgroundColors[ansiCode]) {
                        state.background = ansiparse.backgroundColors[ansiCode];
                    }
                    else if (ansiCode == 39) {
                        delete state.foreground;
                    }
                    else if (ansiCode == 49) {
                        delete state.background;
                    }
                    else if (ansiparse.styles[ansiCode]) {
                        state[ansiparse.styles[ansiCode]] = true;
                    }
                    else if (ansiCode == 22) {
                        state.bold = false;
                    }
                    else if (ansiCode == 23) {
                        state.italic = false;
                    }
                    else if (ansiCode == 24) {
                        state.underline = false;
                    }
                });
                ansiState = [];
            }
            else {
                matchingData += str[i];
            }
            continue;
        }

        if (str[i] == '\033') {
            matchingControl = str[i];
        }
        else if (str[i] == '\u0008') {
            eraseChar();
        }
        else {
            matchingText += str[i];
        }
    }

    if (matchingText) {
        state.text = matchingText + (matchingControl ? matchingControl : '');
        result.push(state);
    }
    return result;
};

ansiparse.foregroundColors = {
    '30': 'black',
    '31': 'red',
    '32': 'green',
    '33': 'yellow',
    '34': 'CornflowerBlue',
    '35': 'magenta',
    '36': 'cyan',
    '37': 'white',
    '90': 'grey'
};

ansiparse.backgroundColors = {
    '40': 'black',
    '41': 'red',
    '42': 'green',
    '43': 'yellow',
    '44': 'blue',
    '45': 'magenta',
    '46': 'cyan',
    '47': 'white'
};

ansiparse.styles = {
    '1': 'bold',
    '3': 'italic',
    '4': 'underline'
};

// yolo

String.prototype.contains = function(it) { return this.indexOf(it) != -1; };
