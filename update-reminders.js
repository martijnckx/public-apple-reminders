// get reminders via jxa
// check if tmp file exists
// if not, upload via upload.js
// if yes, check if the contents of the file are different from the reminders
// if yes, upload via upload.js
// if no, do nothing

import fs from 'fs';
import uploadReminders from './upload.js';
import { execSync } from 'child_process';

const tmpFilePath = '/tmp/public-apple-reminders.json';

function saveToTmp(reminders) {
    const remindersJson = JSON.stringify(reminders);
    fs.writeFileSync(tmpFilePath, remindersJson);
}

function getFromTmp() {
    const tmpFileContents = fs.readFileSync(tmpFilePath, 'utf8');
    return JSON.parse(tmpFileContents);
}

function hasTmpFile() {
    return fs.existsSync(tmpFilePath);
}

function getReminders() {
    const remindersJson = execSync('osascript -l JavaScript get-reminders.jxa', { encoding: 'utf8' });
    return JSON.parse(remindersJson);
}

async function updateReminders() {
    let reminders;

    try {
        reminders = getReminders();
    } catch (e) {
        console.error('Error parsing reminders:', e);
    }

    if (!hasTmpFile()) {
        console.log('Uploading because no tmp file exists');
        await uploadReminders(reminders);
    } else {
        const tmpReminders = getFromTmp();

        if (JSON.stringify(tmpReminders) !== JSON.stringify(reminders)) {
            console.log('Uploading because reminders have changed');
            await uploadReminders(reminders);
        }
    }

    saveToTmp(reminders);
}

updateReminders()
    .then(() => {
        console.log('Done');
    })
    .catch((e) => {
        console.error('Error updating reminders:', e);
    });
