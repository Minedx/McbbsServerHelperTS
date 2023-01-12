// ==UserScript==
// @name         McbbsServerReviewer TypeScriptVersion
// @namespace    https://github.com/Minedx
// @version      0.1
// @description  mcbbsreviewserverhelper TS重构版
// @author       Gesshoku Rin
// @match        *://www.mcbbs.net/thread-*
// @match        *://www.mcbbs.net/forum.php?mod=viewthread*
// @match        *://www.mcbbs.net/forum-serverpending*
// @match        *://www.mcbbs.net/forum.php?mod=forumdisplay&fid=296*
// @match        *://www.mcbbs.net/forum-server*
// @match        *://www.mcbbs.net/forum.php?mod=forumdisplay&fid=179*
// @match        *://www.mcbbs.net/forum-362*
// @match        *://www.mcbbs.net/forum.php?mod=forumdisplay&fid=362*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=mcbbs.net
// @grant        GM_xmlhttpRequest
// @grant        GM_getResourceText
// @grant        GM_getValue
// @grant        GM_setValue
// @require      file://D:\McbbsServerHelperTS\js\McbbsServerHelperTS.js
// @require      https://cdn.staticfile.org/jquery/1.12.4/jquery.min.js
// ==/UserScript==

(function () {
    'use strict';

    let versionList = [
        '1.19.3', '1.19.2', '1.19.1', '1.19',
        '1.18.2', '1.18.1', '1.18',
        '1.17.1', '1.17',
        '1.16.5', '1.16.4', '1.16.3', '1.16.2', '1.16.1', '1.16',
        '1.15.2', '1.15.1', '1.15',
        '1.14.4', '1.14',
        '1.13.2', '1.13.1', '1.13',
        '1.12.2', '1.12',
        '1.11.2', '1.11',
        '1.10.X',
        '1.9.4', '1.9',
        '1.8.X',
        '1.7.10', '1.7.2',
        '1.6.4'];

    type FlagType = 'Tip1' | 'Tip2' | 'Tip3' | 'pass' | 'warning' | 'needCheck';
    type serverType = '商业' | '公益';
    type WarnType = 'check' | 'warn' | 'normal';

    function without(arr1: any[], arr2: any[]) {
        let result = new Array;
        arr1.forEach(item => {
            if (arr2.indexOf(item) === -1) {
                result.push(item)
            }
        })

        return result
    }

    function addFlag(OriginText: string, FlagType: FlagType, fontColor?: string): string {
        let changedText = OriginText;
        if (fontColor !== undefined) changedText = `<font color="${fontColor}">` + OriginText + `</font>`;
        switch (FlagType) {
            case "Tip1": changedText = `🍃${changedText}🍃`; break;
            case "Tip2": changedText = `🍁${changedText}🍁`; break;
            case "Tip3": changedText = `🍂${changedText}🍂`; break;
            case "pass": changedText = `✅${changedText}✅`; break;
            case "warning": changedText = `❌${changedText}❌`; break;
            case "needCheck": changedText = `🔔${changedText}🔔`; break;
        }
        return changedText;
    }

    function checkTitle(str: string): boolean {
        var regex = /^\[(电信|联通|移动|双线|多线|教育|港澳|台湾|欧洲|美洲|亚太|内网)\]([0-9a-zA-Z\u2160-\u217f\u3040-\u30ff\u31f0-\u31ff\u4e00-\u9fa5]|\s)+——([^\u2014\u2588\u2589\u3013\uD83C\uDF00-\uDFFF\uD83D\uDC00-\uDE4F\uD83D\uDE80-\uDEFF\u2700-\u27BF\uFE0F]|(\s))+\[(\-?((1\.\d{1,2}(\.(\d{1,2}|X|x))?)|(\d{2}w\d{2}[a-z]))){1,2}\]$/;
        if (regex.test(str)) return true;
        else return false;
    }

    // 页首添加警告信息
    function addWarningMsg(Message: string, warnType: WarnType): void {
        let finalMsg: string = `${Message}`;
        let headMsg: string = `请注意: <br/>`
        switch (warnType) {
            case "check":
                headMsg = `🔔${headMsg}`;
                break;
            case "warn":
                headMsg = `❌${headMsg}`;
                break;
            case "normal":
                headMsg = `🍃${headMsg}`;
                break;
        }
        let locLeft = document.querySelector('#postlist > table.ad > tbody > tr > td.pls');
        let locRight = document.querySelector('#postlist > table.ad > tbody > tr > td.plc');
        let subNode1 = document.createElement('span');
        subNode1.setAttribute('style', 'font-size:14px;');
        subNode1.innerHTML = `${headMsg}`;
        locLeft!.appendChild(subNode1);

        let subNode2 = document.createElement('caption');
        subNode2.setAttribute('style', 'font-size:14px;padding-left:1%;')
        subNode2.innerHTML = `${finalMsg}`;
        locRight!.appendChild(subNode2);
    }

    function getTitlePart(title: string, part: 'ServerName' | 'ServerIntroduction' | 'ServerVersion') {
        //[多线]测试 —— 发布测试服务器[1.17.x-1.19.X]
        //[多线]
        if (part == 'ServerName') {
            let serverName = title.substring(title.indexOf(']') + 1, title.indexOf('—' || '-' || '一')).trim();
            return serverName;
        } else if (part == 'ServerIntroduction') {
            let serverIntroduction = title.substring(title.lastIndexOf('—' || '-' || '一') + 1, title.lastIndexOf('[')).trim();
            return serverIntroduction;
        } else if (part == 'ServerVersion') {
            let serverVersion = title.substring(title.lastIndexOf('[') + 1, title.lastIndexOf(']')).trim();
            return serverVersion;
        }
    }

    function getMiddleVersion(version: string) {
        let middleVersion = version.substring(version.indexOf('.') + 1, version.indexOf('.') + 3)
        if (middleVersion.endsWith('.')) middleVersion = middleVersion.substring(0, 1);
        if (middleVersion.startsWith('.')) middleVersion = middleVersion.substring(1);
        return middleVersion;
    }

    //jq主函数
    document.addEventListener('load', function(){
        let threadTitle = document.querySelector('#thread_subject')!.innerHTML.toString();

        //server name compare
        if (document.querySelector('tbody > tr:nth-child(1) > td.plc > div.pct > div > div.typeoption > table > tbody > tr:nth-child(1) > td')!.innerHTML.toString().replace('\t', '') !== getTitlePart(threadTitle, 'ServerName')) addWarningMsg('标题与模板服务器名称不匹配.', 'warn');

        //server version compare
        let serverVersion = document.querySelector('tbody > tr:nth-child(1) > td.plc > div.pct > div > div.typeoption > table > tbody > tr:nth-child(3) > td')!.innerHTML.toString().replaceAll('&nbsp;',' ');
        // single version
        if (serverVersion.includes('-')) {
            if (serverVersion !== getTitlePart(threadTitle, 'ServerVersion')) addWarningMsg('标题与模板服务器版本不匹配.', 'warn');
        } //other version
        else if (serverVersion.includes('其他版本'))
            addWarningMsg('存在其他版本 请自行判断', 'check');
        else {
            //multi version
            let firstVer = ((getTitlePart(threadTitle, 'ServerVersion') as string).split('-')[0] as string).toLowerCase();
            let lastVer = ((getTitlePart(threadTitle, 'ServerVersion') as string).split('-')[1] as string).toLowerCase();
            let correctVersionList: string[] = [];
            if (firstVer < lastVer) {
                let tmp = firstVer;
                firstVer = lastVer;
                lastVer = tmp;
            }

            switch (firstVer) {
                case '1.19.x': firstVer = '1.19'; break;
                case '1.18.x': firstVer = '1.18.1'; break;
                case '1.17.x': firstVer = '1.17'; break;
                case '1.16.x': firstVer = '1.16'; break;
                case '1.15.x': firstVer = '1.15'; break;
                case '1.14.x': firstVer = '1.14'; break;
                case '1.13.x': firstVer = '1.13'; break;
                case '1.12.x': firstVer = '1.12'; break;
                case '1.11.x': firstVer = '1.11'; break;
                case '1.9.x': firstVer = '1.9'; break;
                case '1.7.x': firstVer = '1.7.2'; break;
                case '1.6.x': firstVer = '1.6.4'; break;
            }
            switch (lastVer) {
                case '1.19.x': lastVer = '1.19.3'; break;
                case '1.18.x': lastVer = '1.18.2'; break;
                case '1.17.x': lastVer = '1.17.1'; break;
                case '1.16.x': lastVer = '1.16.5'; break;
                case '1.15.x': lastVer = '1.15.2'; break;
                case '1.14.x': lastVer = '1.14.4'; break;
                case '1.13.x': lastVer = '1.13.2'; break;
                case '1.12.x': lastVer = '1.12.2'; break;
                case '1.11.x': lastVer = '1.11.2'; break;
                case '1.9.x': lastVer = '1.9.4'; break;
                case '1.7.x': lastVer = '1.7.10'; break;
                case '1.6.x': lastVer = '1.6.4'; break;
            }
            console.log(firstVer, lastVer);

            let serverVersionList = serverVersion.trim().split(' ');

            console.log(serverVersionList);
            console.log(correctVersionList);

            for (let i = versionList.indexOf(lastVer); i <= versionList.indexOf(firstVer); i++) correctVersionList.push(versionList[i]);
            if (correctVersionList.length !== serverVersionList.length) addWarningMsg(`版本号不匹配！<br/>标题版本号: ${correctVersionList}<br/>模板版本号: ${serverVersionList}<br/>Diff: ${without(correctVersionList, serverVersionList)}`, 'warn');
        }

        // title regex test
        if (!checkTitle(threadTitle)) addWarningMsg(`标题不合格：</br>3-1: 帖名须为如下格式：</br>帖名：[网络类型]服务器名称 —— 一句话简介[版本号]`, 'warn');

        // test if emerald or contribution <0
        let contributionNum = (document.querySelectorAll('dl > dd:nth-child(6)')[1].innerHTML.toString().split(' '))[0] as any as number;
        let emeraldNum = (document.querySelectorAll('dl > dd:nth-child(4)')[1].innerHTML.toString().split(' ')[0]) as any as number;

        if (contributionNum < 0) {
            document.querySelectorAll('dl > dd:nth-child(6)')[1].innerHTML=addFlag(document.querySelectorAll('dl > dd:nth-child(6)')[1].innerHTML, 'warning', 'red');
            addWarningMsg('贡献小于 0 !', 'warn');
        }
        if (emeraldNum < 0) {
            document.querySelectorAll('dl > dd:nth-child(4)')[1].innerHTML=addFlag(document.querySelectorAll('dl > dd:nth-child(4)')[1].innerHTML, 'warning', 'red');
            addWarningMsg('绿宝石小于 0 !', 'warn');
        }
    })
})();