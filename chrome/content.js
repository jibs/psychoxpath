(function() {
  /*
  # (c) 2011 Tyler Kennedy <tk@tkte.ch>
  */
  var element;
  element = null;
  /*
  # Event delegation to get the element being selected by
  # the contexual menu. Required until the experimental context
  # menu additions are stable.
  */
  document.body.onmousedown = function(e) {
    e || (e = window.event);
    return element = e.target || e.srcElement;
  };
  chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
    var path, q_results, result, results, _ref;
    if (!(request.act != null)) {
      sendResponse({});
    }
    if (request.act === 'test') {
      console.log("[ Results of " + request.path + " ===>");
      console.log(psychoxpath.evaluateXPath(request.path));
      console.log("<=== ]");
      sendResponse({});
      return;
    }
    if (request.act === 'autocomplete') {
      if (request != null ? request.text : void 0) {
        q_results = psychoxpath.evaluateXPath(request.text);
        if ((q_results != null ? q_results.length : void 0) > 0) {
          results = (function() {
            var _i, _len, _ref, _ref2, _results;
            _ref = q_results.slice(0, 16);
            _results = [];
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
              result = _ref[_i];
              path = psychoxpath.getXPath(result, [], (_ref2 = !request.attributes) != null ? _ref2 : false);
              path = psychoxpath.shortestXPath(path);
              path = path.join('');
              _results.push({
                content: path,
                description: path
              });
            }
            return _results;
          })();
        }
      } else {
        results = [];
      }
      sendResponse({
        results: results
      });
      return;
    }
    if (request.act === 'get') {
      results = psychoxpath.getXPath(element, [], (_ref = !request.attributes) != null ? _ref : false);
    }
    if ((results != null) && (request != null ? request.short : void 0)) {
      results = psychoxpath.shortestXPath(results);
    }
    if ((results != null) && (request != null ? request.echo : void 0)) {
      console.log(results.join(''));
    }
    return sendResponse({
      results: results
    });
  });
}).call(this);
