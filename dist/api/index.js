"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("../src/app"));
// Local dev only
if (process.env.NODE_ENV !== "production") {
    const port = process.env.PORT || 5000;
    app_1.default.listen(port, () => console.log(`Server running on http://localhost:${port}`));
}
exports.default = app_1.default;
