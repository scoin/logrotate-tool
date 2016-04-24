var logCount = 0;

var autodata = {
    pushtos3 : {
        global: {
            //global directives go in here
            nocompress: true,
            missingok: true,
            copytruncate: true,
            notifempty: true,
            nomail: true,
            noolddir: true,
            daily: true,
            rotate: 5,
            dateext: true,
            dateformat: "-%Y-%m-%d-%s",
        },
        "/home/bobby/logs/system.log": {
            postrotate: "s3cmd -m text/plain sync /home/bobby/logs/system.log-* s3://{{BUCKET}}{{/PATH}}"
        }
    },
    apachedefault : {
        global: {

        },
        "/var/log/apache2/*.log":{
            weekly: true,
            missingok: true,
            rotate: 52,
            compress: true,
            delaycompress: true,
            notifempty: true,
            create: true,
            sharedscripts: true,
            postrotate: "/etc/init.d/apache2 reload > /dev/null",
            prerotate: 
            "if [ -d /etc/logrotate.d/httpd-prerotate ]; then\n run-parts /etc/logrotate.d/httpd-prerotate;\nfi;"
        }
    }
} 

$(document).ready(function(){
    loadLogfileTemplate()

    initButtonsByParent("#globaldirectives-body");

    $("#globaldirectives-body").toggle('visible');

    $("#logfiles-body0").toggle('visible');

    $("#globaldirectives-header").click(function(){
        $("#globaldirectives-body").toggle('visible')
    })

    $("#add-logfile").click(function(){
        loadLogfileTemplate()
    })

    $("#save-file").click(function(){
        var a = document.createElement("a");
        document.body.appendChild(a);
        a.style = "display: none";
        var blob = new Blob([buttonsToFile()], {type: "octet/stream"}),
            url = window.URL.createObjectURL(blob);
        a.href = url;
        a.download = "output.conf";
        a.click();
        window.URL.revokeObjectURL(url);
    })
    $(".autosetting").click(function(){
        clearButtons()
        var id = $(this).attr('data-id');
        configureButtons(autodata[id]);
        buttonsToOutput()
    })
    $("#clear").click(function(){
        clearButtons()
        buttonsToOutput()
    })
    $(window).on("keypress", function(event){
        //this corrects state of button with input when space is pressed
        //normal browser behavior is to toggle active state of button when its in focus
        //since inputs are children of buttons this is annoying
        //maybe should change where inputs live
        if(event.keyCode === 32){
            if($(event.target).hasClass('btn-arg')){
                $($(event.target).parent()).toggleClass('active');
            }
        }
    })
    buttonsToOutput()
});

var getLogfileTemplate = function(index){
    var parent = $("#logfile-container").children()[index];
    var header = $(parent).children(".directives-header")[0];
    var body = $(parent).children("#logfiles-body" + index)[0];
    var nameInput = $(body).find("#filepath-input")[0];
    var closeButton = $(header).children(".close")[0];
    return {
        parent: parent,
        header : header,
        body: body,
        nameInput: nameInput,
        closeButton: closeButton
    }
}

var loadLogfileTemplate = function(name){
    var defaultPath = "/path/to/file.log";
    if(!name){
        name = defaultPath;
    }
    var template = $("#logfile-template").html();
    $("#logfile-container").append(Mustache.render(template, {index: logCount}));
    
    var logfile = getLogfileTemplate(logCount);

    setFileName(name, logfile.header, logfile.body);

    $(logfile.header).click(function(){
        $(logfile.body).toggle('visible')
    })

    $(logfile.closeButton).click(function(){
        if(logCount === 1){
            return;
        }
        var deletedIndex = $(logfile.body).attr('data-index');

        $.each($("#logfile-container").children(), function(i, file){
            if(i > deletedIndex){
                var body = $(file).find(".directives-body")[0];
                $(body).attr("data-index", i - 1);
                $(body).attr("id", "logfiles-body" + (i-1))
            }
        })

        $(logfile.parent).remove()
        logCount -= 1;
        buttonsToOutput()
    })

    $(logfile.nameInput).on("input", function(e){
        var fileVal = $(logfile.nameInput)[0].value;
        setFileName(fileVal || defaultPath, logfile.header, logfile.body)
        buttonsToOutput()
    })
    initButtonsByParent(logfile.body);
    logCount += 1;

    return logfile;
}

