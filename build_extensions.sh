#!/usr/bin/env sh

# Build the core and copy it over
coffee --bare --compile psychoxpath.coffee
cp psychoxpath.js chrome

# Build the individual components
coffee --bare -o chrome/ -c chrome/
