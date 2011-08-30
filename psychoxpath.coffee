###
# A jQuery-based bookmarklet to extract XPaths for a given node.
# (c) 2011 Tyler Kennedy <tk@tkte.ch>
###
jQuery ($) ->
    # State of the shift key
    shiftkey = off
    # Last printed XPath
    last_xpath = null

    ###
    # Get the 1-based index of the node to its parent.
    ###
    node_position = (node) ->
        count = 1
        sibling = node.previousSibling
        loop
            if sibling.nodeType == node.ELEMENT_NODE
                if sibling.nodeName == node.nodeName
                    count++
            sibling = sibling.previousSibling
            break if not sibling?
        return count

    ###
    # Returns true if the given node and attribute are
    # unique in the document.
    ###
    node_unique_attribute = (node, att) ->
        name = node.nodeName.toLowerCase()
        q = "//#{ name }[@#{ att.nodeName }='#{ att.nodeValue }']"
        evaluate_xpath(q).length == 1

    ###
    # Returns a unique attribute selector for the given node,
    # if one exists.
    ###
    node_unique = (node) ->
        for attribute in node.attributes
            tag = attribute.nodeName
            continue if tag not in [
                'id', 'class'
            ]

            if node_unique_attribute node, attribute
                return [attribute.nodeName, attribute.nodeValue]

        return [null, null]

    ###
    # Get the absolute XPath for the given node.
    # If `position_only` is true, attributes will not be used
    # when building the path.
    ###
    get_abs_xpath = (node, path, position_only) ->
        path or= []
        position_only or= false

        # Recursively resolve down to the root node.
        if node.parentNode?
            txm = get_abs_xpath(node.parentNode, path)

        tmp = []
        # We only want element nodes in our path
        if node.nodeType != node.ELEMENT_NODE
            return path

        name = node.nodeName.toLowerCase()
        tmp.push name

        if not position_only
            # If possible, try to find a unique attribute for the given
            # node.
            [a_name, a_value] = node_unique node
            if a_name? or a_value?
                tmp.push "[@#{ a_name }='#{ a_value }']"
                path.push tmp.join('')
                return path

        # No other siblings? Sweet...
        if not node.previousSibling
            return path + [name]

        # If nothing else, fall back to the node position
        position = node_position(node)
        if position > 1
            tmp.push "[#{ position }]"

        path.push tmp.join('')
        return path

    ###
    # Extremely silly way of getting the shortest path, again by brute
    # forcing it.
    ###
    shortest_xpath = (path) ->
        shortest = []
        for part in [path.length - 1..0] by -1
            q = evaluate_xpath("//#{ path[part] }")
            shortest.push path[part]
            break if q.length == 1
        shortest.reverse()

    ###
    # Evaluate a basic (attribute and index only) XPath.
    ###
    evaluate_xpath = (path) ->
        nodes = []
        # See if we can use Webkit or Firefox's built-in
        # ability to parse XPaths.
        if document.evaluate
            q = document.evaluate(
                path
                document
                null
                XPathResult.ORDERED_NODE_SNAPSHOT_TYPE
                null
            )
            # Iterators don't actually work in Webkit, so a bit of a
            # roundabout...
            for x in [0..q.snapshotLength - 1]
                nodes.push q.snapshotItem(x)

            return nodes
        return null

    on_element_event = (event) ->
        if shiftkey is off
            return true

        path = get_abs_xpath(this)
        if last_xpath == path
            return false

        last_xpath = path
        console.log "/#{ path.join('/') }"
        console.log "//#{ shortest_xpath(path).join('/') }"

        return false
    
    $(document).bind 'keyup keydown', (event) ->
        shiftkey = event.shiftKey
        return true

    $('*').bind 'click', on_element_event
