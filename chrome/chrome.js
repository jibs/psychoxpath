var use_attributes = true;

function copy_to_clipboard(text) {
    var textarea = document.getElementById("copy-workaround");
    textarea.value =  text;
    textarea.select();
    document.execCommand("copy", false, null);
}

function send_message_for_clip(tab, message) {
    message.attributes = use_attributes;
    chrome.tabs.sendRequest(tab.id, message, function(response) {
        if(response && typeof(response.result) !== "undefined") {
            result = response.result;
            if(result) {
                copy_to_clipboard('/' + result.join('/'));
            }
        }
    });
}

function absolute_to_buffer(info, tab) {
    send_message_for_clip(tab, {'act': 'absolute'});
}

function shortest_to_buffer(info, tab) {
    send_message_for_clip(tab, {'act': 'shortest'});
}

function containing_table_to_buffer(info, tab) {
    send_message_for_clip(tab, {'act': 'table'});
}

function toggle_positional(info, tab) {
    use_attributes = info.checked;
}

var root = chrome.contextMenus.create({
    'title': 'PsychoXPath',
    'contexts': ['page', 'selection', 'image', 'link'],
});

var absolute = chrome.contextMenus.create({
    'title': 'Absolute XPath',
    'parentId': root,
    'contexts': ['page', 'selection', 'image', 'link'],
    'onclick': absolute_to_buffer
});

var shortest = chrome.contextMenus.create({
    'title': 'Shortest XPath',
    'parentId': root,
    'contexts': ['page', 'selection', 'image', 'link'],
    'onclick': shortest_to_buffer
});


var seperator = chrome.contextMenus.create({
    'type': 'separator',
    'parentId': root,
    'contexts': ['page', 'selection', 'image', 'link'],
});

var shortest = chrome.contextMenus.create({
    'title': 'Containing Table XPath',
    'parentId': root,
    'contexts': ['page', 'selection', 'image', 'link'],
    'onclick': containing_table_to_buffer 
});

var seperator = chrome.contextMenus.create({
    'type': 'separator',
    'parentId': root,
    'contexts': ['page', 'selection', 'image', 'link'],
});

var positional = chrome.contextMenus.create({
    'title': 'Use Attributes for Paths',
    'type': 'checkbox',
    'parentId': root,
    'contexts': ['page', 'selection', 'image', 'link'],
    'onclick': toggle_positional,
    'checked': use_attributes
});
