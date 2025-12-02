"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var cors_1 = __importDefault(require("cors"));
var dotenv_1 = __importDefault(require("dotenv"));
var genai_1 = require("@google/genai");
var axios_1 = __importDefault(require("axios"));
dotenv_1.default.config();
var app = (0, express_1.default)();
var PORT = process.env.PORT;
var ai = new genai_1.GoogleGenAI({ apiKey: process.env.AI_KEY });
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.get('/api/execute', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var message, code, searchPrompt, response, text, cleanedText, jsonMatch, parseText, searchPlace, data, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                message = req.query.message;
                code = req.query.code;
                // Validate code parameter if exists
                if (!code || code.toString().trim() === '') {
                    return [2 /*return*/, res.status(400).json({ error: 'Code parameter is required.' })];
                }
                if (!message || message.toString().trim() === '') {
                    return [2 /*return*/, res.status(400).json({ error: 'Message parameter is required.' })];
                }
                searchPrompt = "\n        Convert the following user request into a structured JSON format for a restaurant search.\n\n            User Request: \"".concat(message, "\"\n\n            Requirements:\n                - The output must be a valid JSON object.\n                - Use the following structure exactly:\n\n                {\n                    \"action\": \"search_restaurants\",\n                    \"parameters\": {\n                        \"query\": string,       // user search keywords\n                        \"near\": string,        // location or city\n                        \"price\": string|null,  // optional, use null if not provided\n                        \"open_now\": boolean    // optional, use false if not specified\n                    }\n                }\n\n                - Do NOT include any text outside the JSON.\n                - Always include all keys; use null or default values if the information is missing.\n        ");
                return [4 /*yield*/, ai.models.generateContent({
                        model: process.env.AI_MODEL,
                        contents: searchPrompt,
                    })];
            case 1:
                response = _a.sent();
                text = response.text;
                cleanedText = text.replace(/```json|```/g, '').trim();
                jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
                parseText = null;
                if (jsonMatch) {
                    try {
                        parseText = JSON.parse(jsonMatch[0]);
                    }
                    catch (err) {
                        console.error('Failed to parse JSON:', err);
                    }
                }
                return [4 /*yield*/, axios_1.default.get('https://places-api.foursquare.com/places/search', {
                        headers: {
                            Authorization: "Bearer ".concat(process.env.FOURSQUARE_API_KEY),
                            'X-Places-Api-Version': '2025-06-17',
                        },
                        params: {
                            query: parseText.parameters.query,
                            near: parseText.parameters.near,
                            price: parseText.parameters.price,
                            open_now: parseText.parameters.open_now,
                        }
                    })
                    // Constructing a required response format
                ];
            case 2:
                searchPlace = _a.sent();
                data = searchPlace.data.results.map(function (item) {
                    var _a, _b, _c, _d, _e, _f;
                    return ({
                        name: item.name,
                        address: ((_a = item.location) === null || _a === void 0 ? void 0 : _a.formatted_address) || 'N/A',
                        cuisine: ((_b = item.categories) === null || _b === void 0 ? void 0 : _b.map(function (cat) { return cat.name; }).join(', ')) || 'N/A',
                        rating: (_c = item.rating) !== null && _c !== void 0 ? _c : undefined,
                        price: (_d = item.price) !== null && _d !== void 0 ? _d : undefined,
                        open_now: (_f = (_e = item.hours) === null || _e === void 0 ? void 0 : _e.is_open) !== null && _f !== void 0 ? _f : undefined,
                    });
                });
                return [2 /*return*/, res.status(200).json({ message: 'Here are suggested places you want to visit:', results: data })];
            case 3:
                error_1 = _a.sent();
                throw res.status(500).json({ error: 'Internal Server Error' });
            case 4: return [2 /*return*/];
        }
    });
}); });
app.listen(PORT, function () { return console.log("Server is running on port ".concat(PORT)); });
