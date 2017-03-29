# -*- coding: utf-8 -*-
import sys
import re
import glob
from collections import Counter

def stat(file):
    print "Rank for file:"+file+"\n"
    f = open(file, 'r')
    p = re.compile('^20\S+\s\S+\s(.*)\(\d+\)$')
    cnt = Counter()
    while True:
        line =  f.readline()
        if len(line)==0:
            break
        m = p.match(line)
        if m is not None:
            name = m.group(1).decode('utf8')
            cnt[name] += 1
    
    result = cnt.most_common(20)
    rank = 1
    for r in result:
        print str(rank)+"."+r[0]+":"+str(r[1])
        rank += 1
    f.close()
    print "\n"

if __name__ == '__main__':
    files = glob.glob("*.txt")
    if len(files)==0:
        print "cant find any text file"
        sys.exit(1)
    
    for file in files:
        stat(file)
    
    raw_input("Press Enter to Exit")