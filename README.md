# PsychoXPath
This is a (really) silly and very quickly done jQuery-based bookmarklet. Its one and only function is to extract an XPath from a page, and brute-force the shortest unique path in a non-complicated, non-optimal way.

## Usage
1. Copy the contents of psychoxpath.min.js into a bookmark. 
2. Find a page of interest.
3. Click on the bookmark.
4. Hold shift and click on any element.

Two XPaths will be logged to the console, the first being the absolute path, and the 2nd being the shortest path it could naïvely brute force with only one possible match.

## Portability
This bookmarklet has only been tested on Firefox 4 and Chrome (Canary). No reason it shouldn't work anywhere jQuery does (famous last words?)
