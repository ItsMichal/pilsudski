var logBuilder = function(prefix, minLevel) {

    // Set levels available
    var levels = [
        ["trace", "0;90m"],
        ["debug", ""],
        ["log", "0;36m"],
        ["info", "0;36m"],
        ["success", "0;32m"],
        ["warn", "0;33m"],
        ["important", "0;35m"],
        ["error", "0;31m"]
    ];

    // Defaults
    prefix = prefix || '';
    minLevel = minLevel ||  0;

    // Build logginf aliases
    var loggers = {};
    for (var i = 0; i < levels.length; i++) {
        var opts = levels[i];
        var key = opts[0];
        var color = opts[1];

        if (i < minLevel) {
            loggers[key] = function() {};
        } else {
            loggers[key] = (function(color) {
                var timestamp = function() {};
                timestamp.toString = function() {
                    return "\033[" + color + "[" + (new Date).toLocaleTimeString() + "]" + "\033[0m " + prefix;
                };
                return console.log.bind(console, '%s', timestamp);
            })(color);
        }
    }

    // Return loggers
    return loggers;

};

module.exports = {

    // Builder
    builder: logBuilder,

    // Set logging : normal
    log: (function() {
        var timestamp = function() {};
        timestamp.toString = function() {
            return "\033[0;36m" + "[" + (new Date).toLocaleTimeString() + "]" + "\033[0m";
        };
        return console.log.bind(console, '%s', timestamp);
    })(),

    // Set logging : info
    info: (function() {
        var timestamp = function() {};
        timestamp.toString = function() {
            return "\033[0;36m" + "[" + (new Date).toLocaleTimeString() + "]" + "\033[0m";
        };
        return console.log.bind(console, '%s', timestamp);
    })(),

    // Set logging : error
    error: (function() {
        var timestamp = function() {};
        timestamp.toString = function() {
            return "\033[0;31m" + "[" + (new Date).toLocaleTimeString() + "]" + "\033[0m";
        };
        return console.log.bind(console, '%s', timestamp);
    })(),

    // Set logging : debug
    debug: (function() {
        if (typeof config !== 'undefined' && config.log_level > 0) return function() {};
        var timestamp = function() {};
        timestamp.toString = function() {
            return "[" + (new Date).toLocaleTimeString() + "]";
        };
        return console.log.bind(console, '%s', timestamp);
    })(),

    // Set logging : trace
    trace: (function() {
        var timestamp = function() {};
        timestamp.toString = function() {
            return "\033[0;90m" + "[" + (new Date).toLocaleTimeString() + "]" + "\033[0m";
        };
        return console.log.bind(console, '%s', timestamp);
    })(),

    // Set logging : success
    success: (function() {
        var timestamp = function() {};
        timestamp.toString = function() {
            return "\033[0;32m" + "[" + (new Date).toLocaleTimeString() + "]" + "\033[0m";
        };
        return console.log.bind(console, '%s', timestamp);
    })(),

    // Set logging : warning
    warn: (function() {
        var timestamp = function() {};
        timestamp.toString = function() {
            return "\033[0;33m" + "[" + (new Date).toLocaleTimeString() + "]" + "\033[0m";
        };
        return console.log.bind(console, '%s', timestamp);
    })(),

    // Set logging : important
    important: (function() {
        var timestamp = function() {};
        timestamp.toString = function() {
            return "\033[0;35m" + "[" + (new Date).toLocaleTimeString() + "]" + "\033[0m";
        };
        return console.log.bind(console, '%s', timestamp);
    })()

};
