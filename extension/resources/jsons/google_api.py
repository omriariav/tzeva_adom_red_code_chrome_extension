# -*- coding: utf-8 -*-
__author__ = 'Omri'
import urllib2
import json
from pprint import pprint
import time

#CONSTS
GOOGLE_URL = "https://maps.googleapis.com/maps/api/geocode/json?address="

#FUNCTIONS
def get_eng_name(hebrew_name):
    hebrew_name = urllib2.quote(hebrew_name)
    response = urllib2.urlopen(GOOGLE_URL + hebrew_name)
    data = json.load(response)
    res = data['results'][0]['address_components'][0]['long_name']
    time.sleep(0.5)
    return res


current_list = [
            "אילניה",
            "בית קשת",
            "גזית",
            "דבוריה",
            "טורעאן",
            "כדורי",
            "כפר מיסר",
            "כפר קיש",
            "כפר תבור",
            "מרכז אזורי כדורי",
            "עין דור",
            "שבלי",
            "שדמות דבורה",
            "שעורים"
        ]

final = []
for idx, city in enumerate(current_list):
    print '%d/%d  -  %s' % (idx + 1, len(current_list), city)
    final.append(str(get_eng_name(city)))

print len(final)
pprint(final)
print "\n***\n"
print repr(final).replace('"',"'")



