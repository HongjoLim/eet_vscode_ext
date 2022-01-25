/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/extension.ts":
/*!**************************!*\
  !*** ./src/extension.ts ***!
  \**************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.deactivate = exports.activate = void 0;
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = __importStar(__webpack_require__(/*! vscode */ "vscode"));
const instructions = __webpack_require__(/*! ./300.json */ "./src/300.json");
const EET_LANGUAGE_CONFIG = (__webpack_require__(/*! ./syntaxes/eet.tmLanguage.json */ "./src/syntaxes/eet.tmLanguage.json").patterns[0]);
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {
    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "eet" is now active!');
    // The command has been defined in the package.json file
    // Now provide the implementation of the command with registerCommand
    // The commandId parameter must match the command field in package.json
    vscode.languages.registerHoverProvider('eet', {
        provideHover(document, position, token) {
            let line = document.lineAt(position.line);
            let parsed = line.text.match(EET_LANGUAGE_CONFIG.match);
            let output = '';
            if (parsed != undefined) { //Ensure parsed data exists
                //Take each tokenized capture group, save the length of the word
                //compare against current cursor position to determine which group we are currently hovering over
                let runningWordCharCount = 0;
                for (let i = 1; i <= Math.min(parsed.length, Object.keys(EET_LANGUAGE_CONFIG.captures).length); i++) {
                    //capture group count is the minimum of the number of captures in the regex, or the number of captures defined in the language spec
                    if (parsed[i] != null) {
                        runningWordCharCount += parsed[i].length;
                        if (position.character < runningWordCharCount) {
                            output = EET_LANGUAGE_CONFIG.captures[i].tooltip_name;
                            break;
                        }
                    }
                }
                //Further processing of instruction hover can potentially be implemented here, based on instruction number, etc. This is left as an exercise to the reader!
            }
            return {
                contents: [output]
            };
        }
    });
    const provider1 = vscode.languages.registerCompletionItemProvider('eet', {
        provideCompletionItems(document, position, token, context) {
            const instruction_items = get_instruction_providers();
            return instruction_items;
        }
    });
    function get_instruction_providers() {
        let declarations = instructions.instructions;
        const providers = [];
        for (let ins of declarations) {
            const item = new vscode.CompletionItem(`Instruction ${ins.id}: ${ins.name}}`);
            let default_values = ins.fields.map((item) => {
                return item.default;
            }).join(', ');
            item.insertText = new vscode.SnippetString(`${ins.id}, <Ver: ${ins.version}>, ${default_values}`);
            item.documentation = new vscode.MarkdownString(`Inserts ${ins.id} instruction with default values.`);
            providers.push(item);
        }
        return providers;
    }
    context.subscriptions.push(provider1);
}
exports.activate = activate;
// this method is called when your extension is deactivated
function deactivate() { }
exports.deactivate = deactivate;


/***/ }),

/***/ "vscode":
/*!*************************!*\
  !*** external "vscode" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("vscode");

/***/ }),

/***/ "./src/300.json":
/*!**********************!*\
  !*** ./src/300.json ***!
  \**********************/
