package de.maibornwolff.codecharta.importer.codemaat

import de.maibornwolff.codecharta.model.AttributeType
import de.maibornwolff.codecharta.model.AttributeTypes
import de.maibornwolff.codecharta.serialization.ProjectSerializer
import de.maibornwolff.codecharta.tools.interactiveparser.InteractiveParser
import de.maibornwolff.codecharta.tools.interactiveparser.ParserDialogInterface
import de.maibornwolff.codecharta.tools.interactiveparser.util.CodeChartaConstants
import de.maibornwolff.codecharta.translator.MetricNameTranslator
import de.maibornwolff.codecharta.util.InputHelper
import picocli.CommandLine
import java.io.File
import java.io.IOException
import java.io.InputStream
import java.io.PrintStream
import java.util.concurrent.Callable

@CommandLine.Command(
        name = CodeMaatImporter.NAME,
        description = [CodeMaatImporter.DESCRIPTION],
        footer = [CodeChartaConstants.General.GENERIC_FOOTER]
)
class CodeMaatImporter(
        private val output: PrintStream = System.out) : Callable<Void>, InteractiveParser {

    @CommandLine.Option(names = ["-h", "--help"], usageHelp = true, description = ["displays this help and exits"])
    private var help = false

    @CommandLine.Option(names = ["-o", "--output-file"], description = ["output File"])
    private var outputFile: String? = null

    @CommandLine.Option(names = ["-nc", "--not-compressed"], description = ["save uncompressed output File"])
    private var compress = true

    @CommandLine.Parameters(arity = "1..*", paramLabel = "FILE", description = ["codemaat coupling csv files"])
    private var files: List<File> = mutableListOf()

    private val pathSeparator = '/'

    private val csvDelimiter = ','

    override val name = NAME
    override val description = DESCRIPTION

    companion object {
        const val NAME = "codemaatimport"
        const val DESCRIPTION = "generates cc.json from codemaat coupling csv"

        @JvmStatic
        fun main(args: Array<String>) {
            CommandLine(CodeMaatImporter()).execute(*args)
        }
    }

    @Throws(IOException::class)
    override fun call(): Void? {
        if (!InputHelper.isInputValid(files.toTypedArray(), canInputContainFolders = false)) {
            throw IllegalArgumentException("Input invalid file for CodeMaatImporter, stopping execution...")
        }

        val csvProjectBuilder =
                CSVProjectBuilder(pathSeparator, csvDelimiter, codemaatReplacement, attributeTypes, getAttributeDescriptors())
        files.map { it.inputStream() }.forEach<InputStream> { csvProjectBuilder.parseCSVStream(it) }
        val project = csvProjectBuilder.build()

        ProjectSerializer.serializeToFileOrStream(project, outputFile, output, compress)

        return null
    }

    private val codemaatReplacement: MetricNameTranslator
        get() {
            val prefix = ""
            val replacementMap = mutableMapOf<String, String>()
            replacementMap["entity"] = "fromNodename"
            replacementMap["coupled"] = "toNodeName"
            replacementMap["degree"] = "pairingRate"
            replacementMap["average-revs"] = "avgCommits"

            return MetricNameTranslator(replacementMap.toMap(), prefix)
        }

    private val attributeTypes: AttributeTypes
        get() {
            val type = "edges"
            val attributeTypes = mutableMapOf<String, AttributeType>()
            attributeTypes["pairingRate"] = AttributeType.relative
            attributeTypes["avgCommits"] = AttributeType.absolute

            return AttributeTypes(attributeTypes.toMutableMap(), type)
        }

    override fun getDialog(): ParserDialogInterface = ParserDialog
    override fun isApplicable(resourceToBeParsed: String): Boolean {
        return false
    }
}
