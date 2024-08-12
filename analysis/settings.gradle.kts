plugins {
    id("org.gradle.toolchains.foojay-resolver-convention") version "0.8.0"
}

include("model")
include("filter:MergeFilter", "filter:EdgeFilter", "filter:StructureModifier")
include(
    "import:CSVImporter",
    "import:SVNLogParser",
    "import:SonarImporter",
    "import:SourceCodeParser",
    "import:CodeMaatImporter",
    "import:TokeiImporter",
    "import:MetricGardenerImporter"
)
include("parser:RawTextParser", "parser:GitLogParser")
include("export:CSVExporter")
include("tools:ValidationTool", "tools:ccsh", "tools:InteractiveParser", "tools:PipeableParser")

rootProject.name = "codecharta"
findProject(":tools:PipeableParser")?.name = "PipeableParser"
