###
# (c) 2011 Tyler Kennedy <tk@tkte.ch>
###
psychoxpath =
    ###
    # Returns a unique attribute selector for the given node,
    # if one exists.
    ###
    uniqueAttribute: (node, valid_tags) ->
        # Default attributes to use for unique XPaths
        valid_tags ?= ['id', 'class', 'font', 'color']
        for attribute in node.attributes
            continue if attribute.nodeName not in  valid_tags

            if @_uniqueAttribute node, attribute
                return [attribute.nodeName, attribute.nodeValue]
        return [null, null]

    ###
    # Get the absolute XPath for the given node.
    # If `position_only` is true, attributes will not be used
    # when building the path.
    ###
    getXPath: (node, path, position_only) ->
        path or= []
        position_only or= false

        # Recursively resolve down to the root node.
        if node.parentNode?
            path = @getXPath(node.parentNode, path, position_only)
        if node.nodeType != node.ELEMENT_NODE
            return path

        name = node.nodeName.toLowerCase()
        tmp = [name,]

        if not position_only
            # If possible, try to find a unique attribute for the given
            # node.
            [a_name, a_value] = @uniqueAttribute node
            if a_name? or a_value?
                tmp.push "[@#{ a_name }='#{ a_value }']"
                path.push tmp.join('')
                return path

        # No other siblings? Sweet...
        if @_sameType node.previousSibling, node.nextSibling
            tmp.push "[#{ @_getPosition(node) }]"

        path.push tmp.join('')
        return path

    ###
    # Returns the path up to the last occurance of `type`.
    ###
    lastOfType: (path, type) ->
        for part in [path.length - 1..0] by -1
            tmp = path[part].toLowerCase()
            idx = tmp.indexOf('[')
            tmp = tmp.substring(0, idx) if idx != -1

            return path[0..part] if tmp.indexOf(type.toLowerCase()) == 0
        return path

    ###
    # Extremely silly way of getting the shortest path, again by brute
    # forcing it.
    ###
    shortestXPath: (path) ->
        shortest = []
        for part in [path.length - 1..0] by -1
            q = @evaluateXPath("//#{ path[part] }")
            shortest.push path[part]
            break if q.length == 1
        shortest.reverse()
        return shortest

    ###
    # Evaluate an XPath, returning a list of results.
    # Results are ordered as they appear in the DOM.
    ###
    evaluateXPath: (path, context) ->
        context or= document

        # Use Webkit or Firefox's built-in ability to parse XPaths.
        if document.evaluate
            try
                q = document.evaluate(path, context, null, 
                    XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null)
            catch error
                return null

            # Iterators don't actually work in Webkit. Indexing works
            # on all supported browsers.
            return (q.snapshotItem(x) for x in [0..q.snapshotLength - 1])

        # We aren't going to support IE for the moment...
        return null

    # Helper method; returns `true` if both nodes are of the same 'type'.
    _sameType: (left, right) ->
        if left?.nodeType == right?.nodeType
            if left?.nodeName == right?.nodeName
                return true
        return false

    # Helper method; Get the 1-based index of the node relative to its
    # parent and siblings of the same type.
    _getPosition: (node) ->
        count = 1
        sibling = node.previousSibling
        loop
            if @_sameType sibling, node
                count++
            sibling = sibling.previousSibling
            break if not sibling?
        return count

    # Helper method; Returns true if the given node and attribute are
    # unique in the document.
    _uniqueAttribute: (node, att) ->
        name = node.nodeName.toLowerCase()
        q = "//#{ name }[@#{ att.nodeName }='#{ att.nodeValue }']"
        @evaluateXPath(q).length == 1

# Expose ourselves to the world
(exports ? this).psychoxpath = psychoxpath