var setFileName = function(name, header, body){
    var pathDisplay = $(header).children(".path")[0];
    $(pathDisplay).html(name)
    $(body).attr("data-path", name)
}

var initButtonsByParent = function(parent){
    var buttons = $(parent).find(".option-setting");
    $.each(buttons, function(i, btn){
        $(btn).on('click', function(e){
            toggleDependencies(this);
            $(this).toggleClass("active").siblings().removeClass("active");
            buttonsToOutput()
        });
        if($(btn).children(".btn-arg")[0]){
            var input = $(btn).children(".btn-arg")[0];

            $(input).on("click", function(e){
                if($(btn).hasClass('active')){
                    e.stopPropagation()
                }
            })

            $(input).on("input", function(e){
                if($(input)[0].value.length === 0){
                    $(btn).addClass('btn-danger')
                } else {
                    $(btn).removeClass('btn-danger')
                }
                buttonsToOutput();
            })
        }
    })
}

var buttonsToOutput = function(){
    $("#output").html(buttonsToFile())
}

var buttonsToFile = function(){
    var data = {
        global: {},
        logfiles: []
    }

    for(var i = 0; i < logCount; i++){
        var logfile = getLogfileTemplate(i)
        data.logfiles.push({
            "path": $(logfile.body).attr('data-path')
        })
    }

    var buttons = getAllButtons();

    $.each(buttons, function(i, button){
        var parent = getButtonParent(button);
        if($(button).hasClass('active')){
            var command = $(button).attr('data-command');
            var val = true;
            if($(button).attr('data-argument')){
                var argument = $(button).attr('data-argument');
                val = $(parent).find(argument)[0].value;
            }
            var directives = $(parent).attr("data-type");
            if(directives === "logfiles"){
                var logIndex = $(parent).attr("data-index");
                data[directives][logIndex][command] = val;
            } else {
                data[directives][command] = val;
            }
        }
    })
    return generate(data);
}

var toggleDependencies = function(button){
    if($(button).hasClass('active')){
        toggleDependencyState(button, 'off');
    } else {
        toggleDependencyState(button, 'on')
    }
}

var toggleDependencyState = function(button, state){
    var deps = $(button).attr('data-depends-' + state);
    if(!deps){
        return;
    }
    var parent = getButtonParent(button);

    deps = deps.split(",");

    for(var i in deps){
        var commands = {};
        var dep = deps[i];
        var orClause = dep.split("|");
        for(var j in orClause){
            var sp = orClause[j].split(':');
            commands[sp[0]] = sp[1];
        }

        var matchingState = Object.keys(commands).reduce(function(acc, val, i){
            var button = $(parent).find(val)[0];
            if(commands[val] === 'on'){
                if($(button).hasClass('active')){
                    acc = true;
                }
            } else {
                if(!$(button).hasClass('active')){
                    acc = true;
                }
            }
            return acc;
        }, false)

        var command = Object.keys(commands)[0];
        var state = commands[command];

        if(!matchingState){
            var button = $(parent).find(command)[0];
            if(state === "on"){
                $(button).addClass("active").siblings().removeClass("active");
            } else {
                $(button).removeClass("active");
            }
        }
    }
}


var getAllButtons = function(){
    return $("#content").find(".option-setting");
}

var getButtonParent = function(button){
    return $(button).parents(".directives-body")[0];
}

var configureButtons = function(buttonObject){
    emptyLogfileContainer()

    for(var filepath in buttonObject){
        var setting = buttonObject[filepath];
        var parent;

        if(filepath === "global"){
            parent = $(".global-body")[0];
        } else {
            var logfile = loadLogfileTemplate(filepath);
            parent = logfile.parent;
            $(logfile.nameInput).val(filepath);
        }
        var buttons = $(parent).find(".option-setting");
        for(var command in setting){
            var button = $(parent).find("#" + command);
            $(button).addClass("active").siblings().removeClass("active");
            if($(button).attr('data-argument')){
                writeToButtonArgument(button, setting[command])
            }
        }
    }
}

var writeToButtonArgument = function(button, value){
    var parent = getButtonParent(button);
    var input = $(parent).find($(button).attr('data-argument'))[0];
    $(input).val(value);
}

var emptyLogfileContainer = function(){
    $("#logfile-container").html("");
    logCount = 0;
}

var clearButtons = function(){
    emptyLogfileContainer()
    loadLogfileTemplate()

    var buttons = getAllButtons();
    $.each(buttons, function(i, button){
        $(button).removeClass('active');
    })
}