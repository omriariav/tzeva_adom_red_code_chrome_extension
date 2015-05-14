# -*- coding: utf-8 -*-
__author__ = 'omriariav'
import urllib
import urllib2
import json

URL = "http://localhost:3020/780e73490dcce9516fd7e344d6d12c04"
KEY = 'e5ce3ce848c179b1f09517ffbc369437'

ALERT_1 = {
    'key':KEY,
    'alert': {
        'test':'test'
    }
}

ALERT_2 = {
    'key':KEY,
    'alert':
    {
        "timestamp": 1411053999749,
        "area_name": "ניסיון בדיקה",
        "time_to_cover": 90,
        "locations": [
            "מדרשת בן גוריון",
            "מצפה רמון",
            "מרחב עם",
            "שדה בוקר",
            "שלווה במדבר"
        ]
    }
}

def post_alert(alertbody):
    print alertbody
    handler = urllib2.HTTPHandler()
    opener = urllib2.build_opener(handler)
    request = urllib2.Request(URL, data=urllib.urlencode(alertbody))
    # request = urllib2.Request(URL, data=json.dump(alertbody)
    request.get_method = lambda: "POST"
    try:
        connection = opener.open(request)
    except urllib2.HTTPError, e:
        connection = e
    if connection.code == 200:
        data = connection.read()
    else:
        data = connection
    return data


if __name__ == "__main__":
    print post_alert(ALERT_2)
