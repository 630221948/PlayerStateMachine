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

class Main extends egret.DisplayObjectContainer {

    /**
     * 加载进度界面
     * Process interface loading
     */
    private loadingView:LoadingUI;

    public constructor() {
        super();
        this.addEventListener(egret.Event.ADDED_TO_STAGE, this.onAddToStage, this);
    }

    private onAddToStage(event:egret.Event) {
        //设置加载进度界面
        //Config to load process interface
        this.loadingView = new LoadingUI();
        this.stage.addChild(this.loadingView);

        //初始化Resource资源加载库
        //initiate Resource loading library
        RES.addEventListener(RES.ResourceEvent.CONFIG_COMPLETE, this.onConfigComplete, this);
        RES.loadConfig("resource/default.res.json", "resource/");
    }

    /**
     * 配置文件加载完成,开始预加载preload资源组。
     * configuration file loading is completed, start to pre-load the preload resource group
     */
    private onConfigComplete(event:RES.ResourceEvent):void {
        RES.removeEventListener(RES.ResourceEvent.CONFIG_COMPLETE, this.onConfigComplete, this);
        RES.addEventListener(RES.ResourceEvent.GROUP_COMPLETE, this.onResourceLoadComplete, this);
        RES.addEventListener(RES.ResourceEvent.GROUP_LOAD_ERROR, this.onResourceLoadError, this);
        RES.addEventListener(RES.ResourceEvent.GROUP_PROGRESS, this.onResourceProgress, this);
        RES.addEventListener(RES.ResourceEvent.ITEM_LOAD_ERROR, this.onItemLoadError, this);
        RES.loadGroup("preload");
    }

    /**
     * preload资源组加载完成
     * Preload resource group is loaded
     */
    private onResourceLoadComplete(event:RES.ResourceEvent):void {
        if (event.groupName == "preload") {
            this.stage.removeChild(this.loadingView);
            RES.removeEventListener(RES.ResourceEvent.GROUP_COMPLETE, this.onResourceLoadComplete, this);
            RES.removeEventListener(RES.ResourceEvent.GROUP_LOAD_ERROR, this.onResourceLoadError, this);
            RES.removeEventListener(RES.ResourceEvent.GROUP_PROGRESS, this.onResourceProgress, this);
            RES.removeEventListener(RES.ResourceEvent.ITEM_LOAD_ERROR, this.onItemLoadError, this);
            this.createGameScene();
        }
    }

    /**
     * 资源组加载出错
     *  The resource group loading failed
     */
    private onItemLoadError(event:RES.ResourceEvent):void {
        console.warn("Url:" + event.resItem.url + " has failed to load");
    }

    /**
     * 资源组加载出错
     *  The resource group loading failed
     */
    private onResourceLoadError(event:RES.ResourceEvent):void {
        //TODO
        console.warn("Group:" + event.groupName + " has failed to load");
        //忽略加载失败的项目
        //Ignore the loading failed projects
        this.onResourceLoadComplete(event);
    }

    /**
     * preload资源组加载进度
     * Loading process of preload resource group
     */
    private onResourceProgress(event:RES.ResourceEvent):void {
        if (event.groupName == "preload") {
            this.loadingView.setProgress(event.itemsLoaded, event.itemsTotal);
        }
    }

    private textfield:egret.TextField;

    /**
     * 创建游戏场景
     * Create a game scene
     */
    private createGameScene():void {

        var sky:egret.Bitmap = this.createBitmapByName("bg_jpg");
        this.addChild(sky);
        var stageW:number = this.stage.stageWidth;
        var stageH:number = this.stage.stageHeight;
        sky.width = stageW;
        sky.height = stageH;

        var idledata = RES.getRes("PLAYER_IDLE_json");
        var idletxtr = RES.getRes("PLAYER_IDLE_png");
        var idle_mcFactory:egret.MovieClipDataFactory = new egret.MovieClipDataFactory( idledata, idletxtr );
        var playeridle_mc:egret.MovieClip = new egret.MovieClip( idle_mcFactory.generateMovieClipData( "Anim0" ) );
        
        var walkdata = RES.getRes("PLAYER_WALK_json");
        var walktxtr = RES.getRes("PLAYER_WALK_png");
        var walk_mcFactory:egret.MovieClipDataFactory = new egret.MovieClipDataFactory( walkdata, walktxtr );
        var playerwalk_mc:egret.MovieClip = new egret.MovieClip( walk_mcFactory.generateMovieClipData( "Anim1" ) );
        //this.addChild(playeridle_mc);
        //playeridle_mc.gotoAndPlay(1,-1);

        var PlayerContainer = new egret.DisplayObjectContainer();
        this.addChild(PlayerContainer);
        PlayerContainer.addChild(playeridle_mc);
        PlayerContainer.addChild(playerwalk_mc);
        playerwalk_mc.gotoAndPlay(1,-1);
        playeridle_mc.gotoAndPlay(1,-1);
        playeridle_mc.alpha = 0;
        playerwalk_mc.alpha = 0;
        //PlayerContainer.alpha = 0;



        this.touchEnabled = true;
        var m:StateMachine = new StateMachine(this,playeridle_mc,PlayerContainer,playerwalk_mc);
        //m.setState("move");
        
        this.addEventListener(egret.TouchEvent.TOUCH_TAP,(e)=>{
            m.x = e.stageX;
            m.y = e.stageY;
            console.log("TargetX=============="+e.stageX);
            m.setState("move");

            var dx = e.stageX - PlayerContainer.x;
            var dy = e.stageY - PlayerContainer.y;
            var Ratio = dx/dy;
            m.Ratio = Ratio;
            this.addEventListener(egret.Event.ENTER_FRAME,moveFunction,this);
            m.timeOnEnterFrame = egret.getTimer();

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
        },this);

        function moveFunction(e:egret.Event):void{
            var now = egret.getTimer();
            var time = m.timeOnEnterFrame;
            var pass = now - time;
            var speed = 0.05;
            //var dx = this.mac.x - this.mac.PlayerContainer.x; 
            //var dy = this.mac.y - this.mac.PlayerContainer.y;
            console.log("Ratio=============="+m.Ratio);
            m.PlayerContainer.x += speed*pass;
            m.PlayerContainer.y += speed*pass*m.Ratio;
            console.log("ContainerCoordinate=============="+m.PlayerContainer.x);
            console.log("TargetCoordinate=============="+m.x);
            m.timeOnEnterFrame = egret.getTimer();
            if(Math.floor(m.PlayerContainer.x) == m.x){
                    console.log("Im IN!!!!")
                    this.removeEventListener(egret.Event.ENTER_FRAME,moveFunction,this);
                    m.setState("stand");
            }

            //console.log("ContainerCoordinate=============="+this.mac.PlayerContainer.x);
            //console.log("TargetCoordinate=============="+this.mac.x);        
        }

    }

