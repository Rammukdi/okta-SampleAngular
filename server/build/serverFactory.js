"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cors = require("cors");
const express = require("express");
exports.default = () => {
    return express().use(cors());
};
