var MapNode = (function () {
    function MapNode(x, y, _walkable) {
        this.costMultiplier = 1.0; //算法乘数
        this.x = x;
        this.y = y;
        this.walkable = _walkable;
    }
    var d = __define,c=MapNode,p=c.prototype;
    return MapNode;
}());
egret.registerClass(MapNode,'MapNode');
//# sourceMappingURL=Node.js.map