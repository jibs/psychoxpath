(function() {
  /*
  # (c) 2011 Tyler Kennedy <tk@tkte.ch>
  */
  var absolute, attributes, default_context, echoConsole, echo_console, message_and_save, positional, root, send_message, shortTable, shortest, table, testXPath, to_clipboard;
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
    return send_message(tab, message, function(response) {
      if (!(response.results != null)) {
        return;
      }
      return to_clipboard(response.results.join(''));
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
      if (callback) {
        return callback(response);
      }
    });
  };
  /*
  # Autocompletion support for XPaths
  */
  chrome.omnibox.onInputChanged.addListener(function(text, suggest) {
    if (!text) {
      return;
    }
    return chrome.tabs.getSelected(null, function(tab) {
      return send_message(tab, {
        act: 'autocomplete',
        text: text
      }, function(response) {
        var _ref;
        if (((_ref = response.results) != null ? _ref.length : void 0) > 0) {
          return suggest(response.results);
        }
      });
    });
  });
  default_context = ['all'];
  root = chrome.contextMenus.create({
    title: 'PsychoXPath',
    contexts: default_context
  });
  absolute = chrome.contextMenus.create({
    title: 'Element (Absolute)',
    parentId: root,
    contexts: default_context,
    onclick: function(info, tab) {
      return message_and_save(tab, {
        act: 'get'
      });
    }
  });
  shortest = chrome.contextMenus.create({
    title: 'Element (Short)',
    parentId: root,
    contexts: default_context,
    onclick: function(info, tab) {
      return message_and_save(tab, {
        act: 'get',
        short: true
      });
    }
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
    onclick: function(info, tab) {
      return message_and_save(tab, {
        act: 'table'
      });
    }
  });
  shortTable = chrome.contextMenus.create({
    title: 'Containing Table (Short)',
    parentId: root,
    contexts: default_context,
    onclick: function(info, tab) {
      return message_and_save(tab, {
        act: 'table',
        short: true
      });
    }
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
    onclick: function(info, tab) {
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
    onclick: function(info, tab) {
      return attributes = info.checked;
    }
  });
  echoConsole = chrome.contextMenus.create({
    title: 'Echo XPaths to console',
    parentId: root,
    contexts: default_context,
    type: 'checkbox',
    checked: echo_console,
    onclick: function(info, tab) {
      return echo_console = info.checked;
    }
  });
}).call(this);
