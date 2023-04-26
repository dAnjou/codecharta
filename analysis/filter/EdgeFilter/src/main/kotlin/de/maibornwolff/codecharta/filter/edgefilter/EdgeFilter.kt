package de.maibornwolff.codecharta.filter.edgefilter

import de.maibornwolff.codecharta.serialization.ProjectDeserializer
import de.maibornwolff.codecharta.serialization.ProjectSerializer
import de.maibornwolff.codecharta.tools.interactiveparser.InteractiveParser
import de.maibornwolff.codecharta.tools.interactiveparser.ParserDialogInterface
import de.maibornwolff.codecharta.tools.interactiveparser.util.InteractiveParserHelper
import picocli.CommandLine
import java.io.File
import java.io.PrintStream
import java.util.concurrent.Callable

@CommandLine.Command(
    name = InteractiveParserHelper.EdgeFilterConstants.name,
    description = [InteractiveParserHelper.EdgeFilterConstants.description],
    footer = [InteractiveParserHelper.GeneralConstants.GenericFooter]
)
class EdgeFilter(
    private val output: PrintStream = System.out
) : Callable<Void?>, InteractiveParser {

    @CommandLine.Option(names = ["-h", "--help"], usageHelp = true, description = ["displays this help and exits"])
    var help: Boolean = false

    @CommandLine.Parameters(arity = "1..*", paramLabel = "FILE", description = ["files to filter"])
    private var source: String = ""

    @CommandLine.Option(names = ["--path-separator"], description = ["path separator (default = '/')"])
    private var pathSeparator = '/'

    @CommandLine.Option(names = ["-o", "--output-file"], description = ["output File (or empty for stdout)"])
    private var outputFile: String? = null

    override fun call(): Void? {
        val srcProject = ProjectDeserializer.deserializeProject(File(source).inputStream())

        val newProject = EdgeProjectBuilder(srcProject, pathSeparator).merge()

        ProjectSerializer.serializeToFileOrStream(newProject, outputFile, output, false)

        return null
    }

    companion object {
        @JvmStatic
        fun main(args: Array<String>) {
            CommandLine(EdgeFilter()).execute(*args)
        }
    }

    override fun getDialog(): ParserDialogInterface = ParserDialog
    override fun isApplicable(resourceToBeParsed: String): Boolean {
        return false
    }

    override fun getName(): String {
        return InteractiveParserHelper.EdgeFilterConstants.name
    }
}
