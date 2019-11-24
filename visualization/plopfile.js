const promptDirectory = require("inquirer-directory")
const promptFile = require("inquirer-file")

const appBase = "app"

module.exports = function(plop) {
	plop.setPrompt("directory", promptDirectory)
	plop.setPrompt("file", promptFile)

	plop.setGenerator("state service", {
		description: "an empty service with corresponding test file",
		prompts: [
			{
				type: "input",
				name: "name",
				message: "Name (e.x. foo):"
			}
		],
		actions: [
			buildAddAction("state", ["{{camelCase name}}", "service", "ts"], "codeCharta/state"),
			buildAddAction("state", ["{{camelCase name}}", "service", "spec", "ts"], "codeCharta/state"),
			{
				type: "modify",
				path: "app/codeCharta/state/state.module.ts",
				pattern: /(\/\/ Plop: Append service name here)/gi,
				template: "$1\r\n\t.service(_.camelCase({{properCase name}}Service.name), {{properCase name}}Service)"
			},
			{
				type: "modify",
				path: "app/codeCharta/state/state.module.ts",
				pattern: /(\/\/ Plop: Append module import here)/gi,
				template: '$1\r\nimport { {{properCase name}}Service } from "./{{camelCase name}}.service"'
			}
		]
	})

	plop.setGenerator("ui module", {
		description: "an ui module with an empty component, all necessary files and tests",
		prompts: [
			{
				type: "input",
				name: "name",
				message: "Name:"
			}
		],
		actions: [
			buildAddAction("ui", ["{{camelCase name}}", "component", "ts"], "codeCharta/ui/{{camelCase name}}"),
			buildAddAction("ui", ["{{camelCase name}}", "module", "ts"], "codeCharta/ui/{{camelCase name}}", "ui"),
			buildAddAction("ui", ["{{camelCase name}}", "component", "html"], "codeCharta/ui/{{camelCase name}}"),
			buildAddAction("ui", ["{{camelCase name}}", "component", "scss"], "codeCharta/ui/{{camelCase name}}"),
			buildAddAction("ui", ["{{camelCase name}}", "e2e", "ts"], "codeCharta/ui/{{camelCase name}}"),
			buildAddAction("ui", ["{{camelCase name}}", "po", "ts"], "codeCharta/ui/{{camelCase name}}"),
			buildAddAction("ui", ["{{camelCase name}}", "component", "spec", "ts"], "codeCharta/ui/{{camelCase name}}"),
			{
				type: "modify",
				path: "app/codeCharta/ui/ui.ts",
				pattern: /(\/\/ Plop: Append component name here)/gi,
				template: '$1\r\n\t\t"app.codeCharta.ui.{{camelCase name}}",'
			},
			{
				type: "modify",
				path: "app/codeCharta/ui/ui.ts",
				pattern: /(\/\/ Plop: Append module import here)/gi,
				template: '$1\r\nimport "./{{camelCase name}}/{{camelCase name}}.module";'
			}
		]
	})

	plop.setGenerator("util static class", {
		description: "an empty static class with corresponding test file",
		prompts: [
			{
				type: "input",
				name: "name",
				message: "Name:"
			}
		],
		actions: [
			buildAddAction("util", ["{{camelCase name}}", "ts"], "codeCharta/util", "util"),
			buildAddAction("util", ["{{camelCase name}}", "spec", "ts"], "codeCharta/util", "util")
		]
	})

	plop.setGenerator("redux property", {
		description: "a store property including actions, reducer, service and test files",
		prompts: [
			{
				type: "input",
				name: "name",
				message: "Property Name (e.x. areaMetric):"
			},
			{
				type: "input",
				name: "interface",
				message: "Interface (e.x. string, boolean, Edge[]):"
			},
			{
				type: "input",
				name: "default",
				message: "Default Value (e.x. null, true, 1234 or MY_STRING):"
			},
			{
				type: "input",
				name: "randomvalue",
				message: "Another possible Value (e.x. false, 5678 or ANOTHER_STRING):"
			},
			{
				type: "input",
				name: "subreducer",
				message: "Sub Reducer (e.x. fileSettings):"
			}
		],
		actions: [
			buildAddAction(
				"redux",
				["{{camelCase name}}", "actions", "ts"],
				"codeCharta/state/store/{{camelCase subreducer}}/{{camelCase name}}"
			),
			buildAddAction(
				"redux",
				["{{camelCase name}}", "reducer", "spec", "ts"],
				"codeCharta/state/store/{{camelCase subreducer}}/{{camelCase name}}"
			),
			buildAddAction(
				"redux",
				["{{camelCase name}}", "reducer", "ts"],
				"codeCharta/state/store/{{camelCase subreducer}}/{{camelCase name}}"
			),
			buildAddAction(
				"redux",
				["{{camelCase name}}", "service", "spec", "ts"],
				"codeCharta/state/store/{{camelCase subreducer}}/{{camelCase name}}"
			),
			buildAddAction(
				"redux",
				["{{camelCase name}}", "service", "ts"],
				"codeCharta/state/store/{{camelCase subreducer}}/{{camelCase name}}"
			),
			{
				type: "modify",
				path: "app/codeCharta/state/state.module.ts",
				pattern: /(\/\/ Plop: Append service name here)/gi,
				template: "$1\r\n\t.service(_.camelCase({{properCase name}}Service.name), {{properCase name}}Service)"
			},
			{
				type: "modify",
				path: "app/codeCharta/state/state.module.ts",
				pattern: /(\/\/ Plop: Append module import here)/gi,
				template:
					'$1\r\nimport { {{properCase name}}Service } from "./store/{{camelCase subreducer}}/{{camelCase name}}/{{camelCase name}}.service"'
			}
		]
	})
}

function buildAddAction(
	sourceDirectory,
	suffixTokens = ["{{camelCase name}}", "ts"],
	destinationDirectory = "{{directory}}",
	templatePrefix = null
) {
	let templateNameSuffixTokens = suffixTokens
	if (templatePrefix) {
		templateNameSuffixTokens = templateNameSuffixTokens.slice(1)
		templateNameSuffixTokens = ["", templatePrefix].concat(templateNameSuffixTokens)
	}
	return {
		type: "add",
		path: appBase + "/" + destinationDirectory + "/" + suffixTokens.join("."),
		templateFile: "plop-templates/" + sourceDirectory + "/" + templateNameSuffixTokens.slice(1).join(".") + ".hbs"
	}
}
