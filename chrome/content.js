var dwx_element = null;

document.body.onmousedown = function (e) {
    e = e || window.event;
    dwx_element = (e.target || e.srcElement);
}

function onRequest(request, sender, sendResponse) {
    var result = null;
    var attributes = request.attributes;

    if(request.act == 'absolute') {
        result = psychoxpath.get_abs_xpath(dwx_element, [], !attributes);
    } else if(request.act == 'shortest') {
        result = psychoxpath.get_abs_xpath(dwx_element, [], !attributes);
        result = psychoxpath.shortest_xpath(result);
    }

    sendResponse({
        result: result
    });
}

chrome.extension.onRequest.addListener(onRequest);
