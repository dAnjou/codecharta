package de.maibornwolff.codecharta.filter.structuremodifier

import com.github.kinquirer.KInquirer
import com.github.kinquirer.components.promptInput
import com.github.kinquirer.components.promptInputNumber
import com.github.kinquirer.components.promptList
import com.varabyte.kotter.foundation.input.Keys
import com.varabyte.kotter.foundation.session
import com.varabyte.kotter.runtime.Session
import com.varabyte.kotterx.test.foundation.input.press
import de.maibornwolff.codecharta.tools.inquirer.myPromptInput
import de.maibornwolff.codecharta.tools.inquirer.myPromptList
import com.varabyte.kotterx.test.foundation.testSession
import com.varabyte.kotterx.test.terminal.type
import de.maibornwolff.codecharta.filter.structuremodifier.ParserDialog.Companion.myCollectParserArgs
import de.maibornwolff.codecharta.tools.inquirer.myPromptInputNumber
import de.maibornwolff.codecharta.util.InputHelper
import io.mockk.every
import io.mockk.mockk
import io.mockk.mockkObject
import io.mockk.mockkStatic
import io.mockk.unmockkAll
import org.assertj.core.api.Assertions
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.TestInstance
import picocli.CommandLine
import java.io.File
import java.math.BigDecimal
import java.nio.file.Paths

//@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class ParserDialogTest {

    val pathToResourceFolder = Paths.get("").toAbsolutePath().toString() + "/src/test/resources/"

    @AfterEach
    fun afterTest() {
        unmockkAll()
    }

