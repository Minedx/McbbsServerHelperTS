"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
const $ = require("jquery");
(function () {
    'use strict';
    var jq = $.noConflict();
    function addFlag(FlagType, OriginText, fontColor) {
        let changedText = OriginText;
        if (fontColor !== null)
            changedText = `<font color = "${fontColor}">` + OriginText + `</font>`;
        switch (FlagType) {
            case "Tip1": changedText = `🍃${changedText}🍃`;
            case "Tip2": changedText = `🍁${changedText}🍁`;
            case "Tip3": changedText = `🍂${changedText}🍂`;
            case "pass": changedText = `✅${changedText}✅`;
            case "warning": changedText = `❌${changedText}❌`;
            case "needCheck": changedText = `🔔${changedText}🔔`;
        }
        return changedText;
    }
    function checkTitle(str) {
        var regex = /^\[(电信|联通|移动|双线|多线|教育|港澳|台湾|欧洲|美洲|亚太|内网)\]([0-9a-zA-Z\u2160-\u217f\u3040-\u30ff\u31f0-\u31ff\u4e00-\u9fa5]|\s)+——([^\u2014\u2588\u2589\u3013\uD83C\uDF00-\uDFFF\uD83D\uDC00-\uDE4F\uD83D\uDE80-\uDEFF\u2700-\u27BF\uFE0F]|(\s))+\[(\-?((1\.\d{1,2}(\.(\d{1,2}|X|x))?)|(\d{2}w\d{2}[a-z]))){1,2}\]$/;
        if (regex.test(str))
            return true;
        else
            return false;
    }
    //jq主函数
    $(function () {
    });
})();
