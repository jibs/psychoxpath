###
# (c) 2011 Tyler Kennedy <tkpsychoxpath.tkte.ch>
###
psychoxpath =
    ###
    # Returns a unique attribute selector for the given node,
    # if one exists.
    ###
    uniqueAttribute: (node, options) ->
        defaults = {
            # A list of attributes to test for uniqueness.
            includeTags: ['id', 'class', 'font', 'color']
            # A list of (lower case) classes to exclude for uniquness.
            excludeClasses: []
        }
        defaults[attr] = val for attr, val of options when val?

        for attribute in node.attributes
            continue if attribute.nodeName not in defaults.includeTags ? []

            nodeName = node.nodeName.toLowerCase()
            attrName = attribute.nodeName.toLowerCase()
            attrValue = attribute.nodeValue

            switch attrName
                # Do specific optimizations for classes to make them a bit more
                # likely to match.
                when 'class'
                    classes = attrValue.split ' '
                    for cl in classes when cl not in defaults.excludeClasses
                        q = "//#{ nodeName }[contains(concat(' ', @class, ' '), ' #{ cl } ')]"
                        if psychoxpath.evaluateXPath(q)?.length == 1
                            return "[contains(concat(' ', @class, ' '), ' #{ cl } ')]"
                # Resort to key==value if we don't have anything else
                else
                    q = "//#{ nodeName }[@#{ attrName }='#{ attrValue }']"
                    if psychoxpath.evaluateXPath(q)?.length == 1
                        return "[@#{ attrName }='#{ attrValue }']"

        return null

    ###
    # Get the absolute XPath for the given node.
    # If `position_only` is true, attributes will not be used
    # when building the path.
    ###
    getXPath: (node, options) ->
        defaults = {
            # Use attributes when creating uniques paths.
            useAttributes: on
            # A list of attributes to use for finding unique paths.
            includeTags: null
            # A list of classes to discard when finding unique paths. This is
            # for compatibility with DOM extensions that add classes.
            excludeClasses: null
            # Starting path as a list of XPath segments
            path: []
        }
        defaults[attr] = val for attr, val of options when val?

        if node.parentNode?
            psychoxpath.getXPath(node.parentNode, defaults)

        if node.nodeType != node.ELEMENT_NODE
            return defaults.path

        name = node.nodeName.toLowerCase()
        tmp = ["/#{ name }",]

        if defaults.useAttributes
            # If possible, try to find a unique attribute for the given
            # node.
            q = psychoxpath.uniqueAttribute(node, {
                includeTags: defaults.includeTags
                excludeClasses: defaults.excludeClasses
            })
            if q?
                tmp.push q
                defaults.path.push tmp.join('')
                return defaults.path

        # If we have any peers, *always* use an absolute position
        for peer in (node.parentNode?.childNodes ? [])
            if node isnt peer and psychoxpath._sameType node, peer
                tmp.push "[#{ psychoxpath._getPosition(node) }]"
                break

        defaults.path.push tmp.join('')
        return defaults.path

    ###
    # Extremely silly way of getting a short(er) path.
    ###
    shortestXPath: (path) ->
        root = []

        for x in [path.length - 1..0] by -1
            sub = "//#{ psychoxpath._noPrefix(path[x]) }"
            root.unshift(sub)
            q = psychoxpath.evaluateXPath(root.join(''))
            break if not q? or q?.length == 1

        return root

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
            if q.snapshotLength > 0
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
            break if not sibling?
            if psychoxpath._sameType sibling, node
                count++
            sibling = sibling.previousSibling
        return count

    # Helper method; Returns `true` if XPath subset is relative.
    _relative: (sub) -> sub.indexOf '//' == 0

    # Helper method; Returns `true` if XPath subset is absolute.
    _absolute: (sub) -> sub.indexOf('/') == 0

    # Helper method; Removes prefix and returns modified string.
    _noPrefix: (sub) ->
        if psychoxpath._absolute sub
            sub.substring 1 
        else if psychoxpath._relative sub
            sub.substring 2
        else
            sub


# Expose ourselves to the world
(exports ? this).psychoxpath = psychoxpath
