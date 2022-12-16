package de.maibornwolff.codecharta.importer.sourcecodeparser

import picocli.CommandLine
import java.util.Locale

enum class OutputFormat {
    JSON, TABLE
}

class OutputTypeConverter : CommandLine.ITypeConverter<OutputFormat> {
    override fun convert(value: String?): OutputFormat = when {
        OutputFormat.TABLE.name.equals(value, ignoreCase = true) -> OutputFormat.TABLE
        OutputFormat.JSON.name.equals(value, ignoreCase = true) -> OutputFormat.JSON
        else -> {
            System.err.println("Using default ${OutputFormat.JSON.name.lowercase(Locale.getDefault())}"); OutputFormat.JSON
        }
    }
}
