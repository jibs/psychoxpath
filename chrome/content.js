/*
# (c) 2011 Tyler Kennedy <tk@tkte.ch>
# 
# Processes a request for XPaths within a tabs context.
*/
var dwx_element;
dwx_element = null;
/*
# Event delegation to get the element being selected by
# the contexual menu. Required until the experimental context
# menu additions are stable.
*/
document.body.onmousedown = function(e) {
  e || (e = window.event);
  return dwx_element = e.target || e.srcElement;
};
chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
  var result, results, tmp_result, tmp_results, xpath, _ref, _ref2;
  result = null;
  if ((_ref = request.short) == null) {
    request.short = false;
  }
  if ((_ref2 = request.attributes) == null) {
    request.attributes = true;
  }
  switch (request.act) {
    case 'autocomplete':
      results = null;
      tmp_results = psychoxpath.evaluate_xpath(request.text);
      if (tmp_results != null) {
        results = (function() {
          var _i, _len, _results;
          _results = [];
          for (_i = 0, _len = tmp_results.length; _i < _len; _i++) {
            tmp_result = tmp_results[_i];
            if (tmp_result != null) {
              xpath = psychoxpath.get_abs_xpath(tmp_result, [], true);
              _results.push({
                'content': xpath.join('/'),
                'description': xpath.join('/')
              });
            }
          }
          return _results;
        })();
      }
      sendResponse({
        result: results
      });
      return;
    case 'test':
      console.log("Results of " + request.path + " -->");
      console.log(psychoxpath.evaluate_xpath(request.path));
      console.log('<--');
      sendResponse({
        result: null
      });
      return;
  }
  if (!(dwx_element != null)) {
    sendResponse({
      result: null
    });
    return;
  }
  switch (request.act) {
    case 'absolute':
      result = psychoxpath.get_abs_xpath(dwx_element, [], !request.attributes);
      break;
    case 'table':
      result = psychoxpath.get_abs_xpath(dwx_element, [], !request.attributes);
      result = psychoxpath.last_of_type(result, 'table');
  }
  if (request.short) {
    result = psychoxpath.shortest_xpath(result);
  }
  if (result && request.echo) {
    console.log(result);
  }
  return sendResponse({
    result: result,
    wasShortened: request.short
  });
});