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
                    path = psychoxpath.getXPath result, [], !request.attributes ? false
                    path = psychoxpath.shortestXPath path
                    path = path.join('')
                    { content: path, description: path }

        sendResponse {
            results: results ? []
        }
        return
    # Visually highlight all matching elements.
    else if request.act == 'highlight'
        # Erase all existing highlights
        q_results = psychoxpath.evaluateXPath "//*[contains(@class, 'psychoxpath_highlight')]"
        if q_results?.length > 0
            for result in q_results
                result.className = result.className.replace(
                    /\bpsychoxpath_highlight\b/
                    ''
                )
        
        # Highlight the new matches
        if request?.path
            q_results = psychoxpath.evaluateXPath request.path
            if q_results?.length > 0
                for result in q_results
                    result.className = result.className + " psychoxpath_highlight"
        sendResponse {}
        return

    # Get the XPath for the currently selected element
    if request.act == 'get'
        results = psychoxpath.getXPath element, [], !request.attributes ? false

    # Optionally attempt to shorten the resulting XPath
    if results? and request?.short
        results = psychoxpath.shortestXPath results

    # Optionally dump the XPath to the console
    if results? and request?.echo
        console.log results.join('')

    sendResponse {
        results: results
    }
