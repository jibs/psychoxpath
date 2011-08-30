/*
# A jQuery-based bookmarklet to extract XPaths for a given node.
# (c) 2011 Tyler Kennedy <tk@tkte.ch>
*/jQuery(function($) {
  var evaluate_xpath, get_abs_xpath, last_xpath, node_position, node_unique, node_unique_attribute, on_element_event, shiftkey, shortest_xpath;
  shiftkey = false;
  last_xpath = null;
  /*
      # Get the 1-based index of the node to its parent.
      */
  node_position = function(node) {
    var count, sibling;
    count = 1;
    sibling = node.previousSibling;
    while (true) {
      if (sibling.nodeType === node.ELEMENT_NODE) {
        if (sibling.nodeName === node.nodeName) {
          count++;
        }
      }
      sibling = sibling.previousSibling;
      if (!(sibling != null)) {
        break;
      }
    }
    return count;
  };
  /*
      # Returns true if the given node and attribute are
      # unique in the document.
      */
  node_unique_attribute = function(node, att) {
    var q;
    q = "" + node.nodeName + "[" + att.nodeName + "='" + att.nodeValue + "']";
    return $(q).length === 1;
  };
  /*
      # Returns a unique attribute selector for the given node,
      # if one exists.
      */
  node_unique = function(node) {
    var attribute, tag, _i, _len, _ref;
    _ref = node.attributes;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      attribute = _ref[_i];
      tag = attribute.nodeName;
      if (tag !== 'id' && tag !== 'class') {
        continue;
      }
      if (node_unique_attribute(node, attribute)) {
        return [attribute.nodeName, attribute.nodeValue];
      }
    }
    return [null, null];
  };
  /*
      # Get the absolute XPath for the given node.
      # If `position_only` is true, attributes will not be used
      # when building the path.
      */
  get_abs_xpath = function(node, path, position_only) {
    var a_name, a_value, name, position, tmp, txm, _ref;
    path || (path = []);
    position_only || (position_only = true);
    if (node.parentNode != null) {
      txm = get_abs_xpath(node.parentNode, path);
    }
    tmp = [];
    if (node.nodeType !== node.ELEMENT_NODE) {
      return path;
    }
    name = node.nodeName.toLowerCase();
    tmp.push(name);
    if (!position_only) {
      _ref = node_unique(node), a_name = _ref[0], a_value = _ref[1];
      if ((a_name != null) || (a_value != null)) {
        tmp.push("[@" + a_name + "='" + a_value + "']");
        path.push(tmp.join(''));
        return path;
      }
    }
    if (!node.previousSibling) {
      return path + [name];
    }
    position = node_position(node);
    if (position > 1) {
      tmp.push("[" + position + "]");
    }
    path.push(tmp.join(''));
    return path;
  };
  /*
      # Extremely silly way of getting the shortest path, again by brute
      # forcing it.
      */
  shortest_xpath = function(path) {
    var part, q, shortest, _ref;
    shortest = [];
    for (part = _ref = path.length - 1; part >= 0; part += -1) {
      q = $(path[part].replace('@', ''));
      shortest.push(path[part]);
      if (q.length === 1) {
        break;
      }
    }
    return shortest.reverse();
  };
  /*
      # Evaluate a basic (attribute and index only) XPath.
      */
  evaluate_xpath = function(path) {
    var nodes, q, x, _ref;
    nodes = [];
    if (document.evaluate) {
      q = document.evaluate(path, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
      for (x = 0, _ref = q.snapshotLength - 1; 0 <= _ref ? x <= _ref : x >= _ref; 0 <= _ref ? x++ : x--) {
        nodes.push(q.snapshotItem(x));
      }
      return nodes;
    }
    return null;
  };
  on_element_event = function(event) {
    var path;
    if (shiftkey === false) {
      return true;
    }
    path = get_abs_xpath(this);
    if (last_xpath === path) {
      return false;
    }
    last_xpath = path;
    console.log("/" + (path.join('/')));
    console.log("//" + (shortest_xpath(path).join('/')));
    return false;
  };
  $(document).bind('keyup keydown', function(event) {
    shiftkey = event.shiftKey;
    return true;
  });
  return $('*').bind('click', on_element_event);
});