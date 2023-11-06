#!/usr/bin/env node

import colors from 'colors';
import { readFile } from 'fs/promises';
import readline from 'readline';

readline.emitKeypressEvents(process.stdin);
if (process.stdin.setRawMode != null) {
    process.stdin.setRawMode(true);
}

const file = await readFile(new URL('./words.txt', import.meta.url), 'utf-8');

const wordList = file.split('\n');

const WORD_COUNT = 15;

let words = [];
const maxValue = wordList.length - 1;
for (let i = 0; i < WORD_COUNT; i++) {
    const random = Math.floor(Math.random() * maxValue);
    const word = wordList[random];
    console.log(word);
    words.push(word);
}

const letters = words.join(' ').split('').filter(l => l !== '\r');
const corrects = [];

const printLine = (cursor) => {
    let line = '';
    for (let i = 0; i < letters.length; i++) {
        const letter = letters[i];
        if (i === cursor) {
            line += letter.underline.gray;
        }
        else if (i < cursor) {
            line += corrects[i] ? letter.white : letter.red;
        } else {
            line += letter.gray;
        }
    }
    console.clear();
    console.log(line);
}

let startTime;

let hasStarted = false;

let cursorPosition = 0;
printLine(cursorPosition);
process.stdin.on('keypress', (str, key) => {
    if (!hasStarted) {
        startTime = Date.now();
        hasStarted = true;
    }
    const { ctrl, name, sequence } = key;
    if (ctrl && name === 'c') {
        process.exit();
    }
    const correct = letters[cursorPosition] === sequence;
    if (name === 'backspace') {
        if (cursorPosition > 0) {
            cursorPosition--;
            corrects.splice(-1);
        }
    } else {
        cursorPosition++;
        corrects.push(correct);
    }
    printLine(cursorPosition, sequence);
    if (cursorPosition === letters.length) {
        const stopTime = Date.now();
        const time = stopTime - startTime;
        const seconds = time / 1000;
        const minutes = seconds / 60;
        const wpm = (letters.length / 5) / minutes;
        const errorCount = corrects.filter(x => x === false).length;
        const netWpm = wpm - (errorCount / minutes);
        const accuracy = Math.round((corrects.filter(x => x === true).length / letters.length) * 100);
        console.log(`Time: ${seconds} seconds`);
        console.log(`Acc: ${accuracy}%`);
        console.log(`WPM: ${wpm}`);
        console.log(`Net WPM: ${netWpm}`);
        process.exit();
    }
});
