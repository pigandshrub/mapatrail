#!/usr/bin/env python
import datetime
import time
import os, glob

my_dir = os.path.realpath("../public/other")
for fname in glob.os.listdir(my_dir):
    if (fname < int(time.time()-600)):
        os.remove(os.path.join(my_dir, fname))
