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
  var result, _ref, _ref2;
  if (!(dwx_element != null)) {
    sendResponse({
      result: null
    });
    return;
  }
  result = null;
  if ((_ref = request.short) == null) {
    request.short = false;
  }
  if ((_ref2 = request.attributes) == null) {
    request.attributes = true;
  }
  switch (request.act) {
    case 'absolute':
      result = psychoxpath.get_abs_xpath(dwx_element, [], !request.attributes);
      break;
    case 'table':
      result = psychoxpath.get_abs_xpath(dwx_element, [], !request.attributes);
      result = psychoxpath.last_of_type(result, 'table');
      break;
    case 'test':
      console.log("Results of " + request.path + " -->");
      console.log(psychoxpath.evaluate_xpath(request.path));
      console.log('<--');
  }
  if (result && request.short) {
    result = psychoxpath.shortest_xpath(result);
  }
  if (result && request.echo) {
    console.log(result);
  }
  sendResponse({
    result: result,
    wasShortened: request.short
  });
});