/***/ ((module) => {

module.exports = JSON.parse('{"instructions":[{"id":300,"name":"Single Frame Broadcast - J1939, OBDII , Manufacturer Specific, GM LAN","version":1,"fields":[{"index":0,"name":"CAN Element Index","description":"Up to 399","default":0,"min":0,"max":399},{"index":1,"name":"Interface","description":"","default":0,"min":0,"max":66565},{"index":2,"name":"Arbitration ID","description":"Arbitration ID of the message to emulate","default":"0x1234","min":0,"max":66565},{"index":3,"name":"Frame Type","description":"11 bit or 29 bit (0 or 1)","default":"11-Bit"},{"index":4,"name":"DLC","description":"DLC of the message (0 to 8)","default":8,"min":0,"max":8},{"index":5,"name":"Data Bytes","description":"Hyphenated data bytes","default":"00-00-00-00-00-00-00-00","min":0,"max":8},{"index":6,"name":"Frequency","description":"Broadcast period in milliseconds.\\n0 to 60,000.\\n0 = one broadcast and then self disable.","default":0,"min":0,"max":60000},{"index":7,"name":"Broadcast Timing Offset (Phase Shift)","description":"Delay in milliseconds for broadcast to start after enabling.","default":0,"min":0,"max":99999999},{"index":8,"name":"Element Type","enum_id":"message_element_type","default":0}]},{"id":301,"name":"Single Frame Request - J1939, CAN OBDII\\\\Manufacturer Specific","version":3,"fields":[{"index":0,"name":"CAN Element Index","description":"Up to 399","default":0,"min":0,"max":399},{"index":1,"name":"Interface","description":"","default":0,"min":0,"max":66565},{"index":2,"name":"Req Arbitration ID","description":"Arbitration ID of the message to emulate","default":"0x1234","min":0,"max":66565},{"index":3,"name":"Frame Type","description":"11 bit or 29 bit (0 or 1)","default":"11-Bit"},{"index":4,"name":"DLC","description":"DLC of the message (0 to 8)","default":8,"min":0,"max":8},{"index":5,"name":"Data Bytes","description":"Hyphenated data bytes","default":"00-00-00-00-00-00-00-00","min":0,"max":8},{"index":6,"name":"Res Arbitration ID","description":"Arbitration ID of the message to emulate","default":"0x1234","min":0,"max":66565},{"index":7,"name":"Frame Type","description":"11 bit or 29 bit (0 or 1)","default":"11-Bit"},{"index":8,"name":"DLC","description":"DLC of the message (0 to 8)","default":8,"min":0,"max":8},{"index":9,"name":"Data Bytes","description":"Hyphenated data bytes","default":"00-00-00-00-00-00-00-00","min":0,"max":8},{"index":10,"name":"Response Delay","description":"Broadcast period in milliseconds.\\n0 to 60,000.\\n0 = one broadcast and then self disable.","default":0,"min":0,"max":60000},{"index":11,"name":"Element Type","enum_id":"message_element_type","default":0},{"index":12,"name":"Negative Response Enable/Disable","enum_id":"message_element_type","default":0},{"index":13,"name":"Negative Response Code","description":"The code sent out as a negative response\\n(1 Byte).\\nExample: 0x78\\nThis field only applies to OBDII.","default":0},{"index":14,"name":"Positive Response Delay","description":"Response Delay in milliseconds (2 Bytes).\\nRange: 0 to 4999.\\nThe first Negative response is sent out after the Response delay.\\nEvery other response (based on Negative Response Count and Negative Response Code) is sent out after a Positive Response Delay.\\nThis field only applies to OBDII.","default":0,"min":0,"max":4999},{"index":15,"name":"Negative Response Count ","description":"Number of times the Negative Response Code is sent out (1 Byte).\\nThis field only applies to OBDII.","default":0}]}]}');

/***/ }),

/***/ "./src/syntaxes/eet.tmLanguage.json":
/*!******************************************!*\
  !*** ./src/syntaxes/eet.tmLanguage.json ***!
  \******************************************/
/***/ ((module) => {

module.exports = JSON.parse('{"$schema":"https://raw.githubusercontent.com/martinring/tmlanguage/master/tmlanguage.json","scopeName":"source.eet","name":"EET","patterns":[{"match":"^([0-9]+,)([ ]?[0-9]+,)([ ]?[0-9]+,?)(([^/][^/]*))?","name":"eetgroup","captures":{"1":{"name":"entity.name.type.timestamp.eet","tooltip_name":"Stream Time"},"2":{"name":"constant.numeric.uat_index","tooltip_name":"Unique Message Index"},"3":{"name":"keyword.instruction_id.eet","tooltip_name":"Instruction ID"},"4":{"name":"variable.instruction.eet","tooltip_name":"Data"}}}],"repository":{"strings":{"name":"string.quoted.double.eet","begin":"\\"","end":"\\"","patterns":[{"name":"constant.character.escape.eet","match":"\\\\\\\\."}]}}}');

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = __webpack_require__("./src/extension.ts");
/******/ 	module.exports = __webpack_exports__;
/******/ 	
/******/ })()
;
//# sourceMappingURL=extension.js.map