//    @Test
//
//    fun `should test if we can find a way to avoid virtual terminal`() {
//        var res = listOf<String>()
//        testSession { terminal ->
//            res = myCollectParserArgs(
//                fileCallback = { terminal.press(Keys.ENTER) },
////                actionCallback = { terminal.press(Keys.ENTER) } //print 5 levels
//            )
//        }
//    }

    @Test
    fun `should output correct arguments when print structure is selected`() {

            // given
            val inputFolderName = "sampleInputFile"
            val printLevels = "5"//BigDecimal(5)

//            mockkObject(InputHelper)
//            every { InputHelper.isInputValidAndNotNull(any(), any()) } returns true
//
////            mockkStatic("com.github.kinquirer.components.InputKt")
////            every {
//////                KInquirer.promptInput(any(), any(), any(), any(), any(), any())
////                myPromptInput(any(), any(), any(), any(), any())
////            } returns inputFolderName
//            every {
////                KInquirer.promptInputNumber(any(), any(), any(), any())
//                myPromptInputNumber(any(), any(), any(), any())
//            } returns printLevels
////            mockkStatic("com.github.kinquirer.components.ListKt")
//            every {
////                KInquirer.promptList(any(), any(), any(), any(), any())
//                myPromptList(any(), any(), any())
//            } returns StructureModifierAction.PRINT_STRUCTURE.descripton

        testSession { terminal ->

            // when
            val parserArguments = myCollectParserArgs(
                fileCallback = {
                    terminal.type(pathToResourceFolder + "sample_project.cc.json")
                    terminal.press(Keys.ENTER)
                },
                actionCallback = {
                    terminal.press(Keys.ENTER)
                    terminal.press(Keys.ENTER)
                    terminal.press(Keys.ENTER)
                }, //TODO: find out why this makes the test flaky
                printCallback = {
                    terminal.type("5")
                    terminal.press(Keys.ENTER)
                }
            )      // <- this opens the virutal terminal
//            val commandLine = CommandLine(StructureModifier())
//            val parseResult = commandLine.parseArgs(*parserArguments.toTypedArray())

            Assertions.assertThat(parserArguments).isEqualTo(listOf("test to see if it shows up"))

            // then
//            Assertions.assertThat(parseResult.matchedPositional(0).getValue<File>().name).isEqualTo(inputFolderName)
//            Assertions.assertThat(parseResult.matchedOption("print-levels").getValue<Int>()).isEqualTo(5)
//            Assertions.assertThat(parseResult.matchedOption("output-file")).isNull()
//            Assertions.assertThat(parseResult.matchedOption("set-root")).isNull()
//            Assertions.assertThat(parseResult.matchedOption("move-to")).isNull()
//            Assertions.assertThat(parseResult.matchedOption("move-from")).isNull()
//            Assertions.assertThat(parseResult.matchedOption("remove")).isNull()
        }
    }

    @Test
    fun `should output correct arguments when extract path is selected`() {
        // given
        val inputFolderName = "sampleInputFile"
        val pathToBeExtracted = "/root/src/main"
        val outputFileName = "output"

        mockkObject(InputHelper)
        every { InputHelper.isInputValidAndNotNull(any(), any()) } returns true

        mockkStatic("com.github.kinquirer.components.InputKt")
        every {
            KInquirer.promptInput(any(), any(), any(), any(), any(), any())
        } returns inputFolderName andThen pathToBeExtracted andThen outputFileName
        mockkStatic("com.github.kinquirer.components.ListKt")
        every {
            KInquirer.promptList(any(), any(), any(), any(), any())
        } returns StructureModifierAction.SET_ROOT.descripton

        // when
        val parserArguments = ParserDialog.collectParserArgs()
        val commandLine = CommandLine(StructureModifier())
        val parseResult = commandLine.parseArgs(*parserArguments.toTypedArray())

        // then
        Assertions.assertThat(parseResult.matchedPositional(0).getValue<File>().name).isEqualTo(inputFolderName)
        Assertions.assertThat(parseResult.matchedOption("output-file").getValue<String>()).isEqualTo(outputFileName)
        Assertions.assertThat(parseResult.matchedOption("set-root").getValue<String>()).isEqualTo(pathToBeExtracted)
        Assertions.assertThat(parseResult.matchedOption("print-levels")).isNull()
        Assertions.assertThat(parseResult.matchedOption("move-from")).isNull()
        Assertions.assertThat(parseResult.matchedOption("move-to")).isNull()
        Assertions.assertThat(parseResult.matchedOption("remove")).isNull()
    }

    @Test
    fun `should output correct arguments when move nodes is selected`() {
        // given
        val inputFolderName = "sampleInputFile"
        val outputFileName = "output"
        val moveFrom = "/root/src/main/java"
        val moveTo = "/root/src/main/java/subfolder"

        mockkObject(InputHelper)
        every { InputHelper.isInputValidAndNotNull(any(), any()) } returns true

        mockkStatic("com.github.kinquirer.components.InputKt")
        every {
            KInquirer.promptInput(any(), any(), any(), any(), any(), any())
        } returns inputFolderName andThen moveFrom andThen moveTo andThen outputFileName
        mockkStatic("com.github.kinquirer.components.ListKt")
        every {
            KInquirer.promptList(any(), any(), any(), any(), any())
        } returns StructureModifierAction.MOVE_NODES.descripton

        // when
        val parserArguments = ParserDialog.collectParserArgs()
        val commandLine = CommandLine(StructureModifier())
        val parseResult = commandLine.parseArgs(*parserArguments.toTypedArray())

        // then
        Assertions.assertThat(parseResult.matchedPositional(0).getValue<File>().name).isEqualTo(inputFolderName)
        Assertions.assertThat(parseResult.matchedOption("output-file").getValue<String>()).isEqualTo(outputFileName)
        Assertions.assertThat(parseResult.matchedOption("move-from").getValue<String>()).isEqualTo(moveFrom)
        Assertions.assertThat(parseResult.matchedOption("move-to").getValue<String>()).isEqualTo(moveTo)
        Assertions.assertThat(parseResult.matchedOption("print-levels")).isNull()
        Assertions.assertThat(parseResult.matchedOption("set-root")).isNull()
        Assertions.assertThat(parseResult.matchedOption("remove")).isNull()
    }

    @Test
    fun `should output correct arguments when remove nodes is selected`() {
        // given
        val inputFolderName = "sampleInputFile"
        val outputFileName = "output"
        val nodeToRemove = "/root/src/main/java"
        val nodesToRemove = arrayOf(nodeToRemove)

        mockkObject(InputHelper)
        every { InputHelper.isInputValidAndNotNull(any(), any()) } returns true

        mockkStatic("com.github.kinquirer.components.InputKt")
        every {
            KInquirer.promptInput(any(), any(), any(), any(), any(), any())
        } returns inputFolderName andThen nodeToRemove andThen outputFileName
        mockkStatic("com.github.kinquirer.components.ListKt")
        every {
            KInquirer.promptList(any(), any(), any(), any(), any())
        } returns StructureModifierAction.REMOVE_NODES.descripton

        // when
        val parserArguments = ParserDialog.collectParserArgs()
        val commandLine = CommandLine(StructureModifier())
        val parseResult = commandLine.parseArgs(*parserArguments.toTypedArray())

        // then
        Assertions.assertThat(parseResult.matchedPositional(0).getValue<File>().name).isEqualTo(inputFolderName)
        Assertions.assertThat(parseResult.matchedOption("output-file").getValue<String>()).isEqualTo(outputFileName)
        Assertions.assertThat(parseResult.matchedOption("remove").getValue<Array<String>>()).isEqualTo(nodesToRemove)
        Assertions.assertThat(parseResult.matchedOption("print-levels")).isNull()
        Assertions.assertThat(parseResult.matchedOption("move-from")).isNull()
        Assertions.assertThat(parseResult.matchedOption("set-root")).isNull()
        Assertions.assertThat(parseResult.matchedOption("move-to")).isNull()
    }

    @Test
    fun `should prompt user twice for input file when first input file is invalid`() {
        // given
        val invalidInputFolderName = ""
        val validInputFolderName = "sampleInputFile"
        val outputFileName = "output"
        val nodeToRemove = "/root/src/main/java"

        mockkObject(InputHelper)
        every { InputHelper.isInputValidAndNotNull(any(), any()) } returns false andThen true

        mockkStatic("com.github.kinquirer.components.InputKt")
        every {
            KInquirer.promptInput(any(), any(), any(), any(), any(), any())
        } returns invalidInputFolderName andThen validInputFolderName andThen nodeToRemove andThen outputFileName
        mockkStatic("com.github.kinquirer.components.ListKt")
        every {
            KInquirer.promptList(any(), any(), any(), any(), any())
        } returns StructureModifierAction.REMOVE_NODES.descripton

        // when
        val parserArguments = ParserDialog.collectParserArgs()
        val commandLine = CommandLine(StructureModifier())
        val parseResult = commandLine.parseArgs(*parserArguments.toTypedArray())

        // then
        Assertions.assertThat(parseResult.matchedPositional(0).getValue<File>().name).isEqualTo(validInputFolderName)
    }
}
