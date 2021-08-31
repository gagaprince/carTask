import { getLiveCode, excuteGroup, inviteMemberByGroupNameBatch, setupWelComeMsg, initGroupNotifaction, setAdminByGroup, createGroup, exitGroup, makeFriend, setConversationAntiSpamRules } from '../groupUtil';
import { getData, getHasCreate, buildMinSuFile } from '../excelUtil';

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
        const { mobile, groupName, qrUrl } = groupData;
        if (qrUrl) {
            continue;
        }
        const url = await getLiveCode(mobile, groupName, groupName, '10.177.234.39:8080');
        groupData.qrUrl = url;
        console.log(url);
        await sleep(200);
    }
    console.log(hasCreateGroupList);
    buildMinSuFile(hasCreateGroupList, 'hasGetQrCode.xlsx');
}

main();