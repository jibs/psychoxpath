/*
# (c) 2011 Tyler Kennedy <tk@tkte.ch>
*/
var absolute, attributes, default_context, menu, message_and_save, positional, root, shortTable, shortest, table, to_clipboard;
attributes = true;
/*
# Copy the contents of `text` to the clipboard.
*/
to_clipboard = function(text) {
  var textarea;
  textarea = document.getElementById("copy-workaround");
  textarea.value = text;
  textarea.select();
  return document.execCommand("copy", false, null);
};
/*
# Sends a message to the content script on `tab` with the
# body `message`, saving the response (if any) to the clipboard.
*/
message_and_save = function(tab, message) {
  message.attributes || (message.attributes = attributes);
  message.short || (message.short = false);
  return chrome.tabs.sendRequest(tab.id, message, function(response) {
    if (!(response != null) || !(response.result != null)) {
      return;
    }
    if ((message.short != null) && message.short) {
      return to_clipboard("//" + (response.result.join('/')));
    } else {
      return to_clipboard("/" + (response.result.join('/')));
    }
  });
};
menu = {
  positional: function(info, tab) {
    return attributes = info.checked;
  },
  absolute: function(info, tab) {
    return message_and_save(tab, {
      act: 'absolute'
    });
  },
  shortest: function(info, tab) {
    return message_and_save(tab, {
      act: 'absolute',
      short: true
    });
  },
  table: function(info, tab) {
    return message_and_save(tab, {
      act: 'table'
    });
  },
  shortTable: function(info, tab) {
    return message_and_save(tab, {
      act: 'table',
      short: true
    });
  }
};
default_context = ['all'];
root = chrome.contextMenus.create({
  title: 'PsychoXPath',
  contexts: default_context
});
absolute = chrome.contextMenus.create({
  title: 'Element (Absolute)',
  parentId: root,
  contexts: default_context,
  onclick: menu.absolute
});
shortest = chrome.contextMenus.create({
  title: 'Element (Shortest)',
  parentId: root,
  contexts: default_context,
  onclick: menu.shortest
});
chrome.contextMenus.create({
  type: 'separator',
  parentId: root,
  contexts: default_context
});
table = chrome.contextMenus.create({
  title: 'Containing Table (Absolute)',
  parentId: root,
  contexts: default_context,
  onclick: menu.table
});
shortTable = chrome.contextMenus.create({
  title: 'Containing Table (Shortest)',
  parentId: root,
  contexts: default_context,
  onclick: menu.shortTable
});
chrome.contextMenus.create({
  type: 'separator',
  parentId: root,
  contexts: default_context
});
positional = chrome.contextMenus.create({
  title: 'Use attributes in XPaths',
  parentId: root,
  contexts: default_context,
  type: 'checkbox',
  checked: attributes,
  onclick: menu.positional
});