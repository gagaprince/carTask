const path = require('path');
import { getLiveCode, excuteGroup, inviteMemberByGroupNameBatch, setupWelComeMsg, initGroupNotifaction, setAdminByGroup, createGroup, exitGroup, makeFriend, setConversationAntiSpamRules } from '../groupUtil';
import { getData, getHasCreate, buildMinSuFile } from '../excelUtil';
import Download from '../DownLoad';

async function sleep(time: number) {
    return new Promise((res) => {
        setTimeout(() => {
            res('')
        }, time);
    });
}

const hasCreateGroupList = getHasCreate();

async function main() {
    for (let i = 1; i < hasCreateGroupList.length; i++) {
        const groupData = hasCreateGroupList[i];
        const { groupName, qrUrl } = groupData;
        if (qrUrl) {
            const fileName = groupName.replace('【超级简历 × 美团民宿】校招精品', '');
            const filePath = path.resolve(__dirname, 'minsuQrCode', `${fileName}.png`)
            await new Download(qrUrl, filePath).start();
        }
    }
}

main();