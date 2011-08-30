var use_attributes = true;

function copy_to_clipboard(text) {
    var textarea = document.getElementById("copy-workaround");
    textarea.value =  text;
    textarea.select();
    document.execCommand("copy", false, null);
}

function absolute_to_buffer(info, tab) {
    chrome.tabs.sendRequest(tab.id, {
        'act': 'absolute',
        'attributes': use_attributes
    }, function(response) {
        if(response && typeof(response.result) !== "undefined") {
            result = response.result;
            copy_to_clipboard('/' + result.join('/'));
        }
    });
}

function shortest_to_buffer(info, tab) {
    chrome.tabs.sendRequest(tab.id, {
        'act': 'shortest',
        'attributes': use_attributes
    }, function(response) {
        if(response && typeof(response.result) !== "undefined") {
            result = response.result;
            copy_to_clipboard('//' + result.join('/'));
        }
    });
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

var positional = chrome.contextMenus.create({
    'title': 'Use Attributes',
    'type': 'checkbox',
    'parentId': root,
    'contexts': ['page', 'selection', 'image', 'link'],
    'onclick': toggle_positional,
    'checked': use_attributes
});
