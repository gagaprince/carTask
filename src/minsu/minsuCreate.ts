import { excuteGroup, inviteMemberByGroupNameBatch, setupWelComeMsg, initGroupNotifaction, setAdminByGroup, createGroup, exitGroup, makeFriend, setConversationAntiSpamRules } from '../groupUtil';
import { getData, getExData } from '../excelUtil';

const excludeGroups = getExData();


const parseData = async () => {
    const data = await getData('8.31-民宿批量群码所需字段.xlsx');

    let index = 0;
    return data.map((item) => {
        index++;
        if (index == 1) {
            return null;
        }
        const groupName = (item[0] as string || '').trim();
        if (excludeGroups.indexOf(groupName) != -1) {
            return null;
        }
        let mobile = '';
        if (item[1] == '搞大事学姐') {
            mobile = '13671929694'
        } else if (item[1] == '地球探险家') {
            mobile = '13671928747'
        } else if (item[1] == '夏天的马路睡不着') {
            mobile = '13671823754'
        } else if (item[1] == '盛亦容一') {
            mobile = '13671877264'
        } else if (item[1] == '赵亦清二') {
            mobile = '13671906124'
        } else if (item[1] == '余婷二') {
            mobile = '13671935401'
        } else if (item[1] == '周亦成') {
            mobile = '15021386425'
        } else if (item[1] == '郑卓琳') {
            mobile = '18120721637'
        }
        if (mobile != '13671935401') {
            return null;
        }

        return {
            server: '10.177.234.39:8080',
            mobile,
            groupName,
            admins: item[2] as string || '没有人',
            rule: item[3] as string || ''
        }
    });
}

async function sleep(time: number) {
    return new Promise((res) => {
        setTimeout(() => {
            res('')
        }, time);
    });
}


async function main() {
    // console.log(excludeGroups);
    // return;
    const groupList = await parseData();
    for (let i = 0; i < groupList.length; i++) {
        const groupInfo = groupList[i];
        console.log(groupInfo);
        if (groupInfo != null) {
            const { server, mobile, groupName, admins = '', rule } = groupInfo;
            const flag = await createGroup(mobile, groupName, [admins], server);
            if (flag) {
                if (admins != '没有人') {
                    await sleep(300);
                    await setAdminByGroup(mobile, groupName, [admins], server);
                }
                await sleep(300);
                await initGroupNotifaction(mobile, groupName, rule, server);
                await sleep(1000);
            } else {
                console.log(`groupName:${groupName}-创建失败`);
                await sleep(1000);
            }

        }

    }
}

main();