    /**
     * 根据name关键字创建一个Bitmap对象。name属性请参考resources/resource.json配置文件的内容。
     * Create a Bitmap object according to name keyword.As for the property of name please refer to the configuration file of resources/resource.json.
     */
    private createBitmapByName(name:string):egret.Bitmap {
        var result = new egret.Bitmap();
        var texture:egret.Texture = RES.getRes(name);
        result.texture = texture;
        return result;
    }

}

interface State{
    getStateName():String;
    setStateName(Statename:String);
    onEnter();
    onExit();
    moveFunction(e:egret.Event);
}

class StateMachine{
    
    // currentState:State;
    
   // private s: String;
    public x:number;
    public y:number;
    public stage:egret.DisplayObjectContainer;
    public idleanim:egret.MovieClip;
    public walkanim:egret.MovieClip;
    public currentState:State;
    public PlayerContainer:egret.DisplayObjectContainer;
    public standstate:Standstate;
    public movestate:Movestate;
    public timeOnEnterFrame:number = 0;
    public Ratio:number = 0;

    constructor(stage:egret.DisplayObjectContainer,idleanim:egret.MovieClip,PlayerContainer:egret.DisplayObjectContainer,walkanim:egret.MovieClip){
        this.stage = stage ;
        this.idleanim = idleanim ;
        this.walkanim = walkanim ;
        this.PlayerContainer = PlayerContainer ;
        this.standstate = new Standstate(this) ;
        this.movestate = new Movestate(this) ;
        this.currentState = this.standstate ;
        this.currentState.onEnter() ;
    }
    setState(s: String){
        console.log("当前状态："+this.currentState.getStateName());
        console.log("即将进入状态："+s);  
        /*if(this.currentState.getStateName() == "stand"){
            this.currentState.onExit();
        }
        else if(this.currentState.getStateName() == "move"){
            this.currentState.onExit();
        }*/
        this.currentState.onExit();
        this.currentState.setStateName(s);
        this.currentState.onEnter();
    }
}

class Standstate implements State{
    public mac:StateMachine;
    constructor(mac:StateMachine){
        this.mac = mac;
    }
    s:String="stand";
    public getStateName():String{
        return this.s;
    }
    public setStateName(Statename:String){
        this.s = Statename;
    }
    public onEnter():void{
        console.log("进入stand");
        //this.mac.PlayerContainer.addChild(this.mac.idleanim);
        this.mac.idleanim.alpha = 1;
        //this.mac.idleanim.gotoAndPlay(1,-1);
    }
    public onExit():void{
        this.mac.idleanim.alpha = 0;
        this.mac.currentState = this.mac.movestate;
        console.log("退出stand");
    }

    public moveFunction(e:egret.Event){};
}

class Movestate implements State{
    public mac:StateMachine;
    private speed:number = 0.05;
    constructor(mac:StateMachine){
        this.mac = mac;
    }
    s:String="move";
    public getStateName():String{
        return this.s;
    }
    public setStateName(Statename:String){
        this.s = Statename;
    }
    public onEnter():void{
        //MoveFunction();
        //this.mac.PlayerContainer.addChild(this.mac.walkanim);
        //this.mac.walkanim.gotoAndPlay(1,-1);
        this.mac.walkanim.alpha = 1;      
        //egret.Tween.get( this.mac.PlayerContainer ).to( {x:this.mac.x,y:this.mac.y}, 3000, egret.Ease.sineIn );
        //this.mac.PlayerContainer.x = this.mac.x;
        //this.mac.PlayerContainer.y = this.mac.y;
        console.log("进入move");
    }
    public onExit():void{
        console.log("退出move");
        this.mac.walkanim.alpha = 0;
        this.mac.currentState = this.mac.standstate;
    }

    public moveFunction(e:egret.Event){
        //console.log("TargetXTest=============="+this.mac.x);
        var now = egret.getTimer();
        var time = this.mac.timeOnEnterFrame;
        var pass = now - time;
        //var dx = this.mac.x - this.mac.PlayerContainer.x; 
        //var dy = this.mac.y - this.mac.PlayerContainer.y;
        console.log("Ratio=============="+this.mac.Ratio);

        this.mac.PlayerContainer.x += this.speed*pass;
        this.mac.PlayerContainer.y += this.speed*pass*this.mac.Ratio;
        this.mac.timeOnEnterFrame = egret.getTimer();
        //console.log("ContainerCoordinate=============="+this.mac.PlayerContainer.x);
        //console.log("TargetCoordinate=============="+this.mac.x);
    };
}



