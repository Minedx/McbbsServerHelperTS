"use strict";
// ==UserScript==
// @name         McbbsServerReviewer TypeScriptVersion
// @namespace    https://github.com/Minedx
// @version      0.0.1-beta
// @description  mcbbsreviewserverhelper TSéæç
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
// @updateURL    https://github.com/Minedx/McbbsServerHelperTS/raw/main/js/McbbsServerHelperTS.js
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
        '1.6.4'
    ];
    function without(arr1, arr2) {
        let result = new Array;
        arr1.forEach(item => {
            if (arr2.indexOf(item) === -1) {
                result.push(item);
            }
        });
        return result;
    }
    function addFlag(OriginText, FlagType, fontColor) {
        let changedText = OriginText;
        if (fontColor !== undefined)
            changedText = `<font color="${fontColor}">` + OriginText + `</font>`;
        switch (FlagType) {
            case "Tip1":
                changedText = `ð${changedText}ð`;
                break;
            case "Tip2":
                changedText = `ð${changedText}ð`;
                break;
            case "Tip3":
                changedText = `ð${changedText}ð`;
                break;
            case "pass":
                changedText = `â${changedText}â`;
                break;
            case "warning":
                changedText = `â${changedText}â`;
                break;
            case "needCheck":
                changedText = `ð${changedText}ð`;
                break;
        }
        return changedText;
    }
    function checkTitle(str) {
        var regex = /^\[(çµä¿¡|èé|ç§»å¨|åçº¿|å¤çº¿|æè²|æ¸¯æ¾³|å°æ¹¾|æ¬§æ´²|ç¾æ´²|äºå¤ª|åç½)\]([0-9a-zA-Z\u2160-\u217f\u3040-\u30ff\u31f0-\u31ff\u4e00-\u9fa5]|\s)+ââ([^\u2014\u2588\u2589\u3013\uD83C\uDF00-\uDFFF\uD83D\uDC00-\uDE4F\uD83D\uDE80-\uDEFF\u2700-\u27BF\uFE0F]|(\s))+\[(\-?((1\.\d{1,2}(\.(\d{1,2}|X|x))?)|(\d{2}w\d{2}[a-z]))){1,2}\]$/;
        if (regex.test(str))
            return true;
        else
            return false;
    }
    // é¡µé¦æ·»å è­¦åä¿¡æ¯
    function addWarningMsg(Message, warnType) {
        let finalMsg = `${Message}`;
        let headMsg = `è¯·æ³¨æ: <br/>`;
        switch (warnType) {
            case "check":
                headMsg = `ð${headMsg}`;
                break;
            case "warn":
                headMsg = `â${headMsg}`;
                break;
            case "normal":
                headMsg = `ð${headMsg}`;
                break;
        }
        let locLeft = document.querySelector('#postlist > table.ad > tbody > tr > td.pls');
        let locRight = document.querySelector('#postlist > table.ad > tbody > tr > td.plc');
        let subNode1 = document.createElement('span');
        subNode1.setAttribute('style', 'font-size:14px;');
        subNode1.innerHTML = `${headMsg}`;
        locLeft.appendChild(subNode1);
        let subNode2 = document.createElement('caption');
        subNode2.setAttribute('style', 'font-size:14px;padding-left:1%;');
        subNode2.innerHTML = `${finalMsg}`;
        locRight.appendChild(subNode2);
    }
    function getTitlePart(title, part) {
        //[å¤çº¿]æµè¯ ââ åå¸æµè¯æå¡å¨[1.17.x-1.19.X]
        //[å¤çº¿]
        if (part == 'ServerName') {
            let serverName = title.substring(title.indexOf(']') + 1, title.indexOf('â' || '-' || 'ä¸')).trim();
            return serverName;
        }
        else if (part == 'ServerIntroduction') {
            let serverIntroduction = title.substring(title.lastIndexOf('â' || '-' || 'ä¸') + 1, title.lastIndexOf('[')).trim();
            return serverIntroduction;
        }
        else if (part == 'ServerVersion') {
            let serverVersion = title.substring(title.lastIndexOf('[') + 1, title.lastIndexOf(']')).trim();
            return serverVersion;
        }
    }
    // æ·»å æä»¶å¯å¨æç¤ºè¯­
    // loc: åå¸æ¶é´å³ä¾§
    function pluginStartConfirm() {
        let childNode = document.createElement('span');
        childNode.innerHTML = `ð <font color='red'><b>æä»¶å¯å¨æå!</b></font> ð`;
        document.querySelector('tbody > tr:nth-child(1) > td.plc > div.pi > div.pti > div.authi').appendChild(childNode);
    }
    function createPipeElement() {
        let pipeElement = document.createElement('span');
        pipeElement.setAttribute('class', 'pipe');
        pipeElement.innerHTML = '|';
        return pipeElement;
    }
    // ä¸é®è¿åå®¡æ ¸åº
    // loc: ä¸æ¹æä½é¢æ¿
    function sendBackReviewButton() {
        let buttonElement = document.createElement('a');
        buttonElement.setAttribute('class', 'btnSendBackReview');
        buttonElement.innerHTML = `ç§»åå®¡æ ¸çéæ°ç¼è¾`;
        buttonElement.addEventListener('click', () => {
            modthreads(2, 'move');
            setTimeout(() => {
                ajaxget('forum.php?mod=ajax&action=getthreadtypes&fid=296', 'threadtypes');
                if (296) {
                    $('moveext').style.display = '';
                }
                else {
                    $('moveext').style.display = 'none';
                }
                document.querySelector('#moveto').childNodes[6].childNodes[4].selected = true;
                setTimeout(() => {
                    document.querySelector('#threadtypes > select').childNodes[7].selected = true;
                    setTimeout(() => {
                        document.querySelector('#reason').innerHTML = 'ç§»åç¼è¾åºéæ°å®¡æ ¸';
                        setTimeout(() => {
                            document.querySelector('#modsubmit > span').click();
                        }, 150);
                    }, 250);
                }, 250);
            }, 1000);
        });
        document.querySelector('#modmenu').insertBefore(createPipeElement(), document.querySelector('#modmenu').childNodes[0]);
        document.querySelector('#modmenu').insertBefore(buttonElement, document.querySelector('#modmenu').childNodes[0]);
    }
    // éè¿å®¡æ ¸æé®
    // loc: è­¦ç¤ºæ banner
    function passCheckButton() {
        let buttonElement = document.createElement('button');
        buttonElement.setAttribute('class', 'btnPassCheck hm cl');
        buttonElement.innerHTML = 'â ä¸é®éè¿å®¡æ ¸';
        let moveSector = document.querySelector('tbody > tr:nth-child(1) > td.plc > div.pct > div > div.typeoption > table > tbody > tr:nth-child(5) > td').innerHTML.toString();
        buttonElement.addEventListener('click', () => {
            modthreads(2, 'move');
            setTimeout(() => {
                ajaxget('forum.php?mod=ajax&action=getthreadtypes&fid=179', 'threadtypes');
                if (179) {
                    $('moveext').style.display = '';
                }
                else {
                    $('moveext').style.display = 'none';
                }
                document.querySelector('#moveto').childNodes[6].childNodes[1].selected = true;
                setTimeout(() => {
                    switch (moveSector) {
                        case 'çå­':
                            document.querySelector('#threadtypes > select').childNodes[1].selected = true;
                            break;
                        case 'åé ':
                            document.querySelector('#threadtypes > select').childNodes[2].selected = true;
                            break;
                        case 'æäº':
                            document.querySelector('#threadtypes > select').childNodes[4].selected = true;
                            break;
                        case 'æ··åï¼ä¸é¢æ³¨æï¼':
                            document.querySelector('#threadtypes > select').childNodes[3].selected = true;
                            break;
                        case 'å°æ¸¸æï¼Mini Gameï¼':
                            document.querySelector('#threadtypes > select').childNodes[6].selected = true;
                            break;
                        case 'è§è²æ®æ¼ï¼RPGï¼':
                            document.querySelector('#threadtypes > select').childNodes[5].selected = true;
                            break;
                    }
                    setTimeout(() => {
                        document.querySelector('#reason').innerHTML = 'éè¿';
                        setTimeout(() => {
                            document.querySelector('#modsubmit > span').click();
                        }, 150);
                    }, 250);
                }, 250);
            }, 1000);
        });
        document.querySelector('#my16modannouncement').appendChild(buttonElement);
        document.querySelector('#my16modannouncement').appendChild(createPipeElement());
    }
    //ä¸»å½æ°
    window.onload = function () {
        let threadTitle = document.querySelector('#thread_subject').innerHTML.toString();
        //server name compare
        if (document.querySelector('tbody > tr:nth-child(1) > td.plc > div.pct > div > div.typeoption > table > tbody > tr:nth-child(1) > td').innerHTML.toString().replace('\t', '') !== getTitlePart(threadTitle, 'ServerName'))
            addWarningMsg('æ é¢ä¸æ¨¡æ¿æå¡å¨åç§°ä¸å¹é.', 'warn');
        //server version compare
        let serverVersion = document.querySelector('tbody > tr:nth-child(1) > td.plc > div.pct > div > div.typeoption > table > tbody > tr:nth-child(3) > td').innerHTML.toString().replaceAll('&nbsp;', ' ');
        // single version
        if (serverVersion.includes('-')) {
            if (serverVersion !== getTitlePart(threadTitle, 'ServerVersion'))
                addWarningMsg('æ é¢ä¸æ¨¡æ¿æå¡å¨çæ¬ä¸å¹é.', 'warn');
        } //other version
        else if (serverVersion.includes('å¶ä»çæ¬'))
            addWarningMsg('å­å¨å¶ä»çæ¬ è¯·èªè¡å¤æ­', 'check');
        else {
            //multi version
            let firstVer = getTitlePart(threadTitle, 'ServerVersion').split('-')[0].toLowerCase();
            let lastVer = getTitlePart(threadTitle, 'ServerVersion').split('-')[1].toLowerCase();
            let correctVersionList = [];
            if (firstVer < lastVer) {
                let tmp = firstVer;
                firstVer = lastVer;
                lastVer = tmp;
            }
            switch (firstVer) {
                case '1.19.x':
                    firstVer = '1.19';
                    break;
                case '1.18.x':
                    firstVer = '1.18.1';
                    break;
                case '1.17.x':
                    firstVer = '1.17';
                    break;
                case '1.16.x':
                    firstVer = '1.16';
                    break;
                case '1.15.x':
                    firstVer = '1.15';
                    break;
                case '1.14.x':
                    firstVer = '1.14';
                    break;
                case '1.13.x':
                    firstVer = '1.13';
                    break;
                case '1.12.x':
                    firstVer = '1.12';
                    break;
                case '1.11.x':
                    firstVer = '1.11';
                    break;
                case '1.9.x':
                    firstVer = '1.9';
                    break;
                case '1.7.x':
                    firstVer = '1.7.2';
                    break;
                case '1.6.x':
                    firstVer = '1.6.4';
                    break;
            }
            switch (lastVer) {
                case '1.19.x':
                    lastVer = '1.19.3';
                    break;
                case '1.18.x':
                    lastVer = '1.18.2';
                    break;
                case '1.17.x':
                    lastVer = '1.17.1';
                    break;
                case '1.16.x':
                    lastVer = '1.16.5';
                    break;
                case '1.15.x':
                    lastVer = '1.15.2';
                    break;
                case '1.14.x':
                    lastVer = '1.14.4';
                    break;
                case '1.13.x':
                    lastVer = '1.13.2';
                    break;
                case '1.12.x':
                    lastVer = '1.12.2';
                    break;
                case '1.11.x':
                    lastVer = '1.11.2';
                    break;
                case '1.9.x':
                    lastVer = '1.9.4';
                    break;
                case '1.7.x':
                    lastVer = '1.7.10';
                    break;
                case '1.6.x':
                    lastVer = '1.6.4';
                    break;
            }
            console.log(firstVer, lastVer);
            let serverVersionList = serverVersion.trim().split(' ');
            console.log(serverVersionList);
            console.log(correctVersionList);
            for (let i = versionList.indexOf(lastVer); i <= versionList.indexOf(firstVer); i++)
                correctVersionList.push(versionList[i]);
            if (correctVersionList.length !== serverVersionList.length)
                addWarningMsg(`çæ¬å·ä¸å¹éï¼<br/>æ é¢çæ¬å·: ${correctVersionList}<br/>æ¨¡æ¿çæ¬å·: ${serverVersionList}<br/>Diff: ${without(correctVersionList, serverVersionList)}`, 'warn');
        }
        // title regex test
        if (!checkTitle(threadTitle))
            addWarningMsg(`æ é¢ä¸åæ ¼ï¼</br>3-1: å¸åé¡»ä¸ºå¦ä¸æ ¼å¼ï¼</br>å¸åï¼[ç½ç»ç±»å]æå¡å¨åç§° ââ ä¸å¥è¯ç®ä»[çæ¬å·]`, 'warn');
        // test if emerald or contribution <0
        let contributionNum = (document.querySelectorAll('dl > dd:nth-child(6)')[1].innerHTML.toString().split(' '))[0];
        let emeraldNum = (document.querySelectorAll('dl > dd:nth-child(4)')[1].innerHTML.toString().split(' ')[0]);
        if (contributionNum < 0) {
            document.querySelectorAll('dl > dd:nth-child(6)')[1].innerHTML = addFlag(document.querySelectorAll('dl > dd:nth-child(6)')[1].innerHTML, 'warning', 'red');
            addWarningMsg('è´¡ç®å°äº 0 !', 'warn');
        }
        if (emeraldNum < 0) {
            document.querySelectorAll('dl > dd:nth-child(4)')[1].innerHTML = addFlag(document.querySelectorAll('dl > dd:nth-child(4)')[1].innerHTML, 'warning', 'red');
            addWarningMsg('ç»¿å®ç³å°äº 0 !', 'warn');
        }
        // higher button
        sendBackReviewButton();
        // confirm plugin is start in page dom change
        pluginStartConfirm();
        // clear highlighted msg prepare for button
        while (document.querySelectorAll('#my16modannouncement').length > 1)
            document.querySelectorAll('#my16modannouncement')[1].remove();
        document.querySelector('#my16modannouncement').innerHTML = '';
        // after caption button
        passCheckButton();
    };
})();
