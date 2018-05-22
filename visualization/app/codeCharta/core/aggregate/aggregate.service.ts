import {CodeMap, CodeMapNode} from "../data/model/CodeMap";


export class AggregateMapService {

    public static SELECTOR = "aggregateMapService";


    public aggregateMaps(inputMaps: CodeMap[]): CodeMap {

        if(inputMaps.length == 1) return inputMaps[0];

        let projectNameArray = [];
        let fileNameArray = [];

        for(let inputMap of inputMaps){
            projectNameArray.push(inputMap.projectName);
            fileNameArray.push(inputMap.fileName);
        }

        let outputMap: CodeMap = {
            projectName: "Aggregation of following projects: " + projectNameArray.join(", "),
            fileName: "Aggregation of following files: " + fileNameArray.join(", "),
            root: {
                name: "root",
                children: [] as CodeMapNode[],
                attributes: {}
            }
        };

        for(let inputMap of inputMaps){
            outputMap.root.children.push(this.convertMapToNode(inputMap));
        }

        return outputMap;
    }

    private convertMapToNode(inputCodeMap: CodeMap): CodeMapNode{

        let outputNode: CodeMapNode = {} as CodeMapNode;
        outputNode["name"]= inputCodeMap.projectName;

        for(let property in inputCodeMap.root){

            if(property == "children"){
                outputNode[property] = JSON.parse(JSON.stringify(inputCodeMap.root.children));
            }
            else if(property == "path"){
                outputNode[property] = this.updatePath(inputCodeMap.projectName, inputCodeMap.root.path);
            }
            else if(property != "name"){
                outputNode[property] =  inputCodeMap.root[property];
            }
        }

        this.updatePathOfAllChildren(inputCodeMap.projectName, outputNode.children);

        return outputNode;
    }

    private updatePathOfAllChildren(projectName, children: CodeMapNode[]) {
        for(let i = 0; i < children.length; i++) {
            if(children[i].path){
                children[i].path = this.updatePath(projectName, children[i].path);
            }

            if(children[i].children) {
                this.updatePathOfAllChildren(projectName, children[i].children);
            }
        }
    }

    private updatePath(projectName, path) {
        let subPath = path.substring(6, path.length);
        let slash = (subPath.length > 0) ? "/" : "";
        return "/root/" + projectName + slash + subPath;
    }
}