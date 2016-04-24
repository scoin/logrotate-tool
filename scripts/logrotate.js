(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
generate = require("./lib/parser.js");
},{"./lib/parser.js":4}],2:[function(require,module,exports){
var defaultParser = function(command, arg){
    if(arg === false){
        if(("no" + command) in commands){
            return "no" + command;
        } else if(command.substr(0,2) === "no" && command.substr(2) in commands) {
            return command.substr(2);
        }
    } else if(arg === true) {
        return command;
    } else {
        return command + " " + arg;
    }
}

var ifEmptyParser = function(command, arg){
    if(arg === false){
        if(("not" + command) in commands){
            return "not" + command;
        } else if(command.substr(0,3) === "not" && command.substr(3) in commands) {
            return command.substr(3);
        }
    } else if(arg === true) {
        return command;
    }
}

var bashParser = function(command, arg){
    var string = command + "\n";
    var args = arg.split("\n");
    for(var i in args){
        string += "\t\t" + args[i] + "\n";
    }
    string += "\tendscript"
    return string;
}

var commands = {
    compress:{
    // Old versions of log files are compressed with gzip(1) by default. See also nocompress.
        _parser: defaultParser
    },      
    compresscmd:{
    // Specifies which command to use to compress log files. The default is gzip(1) . See also compress.
        _parser: defaultParser
    },      

    uncompresscmd:{
    // Specifies which command to use to uncompress log files. The default is gunzip(1) .
        _parser: defaultParser
    },
     
    compressext:{
    // Specifies which extension to use on compressed logfiles, if compression is enabled. The default follows that of the default compression command (.gz).
        _parser: defaultParser
    },
     
    compressoptions:{
    // Command line options may be passed to the compression program, if one is in use. The default, for gzip, is "-9" (maximum compression).
        _parser: defaultParser,
    },
     
    copy:{
    // Make a copy of the log file, but don’t change the original at all. This option can be used, for instance, to make a snapshot of the current log file, or when some other utility needs to truncate or parse the file. When this option is used, the create option will have no effect, as the old log file stays in place.
        _parser: defaultParser
    },
     
    copytruncate:{
    // Truncate the original log file to zero size in place after creating a copy, instead of moving the old log file and optionally creating a new one. It can be used when some program cannot be told to close its logfile and thus might continue writing (appending) to the previous log file forever. Note that there is a very small time slice between copying the file and truncating it, so some logging data might be lost. When this option is used, the create option will have no effect, as the old log file stays in place.
        _parser: defaultParser
    },
     
    create:{
    // Immediately after rotation (before the postrotate script is run) the log file is created (with the same name as the log file just rotated). mode specifies the mode for the log file in octal (the same as chmod(2) ), owner specifies the user name who will own the log file, and group specifies the group the log file will belong to. Any of the log file attributes may be omitted, in which case those attributes for the new file will use the same values as the original log file for the omitted attributes. This option can be disabled using the nocreate option.
        _parser: defaultParser
    },
     
    daily:{
    // Log files are rotated every day.
        _parser: defaultParser
    },
     
    dateext:{
    // Archive old versions of log files adding a daily extension like YYYYMMDD instead of simply adding a number.
        _parser: defaultParser
    },
     
    dateformat:{
    // Specify the extension for dateext using the notation similar to strftime(3) function. Only %Y %m and %d specifiers are allowed. The default value is -%Y%m%d. Note that also the character separating log name from the extension is part of the dateformat string.
        _parser: defaultParser
    },
     
    delaycompress:{
    // Postpone compression of the previous log file to the next rotation cycle. This only has effect when used in combination with compress. It can be used when some program cannot be told to close its logfile and thus might continue writing to the previous log file for some time.
        _parser: defaultParser
    },
     
    extension:{
    // Log files with ext extension can keep it after the rotation. If compression is used, the compression extension (normally .gz) appears after ext. For example you have a logfile named mylog.foo and want to rotate it to mylog.1.foo.gz instead of mylog.foo.1.gz.
        _parser: defaultParser
    },
     
    ifempty:{
    // Rotate the log file even if it is empty, overriding the notifempty option (ifempty is the default).
        _parser: ifEmptyParser
    },
     
    include:{
    // Reads the file given as an argument as if it was included inline where the include directive appears. If a directory is given, most of the files in that directory are read in alphabetic order before processing of the including file continues. The only files which are ignored are files which are not regular files (such as directories and named pipes) and files whose names end with one of the taboo extensions, as specified by the tabooext directive. The include directive may not appear inside a log file definition.
        _parser: defaultParser
    },
     
    mail:{
    // When a log is rotated out of existence, it is mailed to address. If no mail should be generated by a particular log, the nomail directive may be used.
        _parser: defaultParser
    },
     
    mailfirst:{
    // When using the mail command, mail the just-rotated file, instead of the about-to-expire file.
        _parser: defaultParser
    },
     
    maillast:{
    // When using the mail command, mail the about-to-expire file, instead of the just-rotated file (this is the default).
        _parser: defaultParser
    },
     
    maxage:{
    // Remove rotated logs older than <count> days. The age is only checked if the logfile is to be rotated. The files are mailed to the configured address if maillast and mail are configured.
        _parser: defaultParser
    },
     
    minsize:{
    // Log files are rotated when they grow bigger than size bytes, but not before the additionally specified time interval (daily, weekly, monthly, or yearly). The related size option is similar except that it is mutually exclusive with the time interval options, and it causes log files to be rotated without regard for the last rotation time. When minsize is used, both the size and timestamp of a log file are considered.
        _parser: defaultParser
    },
     
    missingok:{
    // If the log file is missing, go on to the next one without issuing an error message. See also nomissingok.
        _parser: defaultParser
    },
     
    monthly:{
    // Log files are rotated the first time logrotate is run in a month (this is normally on the first day of the month).
        _parser: defaultParser
    },
     
    nocompress:{
    // Old versions of log files are not compressed. See also compress.
        _parser: defaultParser
    },
     
    nocopy:{
    // Do not copy the original log file and leave it in place. (this overrides the copy option).
        _parser: defaultParser
    },
     
    nocopytruncate:{
    // Do not truncate the original log file in place after creating a copy (this overrides the copytruncate option).
        _parser: defaultParser
    },
     
    nocreate:{
    // New log files are not created (this overrides the create option).
        _parser: defaultParser
    },
     
    nodelaycompress:{
    // Do not postpone compression of the previous log file to the next rotation cycle (this overrides the delaycompress option).
        _parser: defaultParser
    },
     
    nodateext:{
    // Do not archive old versions of log files with date extension (this overrides the dateext option).
        _parser: defaultParser
    },
     
    nomail:{
    // Do not mail old log files to any address.
        _parser: defaultParser
    },
     
    nomissingok:{
    // If a log file does not exist, issue an error. This is the default.
        _parser: defaultParser
    },
     
    noolddir:{
    // Logs are rotated in the directory they normally reside in (this overrides the olddir option).
        _parser: defaultParser
    },
     
    nosharedscripts:{
    // Run prerotate and postrotate scripts for every log file which is rotated (this is the default, and overrides the sharedscripts option). If the scripts exit with error, the remaining actions will not be executed for the affected log only.
        _parser: defaultParser
    },
     
    noshred:{
    // Do not use shred when deleting old log files. See also shred.
        _parser: defaultParser
    },
     
    notifempty:{
    // Do not rotate the log if it is empty (this overrides the ifempty option).
        _parser: ifEmptyParser
    },
     
    olddir:{
    // Logs are moved into directory for rotation. The directory must be on the same physical device as the log file being rotated, and is assumed to be relative to the directory holding the log file unless an absolute path name is specified. When this option is used all old versions of the log end up in directory. This option may be overridden by the noolddir option.
        _parser: defaultParser
    },
     
    postrotate:{
    // The lines between postrotate and endscript (both of which must appear on lines by themselves) are executed after the log file is rotated. These directives may only appear inside a log file definition. See also prerotate. See sharedscripts and nosharedscripts for error handling.
        _parser: bashParser
    },
     
    prerotate:{
    // The lines between prerotate and endscript (both of which must appear on lines by themselves) are executed before the log file is rotated and only if the log will actually be rotated. These directives may only appear inside a log file definition. See also postrotate. See sharedscripts and nosharedscripts for error handling.
        _parser: bashParser
    },
     
    firstaction:{
    // The lines between firstaction and endscript (both of which must appear on lines by themselves) areexecuted once before all log files that match the wildcarded pattern are rotated, before prerotate script is run and only if at least one log will actually be rotated. These directives mayonly appear inside of a log file definition. If the script exits with error, no further processing is done. See lastaction as well.
        _parser: bashParser
    },
     
    lastaction:{
    // The lines between lastaction and endscript (both of which must appear on lines by themselves) are executedonce after all log files that match the wildcarded pattern are rotated, after postrotate script is run and only if at least one log is rotated. These directives may only appear inside a log file definition. If the script exits with error, just an error message is shown (as this is the last action). See also firstaction.
        _parser: bashParser
    },
     
    rotate:{
    // Log files are rotated count times before being removed or mailed to the address specified in a mail directive. If count is 0, old versions are removed rather than rotated.
        _parser: defaultParser

    },
     
    size: {
    // Log files are rotated when they grow bigger than size bytes. If size is followed by M, the size if assumed to be in megabytes. If the G suffix is used, the size is in gigabytes. If the k is used, the size is in kilobytes. So size 100, size 100k, and size 100M are all valid.
        _parser: defaultParser

    },
     
    sharedscripts:{
    // Normally, prerotate and postrotate scripts are run for each log which is rotated, meaning that a single script may be run multiple times for log file entries which match multiple files (such as the /var/log/news/* example). If sharedscript is specified, the scripts are only run once, no matter how many logs match the wildcarded pattern. However, if none of the logs in the pattern require rotating, the scripts will not be run at all. If the scripts exit with error, the remaining actions will not be executed for any logs. This option overrides the nosharedscripts option and implies create option.
        _parser: defaultParser

    },
     
    shred:{
    // Delete log files using shred -u instead of unlink(). This should ensure that logs are not readable after their scheduled deletion; this is off by default. See also noshred.
        _parser: defaultParser

    },
     
    shredcycles:{
    // Asks GNU shred to overwite log files count times before deletion. Without this option, shred’s default will be used.
        _parser: defaultParser

    },
     
    start:{
    // This is the number to use as the base for rotation. For example, if you specify 0, the logs will be created with a .0 extension as they are rotated from the original log files. If you specify 9, log files will be created with a .9, skipping 0-8. Files willstill be rotated the number of times specified with the rotate directive.
        _parser: defaultParser

    },
     
    tabooext:{
    // The current taboo extension list is changed (see the include directive for information on the taboo extensions). If a + precedes the list of extensions, the current taboo extension list is augmented, otherwise it is replaced. At startup, the taboo extension list contains .rpmorig, .rpmsave, ,v, .swp, .rpmnew, ~, .cfsaved, .rhn-cfg-tmp-*, .dpkg-dist, .dpkg-old, .dpkg-new, .disabled.
        _parser: defaultParser

    },
     
    weekly:{
    // Log files are rotated if the current weekday is less than the weekday of the last rotation or if more than a week has passed since the last rotation. This is normally the same as rotating logs on the first day of the week, but if logrotate is not being run every night a log rotation will happen at the first valid opportunity.
        _parser: defaultParser

    },
     
    yearly:{
    // Log files are rotated if the current year is not the same as the last rotation.
        _parser: defaultParser

    },
}

module.exports = commands;
},{}],3:[function(require,module,exports){
module.exports = [
//missing
"missingok", 
"nomissingok", 
//rotate
"rotate", 
//timeframe
"daily", 
"weekly", 
"monthly", 
"yearly",
"maxage", 
//size
"minsize", 
"size", 
//compression
"compress", 
"nocompress", 
"compresscmd", 
"uncompresscmd", 
"compressext", 
"compressoptions", 
"delaycompress", 
"nodelaycompress", 
//ifempty
"ifempty", 
"notifempty", 
//mail
"mail",
"nomail", 
"mailfirst", 
"maillast", 
//extension
"start", 
"extension",
//date
"dateext", 
"nodateext", 
"dateformat",
//include
"include", 
"tabooext",
 //directory
"olddir", 
"noolddir",
//copy
"copy", 
"nocopy", 
"copytruncate", 
"nocopytruncate", 
//create
"create",
"nocreate",
//shred 
"noshred", 
"shred", 
"shredcycles",
//sharedscripts
"sharedscripts", 
"nosharedscripts", 
//script triggers
"firstaction", 
"prerotate", 
"postrotate", 
"lastaction",
]
},{}],4:[function(require,module,exports){
var commands = require("./args.js");
var commandOrder = require("./order.js");

module.exports = function(config, opts){
    if(!opts){
        opts = {};
    }
    var confString = "";
    confString += parse(config.global);
    confString += eachLog(config.logfiles);
    return confString;
}

var parse = function(obj, prefix){
    if(!prefix){
        prefix = "";
    }
    var confString = "";
    for(var i in commandOrder){
        var command = commandOrder[i];
        if(obj.hasOwnProperty(command)){
            confString += prefix + commands[command]._parser(command, obj[command]);
            confString += '\n';
        }
    }
    return confString;
}

var eachLog = function(logArray){
    var string = "";
    for(var i in logArray){
        string += "\n"
        string += logArray[i].path + " { \n";
        string += parse(logArray[i], "\t");
        string += "}\n"
    }
    return string;
}



},{"./args.js":2,"./order.js":3}]},{},[1]);
