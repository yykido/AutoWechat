const fs = require("fs")
const { pcm2slk } = require("node-silk")
const pcmbuf = fs.readFileSync("/tmp/test.pcm")
const slkbuf = pcm2slk(pcmbuf)