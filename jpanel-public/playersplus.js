var currentPlayer = {};

$(document).ready(function () {
    var req_all = {"action": "list", "type": "all_players"};
    var req_online = {"action": "list", "type": "online_players"};
    $('ul.tabs').tabs();
    $.ajax({
        url: "/players",
        type: 'POST',
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        data: JSON.stringify(req_all),
        success: function (result) {
            var res = result.result;
            //var playersList = result.result;
            var players = $("#all_pl");
            for (var i = 0; i < res.length; i++) {
                var player = {"player": res[i]};
                players.append(tmpl("item_tmpl", player));
            }

        }
    });

    $.ajax({
        url: "/players",
        type: 'POST',
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        data: JSON.stringify(req_online),
        success: function (result) {
            var res = result.result;
            //var playersList = result.result;
            var players = $("#online_pl");
            for (var i = 0; i < res.length; i++) {
                var player = {"player": res[i]};
                players.append(tmpl("item_tmpl", player));
            }

        }
    });
});

function openPlayer(uuid) {
    var req_player = {"action": "info", "target": uuid};
    $.ajax({
        url: "/players",
        type: 'POST',
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        data: JSON.stringify(req_player),
        success: function (result) {
            var res = result.result;
            var infobox = $("#player_info");
            var player = {"player": res};
            currentPlayer = res;
            infobox.html(tmpl("player_info_tmpl", player));
            $('ul.tabs').tabs();
        }
    });

}
function addGroup() {
    var req_group = {"action": "addgroup",
                     "target": currentPlayer.playerUuid,
                     "world": currentPlayer.extras.world,
                     "value": document.forms["groupForm"]["group"].value};

    $.ajax({
        url: "/players",
        type: 'POST',
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        data: JSON.stringify(req_group),
        success: function (result) {
            var res = result.result;
            if (res.success) {
                openPlayer(currentPlayer.playerUuid);
                alert("Group added!");
            } else {
                openPlayer(currentPlayer.playerUuid);
                alert(res.reason);
            }
        }
    });

    return false;
}

function removeGroup(group) {
    var req_group = {"action": "rmgroup",
        "target": currentPlayer.playerUuid,
        "world": currentPlayer.extras.world,
        "value": group};

    $.ajax({
        url: "/players",
        type: 'POST',
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        data: JSON.stringify(req_group),
        success: function (result) {
            var res = result.result;
            if (res.success) {
                openPlayer(currentPlayer.playerUuid);
                alert("Group removed!");
            } else {
                openPlayer(currentPlayer.playerUuid);
                alert(res.reason);
            }
        }
    });

    return false;
}

// Simple JavaScript Templating
// John Resig - http://ejohn.org/ - MIT Licensed
(function () {
    var cache = {};

    this.tmpl = function tmpl(str, data) {

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
                    str.replace(/[\r\t\n]/g, " ")
                        .split("<%").join("\t")
                        .replace(/((^|%>)[^\t]*)'/g, "$1\r")
                        .replace(/\t=(.*?)%>/g, "',$1,'")
                        .split("\t").join("');")
                        .split("%>").join("p.push('")
                        .split("\r").join("\\'")
                    + "');}return p.join('');");

        // Provide some basic currying to the user
        return data ? fn(data) : fn;
    };
})();
