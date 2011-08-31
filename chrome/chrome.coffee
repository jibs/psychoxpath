###
# (c) 2011 Tyler Kennedy <tk@tkte.ch>
###
attributes = on
echo_console = on
use_clipboard = on

###
# Copy the contents of `text` to the clipboard.
###
to_clipboard = (text) ->
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
        return if not response.results?
        to_clipboard response.results.join('')

send_message = (tab, message, callback) ->
    message.attributes ?= attributes
    message.short ?= off
    message.echo ?= echo_console

    chrome.tabs.sendRequest tab.id, message, (response) ->
        callback(response) if callback

###
# Autocompletion support for XPaths
###
chrome.omnibox.onInputChanged.addListener (text, suggest) ->
    return if not text
    chrome.tabs.getSelected null, (tab) ->
        send_message tab, { act: 'autocomplete', text: text }, (response) ->
            suggest(response.results) if response.results?.length > 0

chrome.omnibox.onInputEntered.addListener (text) ->
    chrome.tabs.getSelected null, (tab) ->
        send_message tab, { act: 'highlight', path: text }
        to_clipboard text

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
        send_message tab, { act: 'highlight', path: ''}
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
