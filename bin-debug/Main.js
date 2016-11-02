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
        //this.stage.stageHeight = 1000;
        //this.stage.stageWidth = 1000;
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
        //var gridMap = new GridMap(this);
        this.touchEnabled = true;
        var m = new StateMachine(this, playeridle_mc, PlayerContainer, playerwalk_mc);
        //m.setState("move");
        this.addEventListener(egret.TouchEvent.TOUCH_TAP, function (e) {
            m.x = e.stageX;
            m.y = e.stageY;
            console.log("TargetX==============" + e.stageX);
            m.setState("move");
            var MaxLength = 0;
            var RatioX;
            var RatioY;
            var dx = e.stageX - PlayerContainer.x;
            var dy = e.stageY - PlayerContainer.y;
            MaxLength = Math.pow(dx * dx + dy * dy, 1 / 2);
            RatioX = dx / MaxLength;
            RatioY = dy / MaxLength;
            m.RatioX = RatioX;
            m.RatioY = RatioY;
            //this.addEventListener(egret.Event.ENTER_FRAME,moveFunction,this);
            m.timeOnEnterFrame = egret.getTimer();
            egret.startTick(moveFunction, _this);
            /*this.addEventListener(egret.Event.ENTER_FRAME,(e)=>{
                m.currentState.moveFunction(e);
                console.log("ContainerCoordinate=============="+Math.floor(PlayerContainer.x));
                console.log("TargetCoordinate=============="+m.x);
                if(Math.floor(PlayerContainer.x) == m.x &&PlayerContainer.y == m.y){
                    console.log("Im IN!!!!")
                    this.removeEventListener(egret.Event.ENTER_FRAME,(e)=>{
                        m.currentState.moveFunction(e);
                    },this);
                    m.setState("stand");
                }
            },this);*/
            //console.log(m.image.x);
            /*if(PlayerContainer.x == e.stageX && PlayerContainer.y == e.stageY){
                this.removeEventListener(egret.Event.ENTER_FRAME,m.currentState.moveFunction,this);
                m.setState("stand");
            }*/
        }, this);
        function moveFunction() {
            var now = egret.getTimer();
            var time = m.timeOnEnterFrame;
            var pass = now - time;
            var speed = 0.3;
            //var dx = this.mac.x - this.mac.PlayerContainer.x; 
            //var dy = this.mac.y - this.mac.PlayerContainer.y;
            console.log("Ratio==============" + m.RatioX);
            m.PlayerContainer.x += speed * pass * m.RatioX;
            m.PlayerContainer.y += speed * pass * m.RatioY;
            console.log("ContainerCoordinate==============" + m.PlayerContainer.x);
            console.log("TargetCoordinate==============" + m.x);
            m.timeOnEnterFrame = egret.getTimer();
            console.log(pass);
            if (m.PlayerContainer.y - m.y < 6 && m.PlayerContainer.y - m.y > -6) {
                console.log("Im IN!!!!");
                egret.stopTick(moveFunction, this);
                m.setState("stand");
            }
            return false;
            //console.log("ContainerCoordinate=============="+this.mac.PlayerContainer.x);
            //console.log("TargetCoordinate=============="+this.mac.x);        
        }
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
//# sourceMappingURL=Main.js.map