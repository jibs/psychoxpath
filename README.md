# PsychoXPath
PsychoXPath is a silly rainy-day (24 hour) project built to suit myself, as I found the existing XPath tools for chrome somewhat lacking for my needs. It's more than likely you'll find a bug with it, in which case I hope you report it so I can fix it :)

## Portability
This core has only been tested on Firefox 4 and Chrome (Canary). The core's only dependency is [Coffeescript](http://jashkenas.github.com/coffee-script/), which it is written in. The generated JS has no dependencies and can be used anywhere.

## Core Features
- Create absolute paths for a given node, with variations
- Very simple (and fairly stupid) ability to optimize absolute paths into shorter equivalents
- Choose between using explicit positions or attributes for generated XPaths (it will always use positional indexes if there is no other way to make the path unique)
- Control which attributes are tested when generating paths (has sensible defaults) and exclude certain classes (for integration with other tools that may modify the path, such as the chrome extension which adds a class to highlight the element).

## Chrome Extension Features
![Using the omnibox](http://i.imgur.com/7T4Ux.png)
![Contextual menu support](http://i.imgur.com/HVCWH.png)

### Contextual Menu (right-click)
- Getting element XPaths via the contextual menu (right-click)
- Test XPaths on a page (via console output or visually highlighting matches)
- Automatically copy XPaths to the clipboard and/or console (optional)
- Automatically highlight matching elements (optional)

### Omnibox
- Auto-complete-ish XPaths using omnibox suggestions (try typing 'xpath //a' on any webpage)
- Visually show matches as-you-type (optional)
- Copying auto-completed XPath to the clipboard (optional) or console (optional)
