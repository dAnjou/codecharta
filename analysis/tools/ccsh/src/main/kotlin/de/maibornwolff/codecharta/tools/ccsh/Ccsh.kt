package de.maibornwolff.codecharta.tools.ccsh

import com.github.kinquirer.KInquirer
import com.github.kinquirer.components.promptConfirm
import de.maibornwolff.codecharta.exporter.csv.CSVExporter
import de.maibornwolff.codecharta.filter.edgefilter.EdgeFilter
import de.maibornwolff.codecharta.filter.mergefilter.MergeFilter
import de.maibornwolff.codecharta.filter.structuremodifier.StructureModifier
import de.maibornwolff.codecharta.importer.codemaat.CodeMaatImporter
import de.maibornwolff.codecharta.importer.csv.CSVImporter
import de.maibornwolff.codecharta.importer.gitlogparser.GitLogParser
import de.maibornwolff.codecharta.importer.metricgardenerimporter.MetricGardenerImporter
import de.maibornwolff.codecharta.importer.sonar.SonarImporterMain
import de.maibornwolff.codecharta.importer.sourcecodeparser.SourceCodeParserMain
import de.maibornwolff.codecharta.importer.sourcemonitor.SourceMonitorImporter
import de.maibornwolff.codecharta.importer.svnlogparser.SVNLogParser
import de.maibornwolff.codecharta.importer.tokeiimporter.TokeiImporter
import de.maibornwolff.codecharta.parser.rawtextparser.RawTextParser
import de.maibornwolff.codecharta.tools.ccsh.parser.InteractiveParserSuggestionDialog
import de.maibornwolff.codecharta.tools.ccsh.parser.ParserService
import de.maibornwolff.codecharta.tools.ccsh.parser.repository.PicocliParserRepository
import de.maibornwolff.codecharta.tools.validation.ValidationTool
import mu.KotlinLogging
import picocli.CommandLine
import java.util.concurrent.Callable
import java.util.concurrent.Executors
import java.util.concurrent.TimeUnit
import java.util.concurrent.atomic.AtomicInteger
import kotlin.math.min
import kotlin.system.exitProcess

@CommandLine.Command(
    name = "ccsh",
    description = ["Command Line Interface for CodeCharta analysis"],
    subcommands = [
        ValidationTool::class,
        MergeFilter::class,
        EdgeFilter::class,
        StructureModifier::class,
        CSVImporter::class,
        SonarImporterMain::class,
        SourceMonitorImporter::class,
        SVNLogParser::class,
        GitLogParser::class,
        Installer::class,
        CSVExporter::class,
        SourceCodeParserMain::class,
        CodeMaatImporter::class,
        TokeiImporter::class,
        RawTextParser::class,
        MetricGardenerImporter::class
    ],
    versionProvider = Ccsh.ManifestVersionProvider::class,
    footer = ["Copyright(c) 2022, MaibornWolff GmbH"]
)

class Ccsh : Callable<Void?> {

    @CommandLine.Option(
        names = ["-v", "--version"],
        versionHelp = true,
        description = ["prints version info and exits"]
    )
    var versionRequested: Boolean = false

    @CommandLine.Option(names = ["-h", "--help"], usageHelp = true, description = ["displays this help and exit"])
    var help: Boolean = false

    @CommandLine.Option(names = ["-i", "--interactive"], description = ["starts interactive parser"])
    var shouldUseInteractiveShell: Boolean = false

    override fun call(): Void? {
        // info: always run

        return null
    }

