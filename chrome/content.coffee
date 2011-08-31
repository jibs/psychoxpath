###
# (c) 2011 Tyler Kennedy <tk@tkte.ch>
###

# Last selected element
element = null

###
# Event delegation to get the element being selected by
# the contexual menu. Required until the experimental context
# menu additions are stable.
###
document.body.onmousedown = (e) ->
    e or= window.event
    element = (e.target or e.srcElement)

chrome.extension.onRequest.addListener (request, sender, sendResponse) ->
    if not request.act?
        # Should never really happen...
        sendResponse {}

    # Perform an XPath query on this context and dump it to
    # the console.
    if request.act == 'test'
        console.log "[ Results of #{ request.path } ===>"
        console.log psychoxpath.evaluateXPath request.path
        console.log "<=== ]"

        sendResponse({})
        return
    # Return a list of the first 15 items in the DOM that
    # match an XPath.
    else if request.act == 'autocomplete'
        if request?.text
            q_results = psychoxpath.evaluateXPath request.text
            if q_results?.length > 0
                results = for result in q_results[..15]
                    path = psychoxpath.getXPath(result, {
                        useAttributes: request.attributes ? on
                    })
                    
                    #result, [], !request.attributes ? false
                    path = psychoxpath.shortestXPath path
                    path = path.join('')
                    { content: path, description: path }

        sendResponse {
            results: results ? []
        }
        return
    # Visually highlight elements matching a given XPath.
    else if request.act == 'highlight'
        # Erase any existing highlights
        q_results = psychoxpath.evaluateXPath "//*[contains(@class, 'psychoxpath_highlight')]"
        if q_results?.length
            x.className = x.className.replace /(\W|\b)psychoxpath_highlight\b/, '' for x in q_results
        
        # Highlight the new matches
        if request?.path
            q_results = psychoxpath.evaluateXPath request.path
            if q_results?.length
                x.className += " psychoxpath_highlight" for x in q_results

        sendResponse {}
        return

    # Get the XPath for the currently selected element
    if request.act == 'get'
        results = psychoxpath.getXPath(element, {
            useAttributes: request.attributes ? on
        })

    # Optionally attempt to shorten the resulting XPath
    if results? and request?.short
        results = psychoxpath.shortestXPath results

    # Optionally dump the XPath to the current tabs console
    if results? and request?.echo
        console.log results.join('')

    sendResponse {
        results: results
    }
