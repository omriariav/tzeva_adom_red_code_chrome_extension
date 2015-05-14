/**
 * Created by Omri Ariav on 7/11/14.
 * Alon Carmel Was here as well. He is a great man.
 */

//add alert text to main div/ui with flashing effect (see css in popup.html)
//we also give the li an unique id
function add_alert_text(text_to_add, id_alert) {
    $('#list_alerts').prepend(
        $('<li>').attr('id','alert_' + id_alert).attr('class','list-group-item highlight').append(
            text_to_add
        ));
}
//add alert text to main div/ui WITHOUT flashing effect
//we also give the li an unique id
function add_alert_text_old(text_to_add, id_alert) {
    $('#list_alerts').prepend(
        $('<li>').attr('id','alert_' + id_alert).attr('class','list-group-item').append(
            text_to_add
        ));
}

//add alert with it "age" to understand if we are flashing here or not
function add_alert(notification_object) {
    msg_to_show = '<span id="alert_area">'+ notification_object.area_name + ":</span> " +
        notification_object.locations + '. <br><span id="date_span"> (' +
        notification_object.timestamp_24 + ')</span>';
    now = new Date().getTime();
    alert_time = parseInt(notification_object.timestamp) * 1000;
    if (now - alert_time > 7 * 60 * 1000) {
        add_alert_text_old(msg_to_show, notification_object.id);
    }
    else {
        add_alert_text(msg_to_show, notification_object.id);
    }
}

//remove li by it id
function remove_alert(id_alert) {
    $('#alert_'+id_alert).remove();
}

function set_connection_status(connection_status_id) {
    if (connection_status_id == '2') {
        $('#real_status').text('מחובר לשרת').css('color','green');
    }
    else if (connection_status_id == '1') {
        $('#real_status').text('מחובר לשרת משני').css('color','#FFD700');
    }
    else if (connection_status_id == '0') {
        $('#real_status').text('לא מחובר (לוודא חיבור ולהתחיל מחדש)').css('color','red');
    }
}

var happy_sentences = [
    'אין התרעות חדשות. הכל לטובה',
    'הכל רגוע... זמן טוב להתקשר לאבא ואמא ולדרוש בשלומם:)',
    'שקט, וטוב שכך. אין התרעות חדשות',
    'שקט כרגע... אין חדש... ',
    'תחזקנה ידינו, עם ישראל חי, כל הכבוד לצה״ל, שקט עכשיו',
    'אין התרעות חדשות, זמן טוב למצוא אהבה',
    'אין התרעות חדשות, וטוב שכך',
    'אין התרעות חדשות, אפשר לשנות הגדרות בלשונית ההגדרות...',
    'שקט כרגע!',
    'Nothing new<br><img src="resources/images/1.png">',
    'שקט כרגע. דש מכיפת ברזל לחמאס<br><img src="resources/images/2.png">',
    'אין התרעות חדשות. כוחנו באחדותנו<br><img src="resources/images/3.png">'
];

