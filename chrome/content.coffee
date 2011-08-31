###
# (c) 2011 Tyler Kennedy <tk@tkte.ch>
###
dwx_element = null
p = psychoxpath

###
# Event delegation to get the element being selected by
# the contexual menu. Required until the experimental context
# menu additions are stable.
###
document.body.onmousedown = (e) ->
    e or= window.event
    dwx_element = (e.target or e.srcElement)

chrome.extension.onRequest.addListener (request, sender, sendResponse) ->
    result = null
    request.short ?= off
    request.attributes ?= on

    switch request.act
        when 'autocomplete'
            results = null

            tmp_results = p.evaluateXPath request.text
            if tmp_results?
                results = for tmp_result in tmp_results when tmp_result?
                    xpath = p.getXPath tmp_result, [], off
                    {
                        'content': xpath.join('/')
                        'description': xpath.join('/')
                    }

            sendResponse { result: results }
            return
        when 'test'
            console.log "Results of #{ request.path } -->"
            console.log p.evaluateXPath(request.path)
            console.log '<--'

            sendResponse { result: null }
            return

    # The rest of these commands require an element as context
    if not dwx_element?
        sendResponse { result: null }
        return

    switch request.act
        when 'absolute'
            result = p.getXPath dwx_element,
                [], !request.attributes
        when 'table'
            result = p.getXPath dwx_element,
                [], !request.attributes
            result = p.lastOfType result, 'table'

    result = p.shortestXPath result if request.short
    # We do this here so the output is logged to the correct window
    # without having to do a lookup.
    if result and request.echo
        console.log result

    sendResponse {
        result: result
        wasShortened: request.short
    }