    companion object {
        private val logger = KotlinLogging.logger {}

        const val NO_USABLE_PARSER_FOUND_MESSAGE = "No usable parser was found for the input file path!"

        @JvmStatic
        fun main(args: Array<String>) {
            exitProcess(executeCommandLine(args))
        }

        fun executeCommandLine(args: Array<String>): Int {
            val commandLine = CommandLine(Ccsh())
            commandLine.executionStrategy = CommandLine.RunAll()
            return if (args.isEmpty()) {
                val configuredParsers = InteractiveParserSuggestionDialog.offerAndGetInteractiveParserSuggestionsAndConfigurations(commandLine)
                if (configuredParsers.isEmpty()) {
                    return 0
                }

                val shouldRunConfiguredParsers: Boolean =
                        KInquirer.promptConfirm(
                                message = "Do you want to run all configured parsers now?",
                                default = true)

                return if (shouldRunConfiguredParsers) {
                    executeConfiguredParsers(commandLine, configuredParsers)
                } else {
                    0
                }
            } else if (isParserUnknown(args, commandLine) || args.contains("--interactive") || args.contains("-i")) {
                executeInteractiveParser(commandLine)
            } else {
                commandLine.execute(*sanitizeArgs(args))
            }
        }

        fun executeConfiguredParsers(commandLine: CommandLine, configuredParsers: Map<String, List<String>>): Int {
            val exitCode = AtomicInteger(0)
            val numberOfThreadsToBeStarted = min(configuredParsers.size, Runtime.getRuntime().availableProcessors())
            val threadPool = Executors.newFixedThreadPool(numberOfThreadsToBeStarted)
            for (configuredParser in configuredParsers) {
                threadPool.execute {
                    val currentExitCode = executeConfiguredParser(commandLine, configuredParser)
                    if (currentExitCode != 0) {
                        exitCode.set(currentExitCode)
                        logger.info("Code: $currentExitCode")
                    }
                }
            }
            threadPool.shutdown()
            threadPool.awaitTermination(1, TimeUnit.DAYS)

            val finalExitCode = exitCode.get()
            logger.info("Code: $finalExitCode")
            if (finalExitCode != 0) {
                return finalExitCode
            }
            // Improvement: Try to extract merge commands before so user does not have to configure merge args?
            logger.info("Each parser was successfully executed and created a cc.json file. " +
                        "You can merge all results by making sure they are in one folder and executing the merging tool.")
            return 0
        }

        private fun executeConfiguredParser(commandLine: CommandLine, configuredParser: Map.Entry<String, List<String>>): Int {
            logger.info { "Executing ${configuredParser.key}" }
            val exitCode = ParserService.executePreconfiguredParser(commandLine, Pair(configuredParser.key, configuredParser.value))

            if (exitCode != 0) {
                logger.info("Error executing ${configuredParser.key}, code $exitCode")
            }

            return exitCode
        }

        private fun executeInteractiveParser(commandLine: CommandLine): Int {
            val selectedParser = ParserService.selectParser(commandLine, PicocliParserRepository())
            logger.info { "Executing $selectedParser" }
            return ParserService.executeSelectedParser(commandLine, selectedParser)
        }

        private fun isParserUnknown(args: Array<String>, commandLine: CommandLine): Boolean {
            if (args.isNotEmpty()) {
                val firstArg = args.first()
                val parserList = commandLine.subcommands.keys
                val optionsList = commandLine.commandSpec.options().map { it.names().toMutableList() }.flatten()
                return !parserList.contains(firstArg) && !optionsList.contains(firstArg)
            }
            return false
        }

        private fun sanitizeArgs(args: Array<String>): Array<String> {
            return args.map { argument ->
                var sanitizedArg = ""
                if (argument.length > 1 && argument.substring(0, 2) == ("--")) {
                    var skip = false
                    argument.forEach {
                        if (it == '=') skip = true
                        if (it.isUpperCase() && !skip) sanitizedArg += "-" + it.lowercaseChar()
                        else sanitizedArg += it
                    }
                } else {
                    sanitizedArg = argument
                }
                return@map sanitizedArg
            }.toTypedArray()
        }
    }

    object ManifestVersionProvider : CommandLine.IVersionProvider {
        override fun getVersion(): Array<String> {
            return arrayOf(
                Ccsh::class.java.`package`.implementationTitle + "\n" +
                    "version \"" + Ccsh::class.java.`package`.implementationVersion + "\"\n" +
                    "Copyright(c) 2022, MaibornWolff GmbH"
            )
        }
    }
}

@CommandLine.Command(name = "install", description = ["[deprecated]: does nothing"])
class Installer : Callable<Void?> {

    override fun call(): Void? {
        println("[deprecated]: does nothing")
        return null
    }
}
