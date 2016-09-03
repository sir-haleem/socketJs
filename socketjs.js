if (typeof jQuery === 'undefined') {
    throw new Error('SocketJs\'s Library requires jQuery');
    //	return ;
}


var version = $.fn.jquery.split(' ')[0].split('.')
if ((version[0] < 2 && version[1] < 9) || (version[0] == 1 && version[1] == 9 && version[2] < 1) || (version[0] > 2)) {
    throw new Error('SocketJs\'s Library requires jQuery version 1.9.1 or higher, but lower than version 3');
    //	 return ;
}



(function($, global) {

    var core_ = (function($) {

        var v = '1.0.0';
        var url = '';
        var settings = {

        }
        // var socket = null;
        var config = {
            open: function() { },
            close: function() { },
            message: function() { },
            options: {

            },
            events: {

            }
        };
        var events = [];
        return {
            version: v,
            url: url,
            settings: settings,
            socket: '',
            config: config,
            events: events,
            addEvent: function(name, callback) {
                core_.events[name] = callback;
            },
            invoke: function(name, params, sender) {
                if (core_.events.hasOwnProperty(name))
                    core_.events[name](params, sender);
            },
            log: function(data) {
                console.log(data);
            },
            quit: function() {
                if (core_.socket !== null) {
                    core_.socket.close();
                    core_.socket = null;
                }
            },
            reconnect: function() {
                core_.quit();
                core_.listen();
            },

            eventWrap: function(name, data, broadcast) {

                var response = {
                    'cmd': name,
                    'data': data,
                    'sender': core_.socket.user,
                    'broadcast': broadcast
                };

                response = JSON.stringify(response);

                return response;
            },

            emitEvent: function(name, data) {

                if (core_.socket === null) {
                    core_.log("Kindly listen to the socket before emitting/broadcasting any event");
                    return;
                }

                var message = core_.eventWrap(name, data, false);
                try {
                    core_.socket.send(message);
                } catch (ex) {
                    core_.log(ex);
                }
            },

            broadcastEvent: function(name, data) {

                if (core_.socket === null) {
                    core_.log("Kindly listen to the socket before emitting/broadcasting any event");
                    return;
                }

                var message = core_.eventWrap(name, data, true);
                try {
                    core_.socket.send(message);
                } catch (ex) {
                    core_.log(ex);
                }
            },



        }
    })($)


    websocket = function(socketurl, settings) {

        return new websocket.fn.init(socketurl, settings);
    }


    websocket.fn = websocket.prototype = {
        version: core_.version,

        constructor: websocket,

        settings: null,

        url: '',

        init: function(socketurl, settings) {
            if (settings)
                this.settings = $.extend(core_.config, settings);

            this.url = core_.url = socketurl;

            this.settings = core_.settings = settings;

            this.socket = null;

            this.addEvent = core_.addEvent;

            this.events = core_.events;

            this.invoke = core_.invoke;

            this.emitEvent = core_.emitEvent;

            this.broadcastEvent = core_.broadcastEvent;

        },

        log: core_.log,

        quit: core_.quit,

        reconnect: core_.reconnect,

        listen: function() {
            try {
                this.socket = new WebSocket(this.url);
                
                this.socket.log = core_.log;
                this.socket.trigger = core_.invoke;

                this.socket.onopen = function(msg) {
                    this.trigger('open', msg);
                }

                this.socket.onmessage = function(msg) {

                    var obj = $.parseJSON(msg.data);

                    switch (obj.cmd) {
                        case "connect":
                            this.user = obj.data;
                            break;
                        case "disconnect":
                            this.user = null;
                            break;
                        case "close":
                            this.user = null;
                            break;
                    };
                    
                    this.trigger(obj.cmd, obj.data, obj.sender);
                }

                this.socket.onclose = function(msg) {
                    this.trigger('open', msg);
                }

                this.socket.onerror = function(error) {
                    console.log(error);
                }

                core_.socket = this.socket;

            } catch (ex) {
                core_.log(ex);
            }
        }


    }

    websocket.fn.init.prototype = websocket.fn;

    // Expose jQuery to the global object
    global.websocket = global.ws = websocket;

    if (typeof define === "function" && define.amd && define.amd.websocket) {
        define("socket", [], function() { return websocket; });
    }
})(jQuery, window)

socket = ws("ws://127.0.0.1:2000");
socket.addEvent('connect', function(data) { console.log(arguments);});
socket.listen();


console.log(socket);