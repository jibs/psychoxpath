###
# (c) 2011 Tyler Kennedy <tk@tkte.ch>
###
attributes = on
echo_console = on
use_clipboard = on
use_highlight = on

###
# Copy the contents of `text` to the clipboard.
###
to_clipboard = (text) ->
    # User doesn't want anything on their clipboard
    return if not use_clipboard

    textarea = document.getElementById "copy-workaround"
    textarea.value = text
    textarea.select()
    document.execCommand "copy", false, null

###
# Sends a message to the content script on `tab` with the
# body `message`, saving the response (if any) to the clipboard.
###
message_and_save = (tab, message) ->
    send_message tab, message, (response) ->
        path = response?.results?.join('')
        return if not path
        to_clipboard path 
        send_message(tab, { act: 'highlight', path: path }) if use_highlight

###
# Sends a message to the given tab, filling in defaults and
# optionally calling a callback.
###
send_message = (tab, message, callback) ->
    message.attributes ?= attributes
    message.short ?= off
    message.echo ?= echo_console
    message.highlight ?= use_highlight

    chrome.tabs.sendRequest tab.id, message, (response) ->
        callback(response) if callback

###
# Omnibox highlighting and suggestion support for XPaths.
###
chrome.omnibox.onInputChanged.addListener (text, suggest) ->
    return if not text
    chrome.tabs.getSelected null, (tab) ->
        send_message tab, { act: 'autocomplete', text: text }, (response) ->
            if not response.results?.length
                send_message(tab, { act: 'highlight'}) if use_highlight
                return

            suggest(response.results) 
            send_message(tab, { act: 'highlight', path: text }) if use_highlight

###
# Highlight and store the choosen XPath (from the omnibox).
###
chrome.omnibox.onInputEntered.addListener (text) ->
    chrome.tabs.getSelected null, (tab) ->
        send_message tab, { act: 'highlight', path: text }
        to_clipboard text

###
# Erase existing highlights. 
###
chrome.omnibox.onInputCancelled.addListener ->
    chrome.tabs.getSelected null, (tab) ->
        send_message tab, { act: 'highlight' }

# When our contextual menu should show
default_context = ['all']

root = chrome.contextMenus.create({
    title: 'PsychoXPath'
    contexts: default_context
})

absolute = chrome.contextMenus.create({
    title: 'Element (Absolute)'
    parentId: root
    contexts: default_context
    onclick: (info, tab) ->
        message_and_save tab, { act: 'get' }
})

shortest = chrome.contextMenus.create({
    title: 'Element (Short)'
    parentId: root
    contexts: default_context
    onclick: (info, tab) ->
        message_and_save tab, { act: 'get', short: true }
})

chrome.contextMenus.create({
    type: 'separator'
    parentId: root
    contexts: default_context
})

testXPath = chrome.contextMenus.create({
    title: 'Test XPath (Console)'
    parentId: root
    contexts: default_context
    onclick: (info, tab) ->
        xpath = prompt 'XPath:', ''
        return if not xpath
        send_message tab, { act: 'test', path: xpath}
})

testXPathHigh = chrome.contextMenus.create({
    title: 'Test XPath (Highlight)'
    parentId: root
    contexts: default_context
    onclick: (info, tab) ->
        xpath = prompt 'XPath:', ''
        return if not xpath
        send_message tab, { act: 'highlight', path: xpath}
})

clearHighlight = chrome.contextMenus.create({
    title: 'Clear Highlights'
    parentId: root
    contexts: default_context
    onclick: (info, tab) ->
        send_message tab, { act: 'highlight' }
})

chrome.contextMenus.create({
    type: 'separator'
    parentId: root
    contexts: default_context
})

positional = chrome.contextMenus.create({
    title: 'Use attributes in XPaths'
    parentId: root
    contexts: default_context
    type: 'checkbox'
    checked: attributes
    onclick: (info, tab) ->
        attributes = info.checked
})

echoConsole = chrome.contextMenus.create({
    title: 'Copy XPaths to console'
    parentId: root
    contexts: default_context
    type: 'checkbox'
    checked: echo_console 
    onclick: (info, tab) ->
        echo_console = info.checked
})

useClipboard = chrome.contextMenus.create({
    title: 'Copy XPaths to clipboard'
    parentId: root
    contexts: default_context
    type: 'checkbox'
    checked: use_clipboard 
    onclick: (info, tab) ->
        use_clipboard = info.checked
})

highlightOnXPath = chrome.contextMenus.create({
    title: 'Highlight Matching Elements'
    parentId: root
    contexts: default_context
    type: 'checkbox'
    checked: use_highlight
    onclick: (info, tab) ->
        use_highlight = info.checked
})
