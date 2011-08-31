#!/usr/bin/env sh
###
# (c) 2011 Tyler Kennedy <tk@tkte.ch>
###

# Build the core and copy it over
coffee --compile psychoxpath.coffee
cp psychoxpath.js chrome

# Build the individual components
coffee -o chrome/ -c chrome/
