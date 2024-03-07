package de.maibornwolff.codecharta.importer.sonar

import de.maibornwolff.codecharta.model.AttributeDescriptor

fun getAttributeDescriptors(): Map<String, AttributeDescriptor> {
    val metricLink = "https://docs.sonarcloud.io/digging-deeper/metric-definitions/"
    return mapOf(
            "accepted_issues" to AttributeDescriptor(title = "Accepted Issues", description = "Accepted issues", link = metricLink, direction = -1),
            "blocker_violations" to AttributeDescriptor(title = "Blocker Violations", description = "Total count of issues of the severity blocker", link = metricLink , direction = -1),
            "branch_coverage" to AttributeDescriptor(title = "Branch Coverage", description = "Density of fully covered boolean conditions in flow control structures", link = metricLink, direction = 1),
            "bugs" to AttributeDescriptor(title = "Number of Bugs", description = "Number of bug issues", link = metricLink, direction = -1),
            "class_complexity" to AttributeDescriptor(title = "Cyclic Class Complexity", description = "Maximum cyclomatic complexity based on paths through a class by McCabe", link = metricLink, direction = -1),
            "classes" to AttributeDescriptor(title = "Number of Classes", description = "Number of classes (including nested classes, interfaces, enums and annotations", link = metricLink, direction = -1),
            "code_smells" to AttributeDescriptor(title = "Code Smells", description = "Total count of code smell issues", link = metricLink, direction = -1),
            "cognitive_complexity" to AttributeDescriptor(title = "Cognitive Complexity", description = "How hard is it to understand the code's control flow", link = "https://www.sonarsource.com/resources/cognitive-complexity/", direction = -1),
            "comment_lines" to AttributeDescriptor(title = "Comment Lines", description = "Number of lines containing either a comment or commented-out code", link = metricLink, direction = -1),
            "comment_lines_density" to AttributeDescriptor(title = "Comment Density", description = "Density of comment lines in relation to total lines of code", link = metricLink, direction = -1),
            "complexity" to AttributeDescriptor(title = "Maximum Cyclomatic Complexity", description = "Maximum cyclic complexity based on paths through the code by McCabe", link = metricLink, direction = -1),
            "complexity_in_classes" to AttributeDescriptor(title = "Class Complexity", description = "Maximum cyclomatic complexity based on paths through a class by McCabe", link = metricLink, direction = -1),
            "complexity_in_functions" to AttributeDescriptor(title = "Function Complexity", description = "Maximum cyclomatic complexity based on paths through a function by McCabe", link = metricLink, direction = -1),
            "conditions_by_line" to AttributeDescriptor(title = "Conditions by line", description = "Number of conditions by line", link = metricLink, direction = -1),
            "conditions_to_cover" to AttributeDescriptor(title = "Conditions to Cover", description = "Number of conditions which could be covered by unit tests", link = metricLink, direction = -1),
            "confirmed_issues" to AttributeDescriptor(title = "Confirmed Issues", description = "Total count of issues in the confirmed state", link = metricLink, direction = -1),
            "coverage" to AttributeDescriptor(title = "Coverage", description = "Mix of branch and line coverage", link = metricLink, direction = 1),
            "critical_violations" to AttributeDescriptor(title = "Critical Violations", description = "Total count of issues of the severity critical", link = metricLink, direction = -1),
            "directories" to AttributeDescriptor(title = "Number of Directories", description = "Number of directories", link = metricLink, direction = -1),
            "duplicated_blocks" to AttributeDescriptor(title = "Duplicated Blocks", description = "Number of duplicated blocks of lines", link = metricLink, direction = -1),
            "duplicated_files" to AttributeDescriptor(title = "Duplicated Files", description = "Number of files involved in duplications", link = metricLink, direction = -1),
            "duplicated_lines" to AttributeDescriptor(title = "Duplicated Lines", description = "Number of lines involved in duplications", link = metricLink, direction = -1),
            "duplicated_lines_density" to AttributeDescriptor(title = "Duplicated Line Density", description = "Density of duplicated lines", link = metricLink, direction = -1),
            "false_positive_issues" to AttributeDescriptor(title = "False Positive Issues", description = "Total count of issues marked false positive", link = metricLink, direction = -1),
            "file_complexity" to AttributeDescriptor(title = "File Complexity", description = "Maximum cyclomatic complexity based on paths through a file by McCabe", link = metricLink, direction = -1),
            "files" to AttributeDescriptor(title = "Number of Files", description = "Number of files", link = metricLink, direction = -1),
            "function_complexity" to AttributeDescriptor(title = "Function Complexity", description = "Maximum cyclomatic complexity based on paths through a function by McCabe", link = metricLink, direction = -1),
            "functions" to AttributeDescriptor(title = "Number of Functions", description = "Number of functions", link = metricLink, direction = -1),
            "generated_lines" to AttributeDescriptor(title = "Generated Lines", description = "Number of generated lines of code", link = metricLink, direction = -1),
            "generated_ncloc" to AttributeDescriptor(title = "Generated Real Lines of Code", description = "Number of generated non-empty lines of code", link = metricLink, direction = -1),
            "high_impact_accepted_issues" to AttributeDescriptor(title = "High Impact Accepted Issues", description = "Accepted issues with high impact", link = metricLink, direction = -1),
            "info_violations" to AttributeDescriptor(title = "Info Violations", description = "Total count of issues of the severity info", link = metricLink, direction = -1),
            "line_coverage" to AttributeDescriptor(title = "Line Coverage", description = "Density of fully covered lines of code", link = metricLink, direction = 1),
            "lines" to AttributeDescriptor(title = "Number of Lines", description = "Number of physical lines (number of carriage returns)", link = metricLink, direction = -1),
            "lines_to_cover" to AttributeDescriptor(title = "Lines to Cover", description = "Number of lines of code which could be covered by unit tests", link = metricLink, direction = -1),
            "major_violations" to AttributeDescriptor(title = "Major Violations", description = "Total count of issues of the severity major", link = metricLink, direction = -1),
            "minor_violations" to AttributeDescriptor(title = "Minor Violations", description = "Total count of issues of the severity minor", link = metricLink, direction = -1),
            "ncloc" to AttributeDescriptor(title = "Real Lines of Code", description = "Number of physical lines that contain at least one character which is neither a whitespace nor a tabulation nor part of a comment", link = metricLink, direction = -1),
            "new_accepted_issues" to AttributeDescriptor(title = "New Accepted Issues", description = "New accepted issues", link = metricLink, direction = -1),
            "new_blocker_violations" to AttributeDescriptor(title = "New Blocker Violations", description = "Number of issues of the severity blocker raised for the first time in the new code period", link = metricLink, direction = -1),
            "new_branch_coverage" to AttributeDescriptor(title = "New Branch Coverage", description = "Density of fully covered boolean conditions in flow control structures in new or updated code", link = metricLink, direction = 1),
            "new_bugs" to AttributeDescriptor(title = "Number of New Bugs", description = "Number of new bug issues", link = metricLink, direction = -1),
            "new_code_smells" to AttributeDescriptor(title = "New Code Smells", description = "Total count of code smell issues raised for the first time in the new code period", link = metricLink, direction = -1),
            "new_conditions_to_cover" to AttributeDescriptor(title = "New Conditions to Cover", description = "Number of new/updated conditions which could be covered by unit tests", link = metricLink, direction = -1),
            "new_coverage" to AttributeDescriptor(title = "New Coverage", description = "Mix of branch and line coverage on new/updated code", link = metricLink, direction = 1),
            "new_critical_violations" to AttributeDescriptor(title = "New Critical Violations", description = "Number of issues of the severity critical raised for the first time in the new code period", link = metricLink, direction = -1),
            "new_development_cost" to AttributeDescriptor(title = "New Development Cost", description = "Development cost of new/updated code", link = metricLink, direction = -1),
            "new_duplicated_blocks" to AttributeDescriptor(title = "New Duplicated Blocks", description = "Number of duplicated blocks of lines in new/updated code", link = metricLink, direction = -1),
            "new_duplicated_lines" to AttributeDescriptor(title = "New Duplicated Lines", description = "Number of lines involved in duplications in new/updated code", link = metricLink, direction = -1),
            "new_duplicated_lines_density" to AttributeDescriptor(title = "New Duplicated Lines Density", description = "Density of duplicated lines in new/updated code", link = metricLink, direction = -1),
            "new_info_violations" to AttributeDescriptor(title = "New Info Violations", description = "Number of issues of the severity info raised for the first time in the new code period", link = metricLink, direction = -1),
            "new_line_coverage" to AttributeDescriptor(title = "New Line Coverage", description = "Density of fully covered lines of new/updated code", link = metricLink, direction = 1),
            "new_lines" to AttributeDescriptor(title = "Number of New Lines", description = "Number of new/updated lines of code", link = metricLink, direction = -1),
            "new_lines_to_cover" to AttributeDescriptor(title = "New Lines to Cover", description = "Number of new/updated lines of code which could be covered by unit tests", link = metricLink, direction = -1),
            "new_major_violations" to AttributeDescriptor(title = "New Major Violations", description = "Number of issues of the severity major raised for the first time in the new code period", link = metricLink, direction = -1),
            "new_minor_violations" to AttributeDescriptor(title = "New Minor violations", description = "Number of issues of the severity minor raised for the first time in the new code period", link = metricLink, direction = -1),
            "new_security_hotspots" to AttributeDescriptor(title = "New Security Hotspots", description = "Number of new security hotspots in the new code period", link = metricLink, direction = -1),
            "new_security_hotspots_reviewed" to AttributeDescriptor(title = "New Security Hotspots Reviewed", description = "Percentage of reviewed (fixed or safe) security hotspots in new code period", link = metricLink, direction = 1),
            "new_security_hotspots_reviewed_status" to AttributeDescriptor(title = "New Security Hotspots Reviewed Status", description = "Total number of reviewed security hotspots in new code period", link = metricLink, direction = -1),
            "new_security_hotspots_to_review_status" to AttributeDescriptor(title = "New Security Hotspots to Review Status", description = "Number of security hotspots to review in new code period", link = metricLink, direction = -1),
            "new_sqale_debt_ratio" to AttributeDescriptor(title = "New SQale Debt Ratio", description = "Ratio between the cost to develop the software and the cost to fix it in new/updated code", link = metricLink, direction = -1),
            "new_uncovered_conditions" to AttributeDescriptor(title = "New Uncovered Conditions", description = "Total number of uncovered conditions in new/updated code", link = metricLink, direction = -1),
            "new_uncovered_lines" to AttributeDescriptor(title = "New Uncovered Lines", description = "Total number of uncovered lines in new/updated code", link = metricLink, direction = -1),
            "new_violations" to AttributeDescriptor(title = "New Violations", description = "Number of issues raised for the first time in the new code period", link = metricLink, direction = -1),
            "new_vulnerabilities" to AttributeDescriptor(title = "New Vulnerabilities", description = "Number of new vulnerability issues", link = metricLink, direction = -1),
            "open_issues" to AttributeDescriptor(title = "Number of Open Issues", description = "Total count of issues in the open state", link = metricLink, direction = -1),
            "projects" to AttributeDescriptor(title = "Number of Projects", description = "Total number of projects", link = metricLink, direction = -1),
            "public_api" to AttributeDescriptor(title = "Public API", description = "Public api available", link = metricLink, direction = -1),
            "public_documented_api_density" to AttributeDescriptor(title = "Public Documented API Density", description = "Documented public api available", link = metricLink, direction = 1),
            "public_undocumented_api" to AttributeDescriptor(title = "Public Undocumented API", description = "Undocumented api available", link = metricLink, direction = -1),
            "reopened_issues" to AttributeDescriptor(title = "Number of Reopened Issues", description = "Total count of issues in the reopened state", link = metricLink, direction = -1),
            "security_hotspots" to AttributeDescriptor(title = "Security Hotspots", description = "Number of security hotspots", link = metricLink, direction = -1),
            "security_hotspots_reviewed" to AttributeDescriptor(title = "Security Hotspots Reviewed", description = "Percentage of reviewed (fixed or safe) security hotspots", link = metricLink, direction = 1),
            "security_hotspots_reviewed_status" to AttributeDescriptor(title = "Security Hotspots Reviewed Status", description = "Total number of reviewed security hotspots", link = metricLink, direction = -1),
            "security_hotspots_to_review_status" to AttributeDescriptor(title = "Security Hotspots to Review Status", description = "Number of security hotspots to review", link = metricLink, direction = -1),
            "skipped_tests" to AttributeDescriptor(title = "Number of skipped Tests", description = "Number of skipped unit tests", link = metricLink, direction = -1),
            "sqale_debt_ratio" to AttributeDescriptor(title = "SQale Dept Ratio", description = "Ratio between the cost to develop the software and the cost to fix it", link = metricLink, direction = -1),
            "statements" to AttributeDescriptor(title = "Number of Statements", description = "Number of statements", link = metricLink, direction = -1),
            "test_errors" to AttributeDescriptor(title = "Number of Test Errors", description = "Number of unit tests that have failed", link = metricLink, direction = -1),
            "test_failures" to AttributeDescriptor(title = "Number of Test Failures", description = "Number of unit tests that have failed with an unexpected exception", link = metricLink, direction = -1),
            "test_success_density" to AttributeDescriptor(title = "Test Success Density", description = "Ratio between successful tests and all tests", link = metricLink, direction = 1),
            "tests" to AttributeDescriptor(title = "Number of Tests", description = "Number of unit tests", link = metricLink, direction = 1),
            "uncovered_conditions" to AttributeDescriptor(title = "Uncovered Conditions", description = "Total number of uncovered conditions", link = metricLink, direction = -1),
            "uncovered_lines" to AttributeDescriptor(title = "Uncovered Lines", description = "Total number of uncovered lines", link = metricLink, direction = -1),
            "violations" to AttributeDescriptor(title = "Number of Violations", description = "Total count of issues in all states", link = metricLink, direction = -1),
            "vulnerabilities" to AttributeDescriptor(title = "Number of Vulnerabilities", description = "Number of vulnerability issues", link = metricLink, direction = -1),
            "wont_fix_issues" to AttributeDescriptor(title = "Number of Won't Fix Issues", description = "Total count of issues in the wont fix state", link = metricLink, direction = -1)
    )
}
