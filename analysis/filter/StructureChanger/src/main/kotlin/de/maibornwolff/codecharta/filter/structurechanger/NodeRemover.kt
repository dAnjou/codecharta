package de.maibornwolff.codecharta.filter.structurechanger

import de.maibornwolff.codecharta.model.*

class NodeRemover(private val project: Project) {

    fun remove(paths: Array<String>, projectName: String = project.projectName): Project {
        val pathSegments = paths.map { it.removePrefix("/").split("/") }
        return ProjectBuilder(
                projectName,
                removeNodes(pathSegments),
                removeEdges(paths),
                copyAttributeTypes(),
                removeBlacklistItems(paths)
        ).build()
    }

    private fun filterNodes(path: List<String>, node: MutableNode): MutableNode {
        println(node.name + " is " + path.firstOrNull() + " " + (path.firstOrNull() == node.name))
        println(node.children.filter { it.name != path.firstOrNull() })
        node.children = node.children.filter { it.name != path.firstOrNull() }.map {
            println(it.name)
            filterNodes(path.drop(1), it)
        }.toMutableList()
        return node
    }

    private fun removeNodes(paths: List<List<String>>): MutableList<MutableNode> {
        var root = project.rootNode.toMutableNode()
        paths.forEach { root = filterNodes(it, root) }
        return mutableListOf(root)
    }

    private fun removeEdges(removePatterns: Array<String>): MutableList<Edge> {
        var edges = project.edges
        removePatterns.forEach { path -> edges = edges.filter { !it.fromNodeName.contains(path) && !it.toNodeName.contains(path) } }
        return edges.toMutableList()
    }

    private fun copyAttributeTypes(): MutableMap<String, MutableList<Map<String, AttributeType>>> {
        val mergedAttributeTypes: MutableMap<String, MutableList<Map<String, AttributeType>>> = mutableMapOf()
        project.attributeTypes.forEach {
            mergedAttributeTypes[it.key] = it.value.toMutableList()
        }
        return mergedAttributeTypes.toMutableMap()
    }

    private fun removeBlacklistItems(paths: Array<String>): MutableList<BlacklistItem> {
        var blacklist = project.blacklist
        paths.forEach { path -> blacklist = blacklist.filter { !it.path.contains(path) } }
        return blacklist.toMutableList()
    }

}