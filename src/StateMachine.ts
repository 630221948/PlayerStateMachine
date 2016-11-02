interface State{
    getStateName():String;
    setStateName(Statename:String);
    onEnter();
    onExit();
    //moveFunction(e:egret.Event);
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
    public RatioX:number = 0;
    public RatioY:number = 0;

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
        if(this.currentState.getStateName() != s){
            this.currentState.onExit();
            //this.currentState.setStateName(s);
            this.currentState.onEnter();
        }
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

    //public moveFunction(e:egret.Event){};
}

class Movestate implements State{
    public mac:StateMachine;
    //private speed:number = 0.5;
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

    /*public moveFunction(e:egret.Event){
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
    };*/
}