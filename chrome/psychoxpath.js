(function() {
  /*
  # (c) 2011 Tyler Kennedy <tk@tkte.ch>
  */
  var psychoxpath;
  var __indexOf = Array.prototype.indexOf || function(item) {
    for (var i = 0, l = this.length; i < l; i++) {
      if (this[i] === item) return i;
    }
    return -1;
  };
  psychoxpath = {
    /*
        # Returns a unique attribute selector for the given node,
        # if one exists.
        */
    uniqueAttribute: function(node, valid_tags) {
      var attribute, _i, _len, _ref, _ref2;
      if (valid_tags == null) {
        valid_tags = ['id', 'class', 'font', 'color'];
      }
      _ref = node.attributes;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        attribute = _ref[_i];
        if (_ref2 = attribute.nodeName, __indexOf.call(valid_tags, _ref2) < 0) {
          continue;
        }
        if (this._uniqueAttribute(node, attribute)) {
          return [attribute.nodeName, attribute.nodeValue];
        }
      }
      return [null, null];
    },
    /*
        # Get the absolute XPath for the given node.
        # If `position_only` is true, attributes will not be used
        # when building the path.
        */
    getXPath: function(node, path, position_only) {
      var a_name, a_value, name, tmp, _ref;
      path || (path = []);
      position_only || (position_only = false);
      if (node.parentNode != null) {
        path = this.getXPath(node.parentNode, path, position_only);
      }
      if (node.nodeType !== node.ELEMENT_NODE) {
        return path;
      }
      name = node.nodeName.toLowerCase();
      tmp = [name];
      if (!position_only) {
        _ref = this.uniqueAttribute(node), a_name = _ref[0], a_value = _ref[1];
        if ((a_name != null) || (a_value != null)) {
          tmp.push("[@" + a_name + "='" + a_value + "']");
          path.push(tmp.join(''));
          return path;
        }
      }
      if (this._sameType(node.previousSibling, node.nextSibling)) {
        tmp.push("[" + (this._getPosition(node)) + "]");
      }
      path.push(tmp.join(''));
      return path;
    },
    /*
        # Returns the path up to the last occurance of `type`.
        */
    lastOfType: function(path, type) {
      var idx, part, tmp, _ref;
      for (part = _ref = path.length - 1; part >= 0; part += -1) {
        tmp = path[part].toLowerCase();
        idx = tmp.indexOf('[');
        if (idx !== -1) {
          tmp = tmp.substring(0, idx);
        }
        if (tmp.indexOf(type.toLowerCase()) === 0) {
          return path.slice(0, (part + 1) || 9e9);
        }
      }
      return path;
    },
    /*
        # Extremely silly way of getting the shortest path, again by brute
        # forcing it.
        */
    shortestXPath: function(path) {
      var part, q, shortest, _ref;
      shortest = [];
      for (part = _ref = path.length - 1; part >= 0; part += -1) {
        q = this.evaluateXPath("//" + path[part]);
        shortest.push(path[part]);
        if (q.length === 1) {
          break;
        }
      }
      shortest.reverse();
      return shortest;
    },
    /*
        # Evaluate an XPath, returning a list of results.
        # Results are ordered as they appear in the DOM.
        */
    evaluateXPath: function(path, context) {
      var q, x, _ref, _results;
      context || (context = document);
      if (document.evaluate) {
        try {
          q = document.evaluate(path, context, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
        } catch (error) {
          return null;
        }
        _results = [];
        for (x = 0, _ref = q.snapshotLength - 1; 0 <= _ref ? x <= _ref : x >= _ref; 0 <= _ref ? x++ : x--) {
          _results.push(q.snapshotItem(x));
        }
        return _results;
      }
      return null;
    },
    _sameType: function(left, right) {
      if ((left != null ? left.nodeType : void 0) === (right != null ? right.nodeType : void 0)) {
        if ((left != null ? left.nodeName : void 0) === (right != null ? right.nodeName : void 0)) {
          return true;
        }
      }
      return false;
    },
    _getPosition: function(node) {
      var count, sibling;
      count = 1;
      sibling = node.previousSibling;
      while (true) {
        if (this._sameType(sibling, node)) {
          count++;
        }
        sibling = sibling.previousSibling;
        if (!(sibling != null)) {
          break;
        }
      }
      return count;
    },
    _uniqueAttribute: function(node, att) {
      var name, q;
      name = node.nodeName.toLowerCase();
      q = "//" + name + "[@" + att.nodeName + "='" + att.nodeValue + "']";
      return this.evaluateXPath(q).length === 1;
    }
  };
  (typeof exports !== "undefined" && exports !== null ? exports : this).psychoxpath = psychoxpath;
}).call(this);
