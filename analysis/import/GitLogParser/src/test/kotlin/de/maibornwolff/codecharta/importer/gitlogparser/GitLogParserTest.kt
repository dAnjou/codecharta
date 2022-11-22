package de.maibornwolff.codecharta.importer.gitlogparser

import de.maibornwolff.codecharta.importer.gitlogparser.GitLogParser.Companion.main
import de.maibornwolff.codecharta.serialization.ProjectDeserializer
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test
import java.io.File

class GitLogParserTest {

    @Test
    fun `should create json uncompressed file repo-scan`() {
        main(
            arrayOf(
                "repo-scan",
                "--repo-path=../../..",
                "--output-file=src/test/resources/gitlog-analysis-repo.cc.json",
                "--not-compressed",
                "--silent=false",
                "--add-author=false"
            )
        )
        val file = File("src/test/resources/gitlog-analysis-repo.cc.json")
        file.deleteOnExit()

        assertTrue(file.exists())
    }

    @Test
    fun `should create json uncompressed file log-scan`() {
        main(
            arrayOf(
                "log-scan",
                "--git-log=src/test/resources/codeCharta.log",
                "--repo-files=src/test/resources/names-in-git-repo.txt",
                "--output-file=src/test/resources/gitlog-analysis-log.cc.json",
                "--not-compressed",
                "--silent=true"
            )
        )
        val file = File("src/test/resources/gitlog-analysis-log.cc.json")
        file.deleteOnExit()
        assertTrue(file.exists())
        val project = ProjectDeserializer.deserializeProject(file.inputStream())
        assertEquals(project.attributeDescriptors, getAttributeDescriptors())
    }

    @Test
    fun `should create json gzip file log-scan`() {
        main(
            arrayOf(
                "log-scan",
                "--git-log=src/test/resources/codeCharta.log",
                "--repo-files=src/test/resources/names-in-git-repo.txt",
                "--output-file=src/test/resources/gitlog-analysis.cc.json",
                "--silent=true"
            )
        )
        val file = File("src/test/resources/gitlog-analysis.cc.json.gz")
        file.deleteOnExit()

        assertTrue(file.exists())
    }
}
