const canvas = document.getElementById("gameCanvas");

const ctx = canvas.getContext("2d");

canvas.width = 800;
canvas.height =600;

const player ={
    x:375,
    y: 275,
    width: 50,
    height: 50,
    speed: 5,
    color: "blue"
}

const keys ={};
document.addEventListener("keydown",function(event){
    keys[event.key] = true;
});

document.addEventListener("keyup", function(event){
    keys[event.key] = false;
});

function update(){
    if(keys["w"]){
        player.y-=player.speed;
    }
    if(keys["s"]){
        player.y+=player.speed;
    }
    if(keys["a"]){
        player.x-=player.speed;
    }
    if(keys["d"]){
        player.x+=player.speed;
    }

    if(player.x<0){
        player.x=0;
    }

    if(player.x + player.width> canvas.width){
        player.x = canvas.width - player.width;
    }

    if(player.y<0){
        player.y=0;
    }

    if(player.y + player.height> canvas.height){
        player.y = canvas.height - player.height;
    }
    
}

function draw(){
    ctx.clearRect(0,0,canvas.width, canvas.height);
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.width, player.height);

}

function gameLoop(){
    update();
    draw();
    requestAnimationFrame(gameLoop);
}
gameLoop();