$(document).ready( function() {
    //random funny sentence:
    var randomItem = happy_sentences[Math.floor(Math.random()*happy_sentences.length)];
    $('#nothing').html(randomItem);
    //Loads the popup with the current localstorage values:
    alerts = JSON.parse(localStorage.getItem('alerts')) || [];
    alerts_displayed_counter = alerts.length;
    if (alerts.length > 0) {
        $('#nothing').css('display', 'none');
        for (i = 0; i < alerts.length; i++) {
            add_alert(alerts[i]);
        }
    }
    else {
        $('#nothing').css('display','block');
    }

    connection_status = localStorage.getItem('connection') || '0';
    set_connection_status(connection_status);

    //Get add/del msgs from background.js and handles them
//    var displayed_counter = 0;
    chrome.runtime.onMessage.addListener(
        function(request, sender, sendResponse) {
            if (request.type == "add_item") {
                add_alert(request.notification_object);
                alerts_displayed_counter++;
            }
            else if (request.type == 'del_item' ) {
                remove_alert(request.notification_object);
                alerts_displayed_counter--;
            }
            else if (request.type == "status") {
                if (request.notification_object == '2') {
                    set_connection_status('2');
                }
                else if (request.notification_object == '1') {
                    set_connection_status('1');
                }
                else if (request.notification_object == '0') {
                    set_connection_status('0');
                }
            }
            if (alerts_displayed_counter > 0) {
                $('#nothing').css('display','none');
            }
            else {
                $('#nothing').css('display','block');
            }
            sendResponse({
            });
        });

    //created the cities combo box from json, sets all as selected value
    $.getJSON('resources/jsons/areas_fixed.json', function(json) {
        var $select = $('<select multiple>').attr('id','city').css('height','300px').addClass('chosen-rtl').attr(
            'data-placeholder','בחירת ערים');
        $select.appendTo('#select_area');
        $('<option>', {text: 'כל הערים', value:'all'}).appendTo($select);
        $.each(json, function(areas, cities){
            var $optgroup = $("<optgroup>", {label: areas});
            $optgroup.appendTo($select);
            $.each(cities.locations, function(city_id, city_name) {
                var $city = $("<option>", {text:city_name, value:CryptoJS.MD5(areas).toString() +
                    "_" + CryptoJS.MD5(city_name).toString()});
                $city.appendTo($optgroup);
            });
        });
        $select.change(function() {
            var selectedArea = $(this).val();
            if (selectedArea == null) {
                localStorage.setItem('area','["all"]');
            }
            else {
                localStorage.setItem('area', JSON.stringify(selectedArea));
            }
        });
        var selectedCity = JSON.parse(localStorage.getItem('area')).sort();
        $.each(selectedCity, function(index, item) {
            $("#city option[value="+item+"]").attr('selected', true);
        });
        $('#city').chosen(
            {
                width:"300px",
                inherit_select_classes:true,
                disable_search_threshold: 5,
                no_results_text:'לא נמצאו ערים עם שם זה'
            }
        );

    });

    current_silent_mode = localStorage.getItem('silent_mode') || '1';
    if (current_silent_mode == '1') {
        $('#silent_mode').val($(this).is(':checked'));
    }
    else {
        $('#silent_mode').attr('checked', false);
    }
    $('#silent_mode').change(function() {
        if($(this).is(":checked")) {
            localStorage.setItem('silent_mode','1');
        }
        else {
            localStorage.setItem('silent_mode', '0');
        }
    });

    current_badge_mode = localStorage.getItem('badge_mode') || '1';
    if (current_badge_mode == '1') {
        $('#badge_mode').val($(this).is(':checked'));
    }
    else {
        $('#badge_mode').attr('checked', false);
    }
    $('#badge_mode').change(function() {
        if($(this).is(":checked")) {
            localStorage.setItem('badge_mode','1');
        }
        else {
            localStorage.setItem('badge_mode', '0');
        }
    });

    var alerts_counter = localStorage.getItem('alerts_counter');

    $('#alerts_counter').
        val(alerts_counter)
        .attr('selected',true)
        .change(function() {
        alerts_counter = $('#alerts_counter').val();
        localStorage.setItem('alerts_counter', alerts_counter);
    });

    var alerts_old = localStorage.getItem('alerts_old');
    $('#alerts_old')
        .val(alerts_old)
        .attr('selected',true)
        .change(function() {
        alerts_old = $('#alerts_old').val();
        localStorage.setItem('alerts_old', alerts_old);
    });

    var ttl_alerts = localStorage.getItem('ttl_alerts');
    $('#ttl_alerts')
        .val(ttl_alerts)
        .attr('selected',true)
        .change(function() {
        ttl_alerts = $('#ttl_alerts').val();
        localStorage.setItem('ttl_alerts', ttl_alerts);
    });

    //stores the selected sound to local storage
    $('#sound').change(function () {
        var sound_id = $('#sound').val();
        localStorage.setItem('sound_id',sound_id)
    });

    //upon pop up load, takes the sound value from stroage and set the sound
    //select box
    var selectedSound = localStorage.getItem('sound_id');
    $('#sound').val(selectedSound).attr('selected', true);

    //AUDIO:
    var playing = false;
    var siren = new Audio();
    $(siren).on('ended', function() {
        playing = false;
        $('#sound_btn').attr('class','glyphicon glyphicon-play');
    });
    $('#sound_btn').click(function() { //Todo move the entire siren logic to json file settings file
        selected_sound = $('#sound').val();
        siren.src=chrome.extension.getURL(selected_sound);
        if (playing == false) {
            playing = true;
            $('#sound_btn').attr('class','glyphicon glyphicon-pause');
            siren.play();
            $('#sound_btn').attr('class','glyphicon glyphicon-pause');
        }
        else {
            siren.pause();
            playing = false;
            $('#sound_btn').attr('class','glyphicon glyphicon-play');
        }

    });
    $('#tweetbutton').on('click',function(){
        var w = 450;
        var h = 250;
        var left = (screen.width/2)-(w/2);
        var top = (screen.height/2)-(h/2);
        chrome.windows.create({'url': 'https://twitter.com/intent/tweet?url='+encodeURIComponent('https://chrome.google.com/webstore/detail/%D7%A6%D7%91%D7%A2-%D7%90%D7%93%D7%95%D7%9D-tzeva-adom-alert/dncebnaahdidjohadiecooobmanfgfhh')+'&text='+encodeURIComponent('גם אני עוקב/ת אחרי התרעות צבע אדום עם התוסף ״צבע אדום״ - התרעות בזמן אמת, רטווטו! #תוסף_זמן_אמת'), 'type': 'popup', 'width': w, 'height': h, 'left': left, 'top': top} , function(window) {
        });
    });

    $('#fbbutton').on('click',function() {
        var w = 450;
        var h = 368;
        var left = (screen.width / 2) - (w / 2);
        var top = (screen.height / 2) - (h / 2);
        chrome.windows.create({'url': 'https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent('https://chrome.google.com/webstore/detail/%D7%A6%D7%91%D7%A2-%D7%90%D7%93%D7%95%D7%9D-tzeva-adom-alert/dncebnaahdidjohadiecooobmanfgfhh'), 'type': 'popup', 'width': w, 'height': h, 'left': left, 'top': top}, function (window) {
        });
    });
});

//google analytics shit.
var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-52779159-1']);
_gaq.push(['_trackPageview']);

(function() {
    var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
    ga.src = 'https://ssl.google-analytics.com/ga.js';
    var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();

