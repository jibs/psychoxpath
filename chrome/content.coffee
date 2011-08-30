###
# (c) 2011 Tyler Kennedy <tk@tkte.ch>
# 
# Processes a request for XPaths within a tabs context.
###
dwx_element = null

###
# Event delegation to get the element being selected by
# the contexual menu. Required until the experimental context
# menu additions are stable.
###
document.body.onmousedown = (e) ->
    e or= window.event
    dwx_element = (e.target or e.srcElement)

chrome.extension.onRequest.addListener (request, sender, sendResponse) ->
    if not dwx_element?
        sendResponse {result: null}
        return

    result = null
    request.short ?= off
    request.attributes ?= on

    switch request.act
        when 'absolute'
            result = psychoxpath.get_abs_xpath dwx_element,
                [], !request.attributes
        when 'table'
            result = psychoxpath.get_abs_xpath dwx_element,
                [], !request.attributes
            result = psychoxpath.last_of_type result, 'table'

    if result and request.short
        result = psychoxpath.shortest_xpath result

    sendResponse {
        result: result
        wasShortened: request.short
    }
    return
