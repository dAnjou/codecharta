package de.maibornwolff.codecharta.filter.mergefilter

import de.maibornwolff.codecharta.model.Node

class RecursiveNodeMergerStrategy(override val mergeConditionSatisfied: (Node, Node) -> Boolean) : NodeMergerStrategy {
    private val flatNodeMerger = FlatNodeMerger()

    override fun mergeNodeLists(lists: List<List<Node>>?): List<Node> {
        return lists!!.fold(listOf(), { nodes, actual -> reduceNodeList(nodes, actual) })
    }

    private fun reduceNodeList(total: List<Node>, actual: List<Node>): List<Node> {
        return actual.fold(total, {
            t: List<Node>, a: Node ->
            t.map { if (mergeConditionSatisfied(it, a)) merge(it, a) else listOf(it) }
            when {
                t.filter { mergeConditionSatisfied(it, a) }.count() > 0 -> t.map { if (mergeConditionSatisfied(it, a)) merge(it, a) else it }
                else -> t + a
            }
        })
    }

    private fun merge(vararg nodes: Node): Node {
        return flatNodeMerger.merge(this, *nodes)
    }
}
