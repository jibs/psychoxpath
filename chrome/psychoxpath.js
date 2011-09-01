(function() {
  /*
  # (c) 2011 Tyler Kennedy <tkpsychoxpath.tkte.ch>
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
    uniqueAttribute: function(node, options) {
      var attr, attrName, attrValue, attribute, cl, classes, defaults, nodeName, q, val, _i, _j, _len, _len2, _ref, _ref2, _ref3, _ref4, _ref5;
      defaults = {
        includeTags: ['id', 'class', 'font', 'color'],
        excludeClasses: []
      };
      for (attr in options) {
        val = options[attr];
        if (val != null) {
          defaults[attr] = val;
        }
      }
      _ref = node.attributes;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        attribute = _ref[_i];
        if ((_ref2 = (_ref3 = attribute.nodeName, __indexOf.call(defaults.includeTags, _ref3) < 0)) != null ? _ref2 : []) {
          continue;
        }
        nodeName = node.nodeName.toLowerCase();
        attrName = attribute.nodeName.toLowerCase();
        attrValue = attribute.nodeValue;
        switch (attrName) {
          case 'class':
            classes = attrValue.split(' ');
            for (_j = 0, _len2 = classes.length; _j < _len2; _j++) {
              cl = classes[_j];
              if (__indexOf.call(defaults.excludeClasses, cl) < 0) {
                q = "//" + nodeName + "[contains(concat(' ', @class, ' '), ' " + cl + " ')]";
                if (((_ref4 = psychoxpath.evaluateXPath(q)) != null ? _ref4.length : void 0) === 1) {
                  return "[contains(concat(' ', @class, ' '), ' " + cl + " ')]";
                }
              }
            }
            break;
          default:
            q = "//" + nodeName + "[@" + attrName + "='" + attrValue + "']";
            if (((_ref5 = psychoxpath.evaluateXPath(q)) != null ? _ref5.length : void 0) === 1) {
              return "[@" + attrName + "='" + attrValue + "']";
            }
        }
      }
      return null;
    },
    /*
        # Get the absolute XPath for the given node.
        # If `position_only` is true, attributes will not be used
        # when building the path.
        */
    getXPath: function(node, options) {
      var attr, defaults, name, peer, q, tmp, val, _i, _len, _ref, _ref2, _ref3;
      defaults = {
        useAttributes: true,
        includeTags: null,
        excludeClasses: null,
        path: []
      };
      for (attr in options) {
        val = options[attr];
        if (val != null) {
          defaults[attr] = val;
        }
      }
      if (node.parentNode != null) {
        psychoxpath.getXPath(node.parentNode, defaults);
      }
      if (node.nodeType !== node.ELEMENT_NODE) {
        return defaults.path;
      }
      name = node.nodeName.toLowerCase();
      tmp = ["/" + name];
      if (defaults.useAttributes) {
        q = psychoxpath.uniqueAttribute(node, {
          includeTags: defaults.includeTags,
          excludeClasses: defaults.excludeClasses
        });
        if (q != null) {
          tmp.push(q);
          defaults.path.push(tmp.join(''));
          return defaults.path;
        }
      }
      _ref3 = (_ref = (_ref2 = node.parentNode) != null ? _ref2.childNodes : void 0) != null ? _ref : [];
      for (_i = 0, _len = _ref3.length; _i < _len; _i++) {
        peer = _ref3[_i];
        if (node !== peer && psychoxpath._sameType(node, peer)) {
          tmp.push("[" + (psychoxpath._getPosition(node)) + "]");
          break;
        }
      }
      defaults.path.push(tmp.join(''));
      return defaults.path;
    },
    /*
        # Extremely silly way of getting a short(er) path.
        */
    shortestXPath: function(path) {
      var q, root, sub, x, _ref;
      root = [];
      for (x = _ref = path.length - 1; x >= 0; x += -1) {
        sub = "//" + (psychoxpath._noPrefix(path[x]));
        root.unshift(sub);
        q = psychoxpath.evaluateXPath(root.join(''));
        if (!(q != null) || (q != null ? q.length : void 0) === 1) {
          break;
        }
      }
      return root;
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
        if (q.snapshotLength > 0) {
          _results = [];
          for (x = 0, _ref = q.snapshotLength - 1; 0 <= _ref ? x <= _ref : x >= _ref; 0 <= _ref ? x++ : x--) {
            _results.push(q.snapshotItem(x));
          }
          return _results;
        }
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
        if (!(sibling != null)) {
          break;
        }
        if (psychoxpath._sameType(sibling, node)) {
          count++;
        }
        sibling = sibling.previousSibling;
      }
      return count;
    },
    _relative: function(sub) {
      return sub.indexOf('//' === 0);
    },
    _absolute: function(sub) {
      return sub.indexOf('/') === 0;
    },
    _noPrefix: function(sub) {
      if (psychoxpath._absolute(sub)) {
        return sub.substring(1);
      } else if (psychoxpath._relative(sub)) {
        return sub.substring(2);
      } else {
        return sub;
      }
    }
  };
  (typeof exports !== "undefined" && exports !== null ? exports : this).psychoxpath = psychoxpath;
}).call(this);
