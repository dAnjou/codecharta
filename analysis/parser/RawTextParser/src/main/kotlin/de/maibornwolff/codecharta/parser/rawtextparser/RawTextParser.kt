package de.maibornwolff.codecharta.parser.rawtextparser

import de.maibornwolff.codecharta.parser.rawtextparser.model.FileMetrics
import de.maibornwolff.codecharta.parser.rawtextparser.model.toInt
import de.maibornwolff.codecharta.serialization.ProjectDeserializer
import de.maibornwolff.codecharta.serialization.ProjectSerializer
import de.maibornwolff.codecharta.tools.interactiveparser.InteractiveParser
import de.maibornwolff.codecharta.tools.interactiveparser.ParserDialogInterface
import de.maibornwolff.codecharta.tools.interactiveparser.util.InteractiveParserHelper
import picocli.CommandLine
import java.io.File
import java.io.IOException
import java.io.InputStream
import java.io.PrintStream
import java.io.PrintWriter
import java.nio.file.Paths
import java.util.concurrent.Callable

@CommandLine.Command(
    name = InteractiveParserHelper.RawTextParserConstants.name,
    description = [InteractiveParserHelper.RawTextParserConstants.description],
    footer = [InteractiveParserHelper.GeneralConstants.GenericFooter]
)
class RawTextParser(
    private val input: InputStream = System.`in`,
    private val output: PrintStream = System.out,
    private val error: PrintStream = System.err,
) : Callable<Void>, InteractiveParser {

    private val DEFAULT_EXCLUDES = arrayOf("/out/", "/build/", "/target/", "/dist/", "/resources/", "/\\..*")

    @CommandLine.Option(names = ["-h", "--help"], usageHelp = true, description = ["displays this help and exits"])
    private var help = false

    @CommandLine.Option(names = ["-v", "--verbose"], description = ["verbose mode"])
    private var verbose = false

    @CommandLine.Parameters(arity = "1", paramLabel = "FILE or FOLDER", description = ["file/project to parse"])
    private var inputFile: File = File("")

    @CommandLine.Option(
        arity = "0..",
        names = ["-m", "--metrics"],
        description = ["metrics to be computed (select all if not specified)"]
    )
    private var metrics: List<String> = listOf()

    @CommandLine.Option(names = ["-o", "--output-file"], description = ["output File (or empty for stdout)"])
    private var outputFile: String? = null

    @CommandLine.Option(names = ["-nc", "--not-compressed"], description = ["save uncompressed output File"])
    private var compress = true

    @CommandLine.Option(names = ["--tab-width"], description = ["tab width used (estimated if not provided)"])
    private var tabWidth: Int? = null

    @CommandLine.Option(names = ["--max-indentation-level"], description = ["maximum Indentation Level (default 10)"])
    private var maxIndentLvl: Int? = null

    @CommandLine.Option(names = ["-e", "--exclude"], description = ["exclude file/folder according to regex pattern"])
    private var exclude: Array<String> = arrayOf()

    @CommandLine.Option(
        names = ["-f", "--file-extensions"],
        description = ["parse only files with specified extensions (defualt: any)"]
    )
    private var fileExtensions: Array<String> = arrayOf()

    @CommandLine.Option(
        names = ["--without-default-excludes"],
        description = ["include build, target, dist, resources and out folders as well as files/folders starting with '.' "]
    )
    private var withoutDefaultExcludes = false

    @Throws(IOException::class)
    override fun call(): Void? {
        print(" ")
        if (!inputFile.exists()) {
            fileNotExistentMessage()
            return null
        }

        if (!withoutDefaultExcludes) exclude += DEFAULT_EXCLUDES

        val parameterMap = assembleParameterMap()
        val results: Map<String, FileMetrics> =
            MetricCollector(inputFile, exclude, fileExtensions, parameterMap, metrics).parse()

        val pipedProject = ProjectDeserializer.deserializeProject(input)
        val project = ProjectGenerator().generate(results, pipedProject)

        ProjectSerializer.serializeToFileOrStream(project, outputFile, output, compress)

        return null
    }

    private fun fileNotExistentMessage() {
        val path = Paths.get("").toAbsolutePath().toString()
        error.println("Current working directory = $path")
        error.println("Could not find $inputFile")
    }

    private fun assembleParameterMap(): Map<String, Int> {
        return mapOf(
            "verbose" to verbose.toInt(),
            "maxIndentationLevel" to maxIndentLvl,
            "tabWidth" to tabWidth
        ).filterValues { it != null }.mapValues { it.value as Int }
    }

    companion object {
        @JvmStatic
        fun mainWithInOut(outputStream: PrintStream, input: InputStream, error: PrintStream, args: Array<String>) {
            CommandLine(RawTextParser(input, outputStream, error)).setOut(PrintWriter(outputStream)).execute(*args)
        }
    }

    override fun getDialog(): ParserDialogInterface = ParserDialog
    override fun isApplicable(resourceToBeParsed: String): Boolean {
        println("Checking if RawTextParser is applicable...")

        if (resourceToBeParsed == "") {
            return false
        }

        val searchFile = File(resourceToBeParsed.trim())
        if (searchFile.isFile) {
            return true
        }

        if (!searchFile.isDirectory) {
            return false
        }

        val fileSearch = searchFile.walk()
        return fileSearch.asSequence()
                .filter { it.isFile }
                .any()
    }

    override fun getName(): String {
        return InteractiveParserHelper.RawTextParserConstants.name
    }
}
