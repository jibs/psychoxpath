(function() {
  /*
  # (c) 2011 Tyler Kennedy <tk@tkte.ch>
  */
  var absolute, attributes, clearHighlight, default_context, echoConsole, echo_console, highlightOnXPath, message_and_save, positional, root, send_message, shortest, testXPath, testXPathHigh, to_clipboard, useClipboard, use_clipboard, use_highlight;
  attributes = true;
  echo_console = true;
  use_clipboard = true;
  use_highlight = true;
  /*
  # Copy the contents of `text` to the clipboard.
  */
  to_clipboard = function(text) {
    var textarea;
    if (!use_clipboard) {
      return;
    }
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
      var path, _ref;
      path = response != null ? (_ref = response.results) != null ? _ref.join('') : void 0 : void 0;
      if (!path) {
        return;
      }
      to_clipboard(path);
      if (use_highlight) {
        return send_message(tab, {
          act: 'highlight',
          path: path
        });
      }
    });
  };
  /*
  # Sends a message to the given tab, filling in defaults and
  # optionally calling a callback.
  */
  send_message = function(tab, message, callback) {
    var _ref, _ref2, _ref3, _ref4;
    if ((_ref = message.attributes) == null) {
      message.attributes = attributes;
    }
    if ((_ref2 = message.short) == null) {
      message.short = false;
    }
    if ((_ref3 = message.echo) == null) {
      message.echo = echo_console;
    }
    if ((_ref4 = message.highlight) == null) {
      message.highlight = use_highlight;
    }
    return chrome.tabs.sendRequest(tab.id, message, function(response) {
      if (callback) {
        return callback(response);
      }
    });
  };
  /*
  # Omnibox highlighting and suggestion support for XPaths.
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
        if (!((_ref = response.results) != null ? _ref.length : void 0)) {
          return;
        }
        suggest(response.results);
        if (use_highlight) {
          return send_message(tab, {
            act: 'highlight',
            path: text
          });
        }
      });
    });
  });
  /*
  # Highlight and store the choosen XPath (from the omnibox).
  */
  chrome.omnibox.onInputEntered.addListener(function(text) {
    return chrome.tabs.getSelected(null, function(tab) {
      send_message(tab, {
        act: 'highlight',
        path: text
      });
      return to_clipboard(text);
    });
  });
  /*
  # Erase existing highlights. 
  */
  chrome.omnibox.onInputCancelled.addListener(function() {
    return chrome.tabs.getSelected(null, function(tab) {
      return send_message(tab, {
        act: 'highlight'
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
  testXPath = chrome.contextMenus.create({
    title: 'Test XPath (Console)',
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
  testXPathHigh = chrome.contextMenus.create({
    title: 'Test XPath (Highlight)',
    parentId: root,
    contexts: default_context,
    onclick: function(info, tab) {
      var xpath;
      xpath = prompt('XPath:', '');
      if (!xpath) {
        return;
      }
      return send_message(tab, {
        act: 'highlight',
        path: xpath
      });
    }
  });
  clearHighlight = chrome.contextMenus.create({
    title: 'Clear Highlights',
    parentId: root,
    contexts: default_context,
    onclick: function(info, tab) {
      return send_message(tab, {
        act: 'highlight'
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
    title: 'Copy XPaths to console',
    parentId: root,
    contexts: default_context,
    type: 'checkbox',
    checked: echo_console,
    onclick: function(info, tab) {
      return echo_console = info.checked;
    }
  });
  useClipboard = chrome.contextMenus.create({
    title: 'Copy XPaths to clipboard',
    parentId: root,
    contexts: default_context,
    type: 'checkbox',
    checked: use_clipboard,
    onclick: function(info, tab) {
      return use_clipboard = info.checked;
    }
  });
  highlightOnXPath = chrome.contextMenus.create({
    title: 'Highlight Matching Elements',
    parentId: root,
    contexts: default_context,
    type: 'checkbox',
    checked: use_highlight,
    onclick: function(info, tab) {
      return use_highlight = info.checked;
    }
  });
}).call(this);
