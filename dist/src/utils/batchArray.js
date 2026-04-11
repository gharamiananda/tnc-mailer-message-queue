"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.batchArray = batchArray;
function batchArray(arr, size) {
    const out = [];
    for (let i = 0; i < arr.length; i += size)
        out.push(arr.slice(i, i + size));
    return out;
}
