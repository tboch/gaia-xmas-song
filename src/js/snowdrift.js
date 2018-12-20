//// Snowdrift ////
//// An object accumulating snow at the bottom of the crystal ball ////

function Snowdrift(scene, congereWidth) {
    this.scene = scene;
    this.congereWidth = congereWidth;

    this.snowHeightPerColumn = [];

    for (var k = 0; k < this.congereWidth; k++) {
        this.snowHeightPerColumn[k] = 0;
    }

    this.colorIdx = 0;
    this.colors = ['#ebeef3', '#f9fafc', '#edf8f0', '#e1e8ef', '#ffffff'];
    this.nbFlakes = 0;

    var c = document.createElement('canvas');
    c.setAttribute('id', 'congere');
    c.width = scene.width;
    c.height = scene.height;
    c.style.zIndex = 1100;
    c.style.position = 'absolute';
    c.style.display = 'block';
    c.style.top = '0px';
    c.style.pointerEvents = 'none';
    this.canvas = c;
    this.ctx = this.canvas.getContext('2d');
    this.ctx.fillStyle = this.colors[this.colorIdx];
}

Snowdrift.prototype.addSnowflake = function (x) {


    var heightAtX = this.snowHeightPerColumn[x];
    if (heightAtX>this.scene.height/2) {
        this.reset();
    }
    var heightAtXLeftNeighbour = (x > 0) ? this.snowHeightPerColumn[x - 1] : undefined;
    var heightAtXRightNeighbour = (x < this.congereWidth - 1) ? this.snowHeightPerColumn[x + 1] : undefined;

    var flakeSplitted = false;
    // if too much difference with neighbours, the flake is splitted between the right and left neighbour
    if (heightAtXLeftNeighbour !== undefined && heightAtX - heightAtXLeftNeighbour > 3) {
        this.snowHeightPerColumn[x - 1]++;
        this.drawFlake(x - 1);
        flakeSplitted = true;
    }
    if (heightAtXRightNeighbour !== undefined && heightAtX - heightAtXRightNeighbour > 3) {
        this.snowHeightPerColumn[x + 1]++;
        this.drawFlake(x + 1);
        flakeSplitted = true;
    }
    if (!flakeSplitted) {
        this.snowHeightPerColumn[x]++;
        this.drawFlake(x);
    }
};

Snowdrift.prototype.drawFlake = function(x) {
    var xCongereItem = this.scene.width / 2 - this.congereWidth / 2 + x, yCongereItem = this.scene.height - (this.scene.cy - this.scene.radius) - this.snowHeightPerColumn[x];
    var inCircle = (Math.pow(xCongereItem - this.scene.cx, 2) + Math.pow(yCongereItem - this.scene.cy, 2)) <= Math.pow(this.scene.radius, 2);
    if (inCircle) {
        if (this.nbFlakes%3000==0) {
            this.colorIdx = (this.colorIdx+1) % this.colors.length;
            this.ctx.fillStyle = this.colors[this.colorIdx];
        }
        this.ctx.fillRect(xCongereItem, yCongereItem, 1, 1);
        this.nbFlakes++;
    }
};

Snowdrift.prototype.reset = function() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (var k = 0; k < this.congereWidth; k++) {
        this.snowHeightPerColumn[k] = 0;
    }
}