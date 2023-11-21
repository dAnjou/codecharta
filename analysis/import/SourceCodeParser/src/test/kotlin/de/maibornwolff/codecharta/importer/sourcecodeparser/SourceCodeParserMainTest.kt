package de.maibornwolff.codecharta.importer.sourcecodeparser

import de.maibornwolff.codecharta.util.InputHelper
import io.mockk.every
import io.mockk.mockk
import io.mockk.mockkObject
import io.mockk.slot
import io.mockk.unmockkAll
import mu.KLogger
import mu.KotlinLogging
import org.assertj.core.api.Assertions
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.TestInstance
import org.junit.jupiter.params.ParameterizedTest
import org.junit.jupiter.params.provider.Arguments
import org.junit.jupiter.params.provider.MethodSource
import picocli.CommandLine
import java.io.ByteArrayOutputStream
import java.io.File
import java.io.PrintStream

@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class SourceCodeParserMainTest {
    val errContent = ByteArrayOutputStream()
    val originalErr = System.err

    @AfterEach
    fun afterTest() {
        unmockkAll()
    }
    companion object {
        @JvmStatic
        fun provideValidInputFiles(): List<Arguments> {
            return listOf(
                    Arguments.of("src/test/resources/my/java/repo"),
                    Arguments.of("src/test/resources/my/java/repo/hello_world.java"),
                    Arguments.of("src/test/resources/my"))
        }

        @JvmStatic
        fun provideInvalidInputFiles(): List<Arguments> {
            return listOf(
                    Arguments.of("src/test/resources/my/empty/repo"),
                    Arguments.of("src/test/resources/this/does/not/exist"),
                    Arguments.of("src/test/resources/my/non-java/repo"),
                    Arguments.of(""))
        }
    }

    @ParameterizedTest
    @MethodSource("provideValidInputFiles")
    fun `should be identified as applicable for given directory path containing a java file`(resourceToBeParsed: String) {
        val isUsable = SourceCodeParserMain().isApplicable(resourceToBeParsed)
        Assertions.assertThat(isUsable).isTrue()
    }

    @ParameterizedTest
    @MethodSource("provideInvalidInputFiles")
    fun `should NOT be identified as applicable if no java file is present at given path`(resourceToBeParsed: String) {
        val isUsable = SourceCodeParserMain().isApplicable(resourceToBeParsed)
        Assertions.assertThat(isUsable).isFalse()
    }

    @Test
    fun `should stop execution if input files are invalid`() {
        mockkObject(InputHelper)
        every {
            InputHelper.isInputValid(any(), any())
        } returns false

        System.setErr(PrintStream(errContent))
        CommandLine(SourceCodeParserMain()).execute("thisDoesNotExist").toString()
        System.setErr(originalErr)

        Assertions.assertThat(errContent.toString()).contains("Input invalid file for SourceCodeParser, stopping execution")
    }

    @Test
    fun `serializeToFileOrStream should log the correct absolute path of the output file`() {
        val inputFilePath = "src/test/resources/my/java/repo"
        val outputFilePath = "src/test/resources/output.cc.json"
        val absoluteOutputFilePath = File(outputFilePath).absolutePath
        val outputFile = File(outputFilePath)
        outputFile.deleteOnExit()

        mockkObject(KotlinLogging)
        val loggerMock = mockk<KLogger>()
        val lambdaSlot = slot<(() -> Unit)>()
        val messagesLogged = mutableListOf<String>()
        every { KotlinLogging.logger(capture(lambdaSlot)) } returns loggerMock
        every { loggerMock.info(capture(messagesLogged)) } returns Unit

        CommandLine(SourceCodeParserMain()).execute(inputFilePath, "-o", outputFilePath, "-nc").toString()

        Assertions.assertThat(messagesLogged.any { e -> e.endsWith(absoluteOutputFilePath) }).isTrue()
    }
}
