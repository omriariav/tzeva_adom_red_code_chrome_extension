var notifications = []; //internal objects check

function GetManualAlertJSON() {
    $.getJSON('http://api.rocketalert.me/alerts/latest')
        .done(function (alerts) {
            check_for_new_alerts(alerts);
        })
        .fail(function (error) {
            set_connection_status('0');
        });
}

function GetDebugAlertJSON2(file) {
    $.getJSON(chrome.extension.getURL('debug_2.json'), function(alerts) {
        check_for_new_alerts(alerts);
    })
}
function GetDebugAlertJSON3(file) {
    $.getJSON(chrome.extension.getURL('debug_3.json'), function(alerts) {
        check_for_new_alerts(alerts);
    })
}

//the server connection socket function.
function SocketConnect() {
    $.getScript('https://cdn.socket.io/socket.io-1.0.0.js', function () {
        //var socket = io.connect('http://socket.rocketalert.me:3020');
        var socket = io.connect('http://localhost:3020');
        socket.on('connect', function () {
            console.log('Connected to socket');
            set_connection_status('2');
            socket.on('alert', function (alert) {
                check_for_new_alerts(alert);
            });
        });
        socket.io.on('connect_error', function (err) {
            console.log('connection error going manual');
            set_connection_status('1');
            GetManualAlertJSON();
        });
        socket.io.on('connect_timeout', function () {
            console.log('connection timeout going manual');
            set_connection_status('1');
            GetManualAlertJSON();
        });
        socket.io.on('reconnect_error', function () {
            console.log('reconnection error going manual');
            set_connection_status('1');
            GetManualAlertJSON();
        });
        socket.io.on('reconnect_failed', function () {
            console.log('reconnecting failed, going manual');
            set_connection_status('1');
            GetManualAlertJSON();
        });
    });
}
SocketConnect();

//the flashing browser action badge alert effect
function set_badge_alerts() {
    set_badge_alert('***',1500);
    set_badge_alert('',3000);
    set_badge_alert('***',4500);
    set_badge_alert('',6000);
}

//the flashing browser action badge alert effect
function set_badge_alert(badge_text,time_set) {
    setTimeout(function() {
        chrome.browserAction.setBadgeText({'text': badge_text})
    }, time_set);
}
//generates id for notifications/alerts from a growing counter
function get_notification_id() {
    res = notification_counter;
    notification_counter += 1;
    return res.toString();
}
function clear_alerts() {
    localStorage.setItem('alerts',JSON.stringify([]));
}

//cause i'm is default. it should be default by defenition to the entire
//human kind. if there is at least 1 notification alive in type 1 and 2
//the don't play another siren.
function play_siren(){
    var sound_item = localStorage.getItem('sound_id');
    chrome.notifications.getAll(function(notifications) {
        if (sound_item != '0') {
            if (Object.keys(notifications).length == 0) {
                siren = new Audio(chrome.extension.getURL(sound_item));
                siren.play();
            }
        }
    });
}

function set_connection_status(connection_status_id) {
    send_msg_to_popup('status', connection_status_id);
    localStorage.setItem('connection', connection_status_id);
}

//new notification to screen, the id is hashed per area, so
//need to check if this notification is a live, if it does
//don't ping again, even if its few seconds next
function create_notification(notification_object) {
    chrome.notifications.getAll(function(notifications) {
        if (!notifications.hasOwnProperty(notification_object['id'])) {
            chrome.notifications.create(
                notification_object['id'],
                {
                    type: 'basic',
                    'priority':0,
                    iconUrl: chrome.extension.getURL('icons/48x48.png'),
                    title: "צבע אדום במרחב " + notification_object['area_name']
                            + ' (' + notification_object['timestamp_24'] + ")",
                    message: "אזעקה ביישובים הבאים:" + notification_object['locations'] + ". " + '\n' + "זמן לתפוס מחסה:"
                        + notification_object['time_to_cover'] + "שניות"
                },
                function(notificationid) {
                    ttl_alerts = parseInt(localStorage.getItem('ttl_alerts'));
                    setTimeout( function() {
                        chrome.notifications.clear(notificationid,function(){})
                    },ttl_alerts)
                }
            );
        }
    });
}

//add alert object to storage
function add_alert_to_localstorage(notification_object) {
    alerts_counter = parseInt(localStorage.getItem('alerts_counter'));
    var alerts = JSON.parse(localStorage.getItem('alerts')) || [];
    if (alerts.length == alerts_counter) {
        alerts.shift();
    }
    alerts.push(notification_object);
    send_msg_to_popup('add_item', notification_object);
    localStorage.setItem('alerts', JSON.stringify(alerts));

}

//remove alert from storage by id
function remove_alert_from_localstorage(notification_id) {
    alerts = JSON.parse(localStorage.getItem('alerts'));
    $(alerts).each(function(i) {
        if (this['id'] == notification_id) {
            alerts.splice(i,1);
            send_msg_to_popup('del_item', notification_id);
            localStorage.setItem('alerts', JSON.stringify(alerts));
        }
    });
}

