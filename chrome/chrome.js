/*
# (c) 2011 Tyler Kennedy <tk@tkte.ch>
*/
var absolute, attributes, default_context, echoConsole, echo_console, menu, message_and_save, positional, root, send_message, shortTable, shortest, table, testXPath, to_clipboard;
attributes = true;
echo_console = true;
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
  message.echo || (message.echo = true);
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
send_message = function(tab, message, callback) {
  var _ref, _ref2, _ref3;
  if ((_ref = message.attributes) == null) {
    message.attributes = attributes;
  }
  if ((_ref2 = message.short) == null) {
    message.short = false;
  }
  if ((_ref3 = message.echo) == null) {
    message.echo = echo_console;
  }
  return chrome.tabs.sendRequest(tab.id, message, function(response) {
    if (!(response != null) || !(response.result != null)) {
      return;
    }
    if (callback != null) {
      return callback(response);
    }
  });
};
menu = {
  echoConsole: function(info, tab) {
    return echo_console = info.checked;
  },
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
  },
  testXPath: function(info, tab) {
    var xpath;
    xpath = prompt('XPath:', '');
    if (!xpath) {
      return;
    }
    return send_message(tab, {
      act: 'test',
      path: xpath
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
testXPath = chrome.contextMenus.create({
  title: 'Test XPath',
  parentId: root,
  contexts: default_context,
  onclick: menu.testXPath
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
echoConsole = chrome.contextMenus.create({
  title: 'Echo XPaths to console',
  parentId: root,
  contexts: default_context,
  type: 'checkbox',
  checked: echo_console,
  onclick: menu.echoConsole
});