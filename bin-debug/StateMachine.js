var StateMachine = (function () {
    function StateMachine(stage, idleanim, PlayerContainer, walkanim) {
        this.timeOnEnterFrame = 0;
        this.RatioX = 0;
        this.RatioY = 0;
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
        if (this.currentState.getStateName() != s) {
            this.currentState.onExit();
            //this.currentState.setStateName(s);
            this.currentState.onEnter();
        }
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
    return Standstate;
}());
egret.registerClass(Standstate,'Standstate',["State"]);
var Movestate = (function () {
    //private speed:number = 0.5;
    function Movestate(mac) {
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
    return Movestate;
}());
egret.registerClass(Movestate,'Movestate',["State"]);
//# sourceMappingURL=StateMachine.js.map