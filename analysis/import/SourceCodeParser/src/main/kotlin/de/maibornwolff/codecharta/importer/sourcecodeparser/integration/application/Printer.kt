package de.maibornwolff.codecharta.importer.sourcecodeparser.integration.application

import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.metrics.FolderSummary
import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.metrics.MetricTable

interface Printer {

    fun printFile(rowMetrics: MetricTable)
    fun printFolder(folderMetrics: FolderSummary)

}