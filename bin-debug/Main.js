//////////////////////////////////////////////////////////////////////////////////////
//
//  Copyright (c) 2014-present, Egret Technology.
//  All rights reserved.
//  Redistribution and use in source and binary forms, with or without
//  modification, are permitted provided that the following conditions are met:
//
//     * Redistributions of source code must retain the above copyright
//       notice, this list of conditions and the following disclaimer.
//     * Redistributions in binary form must reproduce the above copyright
//       notice, this list of conditions and the following disclaimer in the
//       documentation and/or other materials provided with the distribution.
//     * Neither the name of the Egret nor the
//       names of its contributors may be used to endorse or promote products
//       derived from this software without specific prior written permission.
//
//  THIS SOFTWARE IS PROVIDED BY EGRET AND CONTRIBUTORS "AS IS" AND ANY EXPRESS
//  OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
//  OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
//  IN NO EVENT SHALL EGRET AND CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT,
//  INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
//  LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;LOSS OF USE, DATA,
//  OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
//  LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
//  NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
//  EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
//
//////////////////////////////////////////////////////////////////////////////////////
var Main = (function (_super) {
    __extends(Main, _super);
    function Main() {
        _super.call(this);
        this.addEventListener(egret.Event.ADDED_TO_STAGE, this.onAddToStage, this);
    }
    var d = __define,c=Main,p=c.prototype;
    p.onAddToStage = function (event) {
        //设置加载进度界面
        //Config to load process interface
        this.loadingView = new LoadingUI();
        this.stage.addChild(this.loadingView);
        //初始化Resource资源加载库
        //initiate Resource loading library
        RES.addEventListener(RES.ResourceEvent.CONFIG_COMPLETE, this.onConfigComplete, this);
        RES.loadConfig("resource/default.res.json", "resource/");
    };
    /**
     * 配置文件加载完成,开始预加载preload资源组。
     * configuration file loading is completed, start to pre-load the preload resource group
     */
    p.onConfigComplete = function (event) {
        RES.removeEventListener(RES.ResourceEvent.CONFIG_COMPLETE, this.onConfigComplete, this);
        RES.addEventListener(RES.ResourceEvent.GROUP_COMPLETE, this.onResourceLoadComplete, this);
        RES.addEventListener(RES.ResourceEvent.GROUP_LOAD_ERROR, this.onResourceLoadError, this);
        RES.addEventListener(RES.ResourceEvent.GROUP_PROGRESS, this.onResourceProgress, this);
        RES.addEventListener(RES.ResourceEvent.ITEM_LOAD_ERROR, this.onItemLoadError, this);
        RES.loadGroup("preload");
    };
    /**
     * preload资源组加载完成
     * Preload resource group is loaded
     */
    p.onResourceLoadComplete = function (event) {
        if (event.groupName == "preload") {
            this.stage.removeChild(this.loadingView);
            RES.removeEventListener(RES.ResourceEvent.GROUP_COMPLETE, this.onResourceLoadComplete, this);
            RES.removeEventListener(RES.ResourceEvent.GROUP_LOAD_ERROR, this.onResourceLoadError, this);
            RES.removeEventListener(RES.ResourceEvent.GROUP_PROGRESS, this.onResourceProgress, this);
            RES.removeEventListener(RES.ResourceEvent.ITEM_LOAD_ERROR, this.onItemLoadError, this);
            this.createGameScene();
        }
    };
    /**
     * 资源组加载出错
     *  The resource group loading failed
     */
    p.onItemLoadError = function (event) {
        console.warn("Url:" + event.resItem.url + " has failed to load");
    };
    /**
     * 资源组加载出错
     *  The resource group loading failed
     */
    p.onResourceLoadError = function (event) {
        //TODO
        console.warn("Group:" + event.groupName + " has failed to load");
        //忽略加载失败的项目
        //Ignore the loading failed projects
        this.onResourceLoadComplete(event);
    };
    /**
     * preload资源组加载进度
     * Loading process of preload resource group
     */
    p.onResourceProgress = function (event) {
        if (event.groupName == "preload") {
            this.loadingView.setProgress(event.itemsLoaded, event.itemsTotal);
        }
    };
    /**
     * 创建游戏场景
     * Create a game scene
     */
    p.createGameScene = function () {
        var _this = this;
        var sky = this.createBitmapByName("bg_jpg");
        this.addChild(sky);
        var stageW = this.stage.stageWidth;
        var stageH = this.stage.stageHeight;
        sky.width = stageW;
        sky.height = stageH;
        var idledata = RES.getRes("PLAYER_IDLE_json");
        var idletxtr = RES.getRes("PLAYER_IDLE_png");
        var idle_mcFactory = new egret.MovieClipDataFactory(idledata, idletxtr);
        var playeridle_mc = new egret.MovieClip(idle_mcFactory.generateMovieClipData("Anim0"));
        var walkdata = RES.getRes("PLAYER_WALK_json");
        var walktxtr = RES.getRes("PLAYER_WALK_png");
        var walk_mcFactory = new egret.MovieClipDataFactory(walkdata, walktxtr);
        var playerwalk_mc = new egret.MovieClip(walk_mcFactory.generateMovieClipData("Anim1"));
        //this.addChild(playeridle_mc);
        //playeridle_mc.gotoAndPlay(1,-1);
        var PlayerContainer = new egret.DisplayObjectContainer();
        this.addChild(PlayerContainer);
        PlayerContainer.addChild(playeridle_mc);
        PlayerContainer.addChild(playerwalk_mc);
        playerwalk_mc.gotoAndPlay(1, -1);
        playeridle_mc.gotoAndPlay(1, -1);
        playeridle_mc.alpha = 0;
        playerwalk_mc.alpha = 0;
        //PlayerContainer.alpha = 0;
        this.touchEnabled = true;
        var m = new StateMachine(this, playeridle_mc, PlayerContainer, playerwalk_mc);
        //m.setState("move");
        this.addEventListener(egret.TouchEvent.TOUCH_TAP, function (e) {
            m.x = e.stageX;
            m.y = e.stageY;
            m.setState("move");
            m.timeOnEnterFrame = egret.getTimer();
            _this.addEventListener(egret.Event.ENTER_FRAME, m.currentState.moveFunction, _this);
            //console.log(m.image.x);
            if (PlayerContainer.x == e.stageX && PlayerContainer.y == e.stageY) {
                _this.removeEventListener(egret.Event.ENTER_FRAME, m.currentState.moveFunction, _this);
                m.setState("stand");
            }
        }, this);
    };
    /**
     * 根据name关键字创建一个Bitmap对象。name属性请参考resources/resource.json配置文件的内容。
     * Create a Bitmap object according to name keyword.As for the property of name please refer to the configuration file of resources/resource.json.
     */
    p.createBitmapByName = function (name) {
        var result = new egret.Bitmap();
        var texture = RES.getRes(name);
        result.texture = texture;
        return result;
    };
    return Main;
}(egret.DisplayObjectContainer));
egret.registerClass(Main,'Main');
var StateMachine = (function () {
    function StateMachine(stage, idleanim, PlayerContainer, walkanim) {
        this.timeOnEnterFrame = 0;
        this.stage = stage;
        this.idleanim = idleanim;
        this.walkanim = walkanim;
        this.PlayerContainer = PlayerContainer;
        this.standstate = new Standstate(this);
        this.movestate = new Movestate(this);
        this.currentState = this.standstate;
        this.currentState.onEnter();
    }
    var d = __define,c=StateMachine,p=c.prototype;
    p.setState = function (s) {
        console.log("当前状态：" + this.currentState.getStateName());
        console.log("即将进入状态：" + s);
        /*if(this.currentState.getStateName() == "stand"){
            this.currentState.onExit();
        }
        else if(this.currentState.getStateName() == "move"){
            this.currentState.onExit();
        }*/
        this.currentState.onExit();
        this.currentState.setStateName(s);
        this.currentState.onEnter();
    };
    return StateMachine;
}());
egret.registerClass(StateMachine,'StateMachine');
var Standstate = (function () {
    function Standstate(mac) {
        this.s = "stand";
        this.mac = mac;
    }
    var d = __define,c=Standstate,p=c.prototype;
    p.getStateName = function () {
        return this.s;
    };
    p.setStateName = function (Statename) {
        this.s = Statename;
    };
    p.onEnter = function () {
        console.log("进入stand");
        //this.mac.PlayerContainer.addChild(this.mac.idleanim);
        this.mac.idleanim.alpha = 1;
        //this.mac.idleanim.gotoAndPlay(1,-1);
    };
    p.onExit = function () {
        this.mac.idleanim.alpha = 0;
        this.mac.currentState = this.mac.movestate;
        console.log("退出stand");
    };
    p.moveFunction = function (e) { };
    ;
    return Standstate;
}());
egret.registerClass(Standstate,'Standstate',["State"]);
var Movestate = (function () {
    function Movestate(mac) {
        this.speed = 0.05;
        this.s = "move";
        this.mac = mac;
    }
    var d = __define,c=Movestate,p=c.prototype;
    p.getStateName = function () {
        return this.s;
    };
    p.setStateName = function (Statename) {
        this.s = Statename;
    };
    p.onEnter = function () {
        //MoveFunction();
        //this.mac.PlayerContainer.addChild(this.mac.walkanim);
        //this.mac.walkanim.gotoAndPlay(1,-1);
        this.mac.walkanim.alpha = 1;
        //egret.Tween.get( this.mac.PlayerContainer ).to( {x:this.mac.x,y:this.mac.y}, 3000, egret.Ease.sineIn );
        //this.mac.PlayerContainer.x = this.mac.x;
        //this.mac.PlayerContainer.y = this.mac.y;
        console.log("进入move");
    };
    p.onExit = function () {
        console.log("退出move");
        this.mac.walkanim.alpha = 0;
        this.mac.currentState = this.mac.standstate;
    };
    p.moveFunction = function (e) {
        var now = egret.getTimer();
        var time = this.mac.timeOnEnterFrame;
        var pass = now - time;
        var dx = this.mac.x - this.mac.PlayerContainer.x;
        var dy = this.mac.y - this.mac.PlayerContainer.y;
        this.mac.PlayerContainer.x += this.speed * pass;
        this.mac.PlayerContainer.x += this.speed * pass * (dx / dy);
        this.mac.timeOnEnterFrame = egret.getTimer();
    };
    ;
    return Movestate;
}());
egret.registerClass(Movestate,'Movestate',["State"]);
//# sourceMappingURL=Main.js.map