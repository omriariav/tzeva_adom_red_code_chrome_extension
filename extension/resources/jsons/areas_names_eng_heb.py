__author__ = 'Omri'
import json
from pprint import pprint
import hashlib
import codecs

#CONSTS:

CONVERSION_TSV_FILE = "areas_translation.tsv"
OLD_AREAS_JSON = "areas_fixed.json"
TRANSLATION_TABLE = "areas_translation.tsv"
#FUNCTIONS:

def load_conversion_file_to_dictionay():
    res = {}
    file_handler = open(CONVERSION_TSV_FILE, 'r')
    file_lines = file_handler.readlines()
    for line in file_lines:
        line = line.strip()
        fields = line.split('\t')
        area_english_name = fields[0]
        area_hebrew_name = fields[1]
        area_hebrew_name_md5 = md5_string(area_hebrew_name)
        res[area_hebrew_name_md5] = (area_hebrew_name, area_english_name)
    return res

def md5_string(string_to_md5):
    try:
        res = hashlib.md5(string_to_md5).hexdigest()
    except:
        res = ""
    return res

def load_areas_json():
    res = codecs.open(OLD_AREAS_JSON).read().decode('utf-8','ignore')
    # res = json.loads(codecs.open(OLD_AREAS_JSON, encoding='utf-8').read())
    print res
    # for key in res.keys():
    #     print key.decode('utf-8','ignore')
    return res

def load_translation_table():
    res = {}
    table_loader = open(TRANSLATION_TABLE, 'r').readlines()
    for line in table_loader:
        line = line.strip()
        print type(line)
        hebrew_name = hashlib.md5(line.split('\t')[0]).hexdigest()
        english_name = line.split('\t')[1]
        res[hebrew_name] = english_name
    return res


def create_english_object(area_name_eng_string,list_of_english_locations):
    #TODO verfiy parameters for this function
    res = {
        "english": {
            "area_name_eng": area_name_eng_string,
            "locations_eng": list_of_english_locations
        }
    }
    return res

def append_english_object_to_areas_json(english_object):

    return True

def show_something_on_screen(something_to_show):
    pprint(something_to_show)

def create_json_file(json_object):
    return True

def main():
    # translation_dict = load_translation_table()
    areas_json = load_areas_json()
    # for key in areas_json:
    #     print key
    #     print translation_dict[key.encode('utf-8')]

def debug():
    # load_conversion_file_to_dictionay()
    # load_areas_json()
    load_translation_table()

if __name__ == "__main__":
    main()
    # debug()