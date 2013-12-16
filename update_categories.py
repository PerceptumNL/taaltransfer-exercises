import gspread
from datetime import datetime
from config import *
import sys
import json

class TaalSpread(object):

    def __init__(self, user, pwd, key, sheet=None):
        # Login with your Google account
        print "Connecting..."
        self.gc = gspread.login(user, pwd)
        # Open a worksheet from spreadsheet with one shot
        self.sh = self.gc.open_by_key(key)
        try:
            self.wks = self.sh.sheet1
            #self.wks = self.sh.worksheet("test")
            print self.wks
        except:
            sys.exit("cound't find spreadsheet")
        print "Connected! :)"
        first = datetime.now().isoformat()
        print "Getting all..."
        self.all_rows = self.wks.get_all_values()
        print "Got all rows! :)"
        self.valids = self.fetch_valids_in_col()
        self.categories_col = self.fetch_categories_col()
        self.header = self.fetch_header()

    def fetch_header(self):
        print "fetch_header"
        return self.wks.row_values(1)

    def fetch_valids_in_col(self):
        print "fetch_valids_in_col"
        valids_col = self.wks.col_values(self.valid_col)
        return [i for i,v in enumerate(valids_col) if v == 'x']

    def fetch_categories_col(self):
        print "fetch_categories_col"
        return self.wks.col_values(2)

    def get_all_sentences(self):
        return self.wks.get_all_values()


    def get_category_sentences(self, category):
        row_indexes = [idx+1 for idx, cat in enumerate(self.categories_col) if cat and cat.isdigit() and int(cat) == category]
        sentences = [] 
        for idx, row_index in enumerate(row_indexes): 
            if row_index in self.valids:
                row = self.all_rows[row_index]
                print "category %d: %d/%d " % (category, idx + 1, len(row_indexes))
                sentences.append(row)
        return sentences
            
    def write_category(self, category):
        sentences = self.get_category_sentences(category)
        f = open("cats/%d_%s" % (category, self.file_suffix), "w")
        json.dump({
            "date": datetime.now().isoformat(),
            "header": self.header,
            "category": category,
            "sentences": sentences
        }, f, sort_keys=True, indent=1, separators=(',', ': '))
        f.close()

    def write_all_categories(self):
        for i in range(1, 98):
            self.write_category(i)
            

class ZinnenSpread(TaalSpread):
    valid_col = 27
    file_suffix = "zinnen.json"
    def __init__(self, *args, **kwargs):
        super(ZinnenSpread, self).__init__(*args, **kwargs)

class ZinsdelenSpread(TaalSpread):
    valid_col = 3
    file_suffix = "zinsdelen.json"
    def __init__(self, *args, **kwargs):
        super(ZinsdelenSpread, self).__init__(*args, **kwargs)

        

print "ZinnenSpread"
s = ZinnenSpread(USER, PWD, SH_ZINNEN)
s.write_all_categories()
#print "ZinsdelenSpread"
#s = ZinsdelenSpread(USER, PWD, SH_ZINSDELEN)
#s.write_all_categories()

#print s.write_category(1)