//send msg to the popup with type and the msg it self
//when adding notification_object is a whole object
//when deleting notification, the notification_object is the id only
//yeah, i'm lazy to set another parameter name, but i do have
//the powers to explain it. go figure...
function send_msg_to_popup(type,notification_object) {
    chrome.runtime.sendMessage({
            type: type,
            notification_object:notification_object
        },
        function(response) {
        });
}

//checks for new alerts
function check_for_new_alerts(response) {
    if (response.length > 0) {
        for (i = 0; i < response.length; i++) {
            internal_id = response[i].timestamp + response[i].area_name;
            notification_object = {
                'id':response[i].key.split("_")[1],
                'area_name': response[i].area_name,
                'locations': response[i].locations.toString().replace(/\,/g,', '),
                'timestamp': response[i].timestamp,
                'timestamp_24' : showLocalDate(response[i].timestamp),
                'time_to_cover': response[i].time_to_cover,
                'internal_id': internal_id
            };
            if ($.inArray(internal_id, notifications) == -1) { //show on screen only new notifications
                now = new Date().getTime();
                earlier_item_time = parseInt(response[i].timestamp) * 1000;
                if (now - earlier_item_time < 60 * 60 * 1000) {   //if the alert was more than 60 minutes ago don't show
                    chosen_area = JSON.parse(localStorage.getItem('area'));
                    chosen_area_splited = [];
                    $.each(chosen_area, function(i,v) {
                    	chosen_area_splited.push(v.split('_')[0]);
                    	});
                    if ($.inArray('all', chosen_area) != -1) { //All cities settings
                        notifications.push(internal_id);
                        play_siren();
                        create_notification(notification_object);
                        add_alert_to_localstorage(notification_object);
                        set_badge_alerts();
                    }
                    else if ($.inArray(notification_object['id'], chosen_area_splited) != -1) { //Selected cities settings
                        notifications.push(internal_id);
                        play_siren();
                        create_notification(notification_object);
                        add_alert_to_localstorage(notification_object);
                        set_badge_alerts();
                    }
                    else { //In any other case shoot quiet notification
                        notifications.push(internal_id);
                        if (localStorage.getItem('silent_mode') == '1') {
                            create_notification(notification_object);
                        }
                        add_alert_to_localstorage(notification_object);
                        set_badge_alerts();
                    }
                }
            }
        }
    }
}

//convert epoch to string
var mmToMonth = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"];
function showLocalDate(timestamp)
{
    var minutes;
    var seconds;
    var dt = new Date(timestamp * 1000);
    var mm = mmToMonth[dt.getMonth()];
    if (dt.getMinutes().toString().length == 1) {
        minutes = '0';
    }
    else {
        minutes = '';
    }
    if (dt.getSeconds().toString().length == 1) {
        seconds = '0';
    }
    else {
        seconds = '';
    }
    return dt.getDate() + "-" + mm + "-" + dt.getFullYear() + " " + dt.getHours() + ":" + minutes + dt.getMinutes() +
       ":" + seconds + dt.getSeconds();
}

//Initialise the bg service upon installation
chrome.runtime.onInstalled.addListener(function() {
    installed_flag = localStorage.getItem('area') || '0';
    if (installed_flag == '0') {
        localStorage.setItem('alerts',JSON.stringify([]));
        localStorage.setItem('city_name','["כל הערים"]');
        localStorage.setItem('area','["all"]');
        localStorage.setItem('sound_id','0');
        localStorage.setItem('silent_mode','1');
        localStorage.setItem('connection','0');
        localStorage.setItem('ttl_alerts','7000');
        localStorage.setItem('alerts_old','60');
        localStorage.setItem('alerts_counter','30');
        localStorage.setItem('badge_mode','1');
        localStorage.setItem('installed','1');
    }
});

//Checks the last alert every minute and see it older than 1 hour, if it is, it will delete it
setInterval(function() {
    alerts_old = parseInt(localStorage.getItem('alerts_old'));
    earlier_item = localStorage.getItem('alerts') || '';
    alerts_lenght = JSON.parse(earlier_item).length;
    if (localStorage.getItem('badge_mode') == '1') {
        chrome.browserAction.setBadgeText({'text':alerts_lenght.toString()});
    }
    else {
        chrome.browserAction.setBadgeText({'text':''});
    }
    if (earlier_item != '' ) {
        if (earlier_item != '[]') {
            earlier_item = JSON.parse(earlier_item)[0];
            now = new Date().getTime();
            earlier_item_time = parseInt(earlier_item.timestamp) * 1000;
            if (now - earlier_item_time > alerts_old * 60 * 1000) {
                remove_alert_from_localstorage(earlier_item.id);
            }
        }
    }
},1000);