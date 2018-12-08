import cors = require('cors');
import express = require('express');

export default (): any => {
    return express().use(cors());
};
