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

    let jq = jQuery.noConflict();
    let versionList = [
        '1.19', '1.19.1', '1.19.2', '1.19.3',
        '1.18', '1.18.1', '1.18.2',
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
        let headMsg: string = `请注意: `
        switch (warnType) {
            case "check":
                headMsg = `🔔请注意: `;
                break;
            case "warn":
                headMsg = `❌请注意：`;
                break;
            case "normal":
                headMsg = `🍃请注意：`;
                break;
        }
        jq(".ad .pls").append(`<div style="font-size:14px;">${headMsg}</div>`)
        jq(".ad .plc").append(`<div style="font-size:14px;padding-left:1%;">${finalMsg}</div>`)
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
    jq(function () {
        let threadTitle = jq('#thread_subject').text();

        //server name compare
        if (jq(".cgtl.mbm tbody tr td").eq(0).text() == getTitlePart(threadTitle, 'ServerName')) addWarningMsg('标题与模板服务器名称不匹配.', 'warn');

        //server version compare
        let serverVersion = jq(".cgtl.mbm tbody tr td").eq(2).text();
        // single version
        if (serverVersion.includes('-')) {
            if (serverVersion !== getTitlePart(threadTitle, 'ServerVersion')) addWarningMsg('标题与模板服务器版本不匹配.', 'warn');
        } else {
            //multi version
            let firstVer = ((getTitlePart(threadTitle, 'ServerVersion') as string).split('-')[0] as string).toLowerCase();
            let lastVer = ((getTitlePart(threadTitle, 'ServerVersion') as string).split('-')[1] as string).toLowerCase();
            let correctVersionList: string[] = [];
            versionList.map(e => {
                //pre define big version
                let thisMiddleVersion = getMiddleVersion(e);
                let firstMiddleVersion = getMiddleVersion(firstVer);
                let lastMiddleVersion = getMiddleVersion(lastVer);
                if (firstMiddleVersion > lastMiddleVersion) {
                    let tmp = firstMiddleVersion;
                    firstMiddleVersion = lastMiddleVersion;
                    lastMiddleVersion = tmp;
                }
                console.log(`small: ${firstMiddleVersion}`);
                console.log(`big: ${lastMiddleVersion}`);
                console.log(`compare: ${thisMiddleVersion}`);


                if (thisMiddleVersion >= firstMiddleVersion && thisMiddleVersion <= lastMiddleVersion) correctVersionList.push(e);
            })
            console.log(correctVersionList.sort());
            console.log(serverVersion.trim().split(' ').sort());
        }


        if (!checkTitle(threadTitle)) addWarningMsg(`标题不合格：</br>3-1: 帖名须为如下格式：</br>帖名：[网络类型]服务器名称 —— 一句话简介[版本号]`, 'warn');
        // test if emerald or contribution <0
        let contributionNum = (jq(".pil.cl dd").eq(2).text().split(' '))[0] as any as number;
        let emeraldNum = (jq(".pil.cl dd").eq(1).text().split(' ')[0]) as any as number;

        if (contributionNum < 0) {
            jq(".pil.cl dd").eq(2).html(addFlag(jq(".pil.cl dd").eq(2).text(), 'warning', 'red'));
            addWarningMsg('贡献小于 0 !', 'warn');
        }
        if (emeraldNum < 0) {
            jq(".pil.cl dd").eq(1).html(addFlag(jq(".pil.cl dd").eq(1).text(), 'warning', 'red'));
            addWarningMsg('绿宝石小于 0 !', 'warn');
        }

    })
})();