const canvas = document.getElementById("gameCanvas");

const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let gameOver = false;

let score =0;

const player ={
    x:375,
    y: 275,
    width: 50,
    height: 50,
    speed: 5,
    health: 100,
    color: "blue",
    lastHit: 0,
    damageCooldown: 500
}

const mouse = {
    x: 0,
    y: 0
};

const bullets = [];
const zombies = [];

const zombie = {
    x: 100,
    y: 100,
    width: 40,
    height: 40,
    speed: 1,
};

function updateZombies() {

    for (let i = 0; i < zombies.length; i++) {

        const zombie = zombies[i];

        const dx = player.x - zombie.x;
        const dy = player.y - zombie.y;

        const distance = Math.sqrt(dx * dx + dy * dy);

        if(distance >0){
            zombie.x += (dx / distance) * zombie.speed;
            zombie.y += (dy / distance) * zombie.speed;
        }
    }
}

zombies.push(zombie);

function drawZombies() {

    ctx.fillStyle = "red";

    for (let i = 0; i < zombies.length; i++) {

        ctx.fillRect(
            zombies[i].x,
            zombies[i].y,
            zombies[i].width,
            zombies[i].height
        );
    }
}

function spawnZombie(){
    const zombie ={
        x: 0,
        y:0,
        width: 40,
        height: 40,
        speed: 1
    };
    const side = Math.floor(Math.random()*4);
    if(side === 0){
        zombie.x = Math.random()*canvas.width;
        zombie.y = 0;
    }
    else if(side ===1){
        zombie.x = Math.random()*canvas.width;
        zombie.y = canvas.height- zombie.height;
    }
    else if(side ===2){
        zombie.x =0;
        zombie.y = Math.random()*canvas.height;

    }
    else{
        zombie.x = canvas.width - zombie.width;
        zombie.y = Math.random()*canvas.height;
    }

    zombies.push(zombie);
}

setInterval(spawnZombie, 2000);

function checkZombieCollision() {
    for (let zombie of zombies) {
        if (isColliding(player, zombie)) {
            let currentTime = Date.now();

            if (currentTime - player.lastHit >= player.damageCooldown) {
                player.health -= 10;
                player.lastHit = currentTime;

                if (player.health <= 0) {
                    player.health = 0;
                    gameOver = true;
                }
            }
        }
    }
}

function drawHealth(){
    ctx.fillStyle ="gray";
    ctx.fillRect(20,20, 200, 20);

    ctx.fillStyle = "lime";
    ctx.fillRect(20,20,player.health*2,20);

    ctx.strokeStyle = "white";
    ctx.strokeRect(20, 20, 200, 20);

    ctx.fillStyle = "white";
    ctx.font = "16px Arial";
    ctx.fillText("Health: " + player.health, 20, 60);
}

function drawScore(){
    ctx.fillStyle ="white";
    ctx.font = "24px Arial";
    ctx.textAlign = "right";
    ctx.fillText("Score:" +score, canvas.width-10, 40);

    ctx.textAlign = "left";
}

canvas.addEventListener("click", function() {

    const angle = getAngle();

    const bullet = {
        x: player.x + player.width / 2,
        y: player.y + player.height / 2,
        speed: 10,
        dx: Math.cos(angle),
        dy: Math.sin(angle),
        size: 5
    };

    bullets.push(bullet);
});

function updateBullets() {

    for (let i = bullets.length - 1; i >= 0; i--) {

        const bullet = bullets[i];

        bullet.x += bullet.dx * bullet.speed;
        bullet.y += bullet.dy * bullet.speed;

        for (let j = zombies.length - 1; j >= 0; j--) {

            const zombie = zombies[j];

            if (isColliding(bullet, zombie)) {

                score += 10;

                zombies.splice(j, 1);

                bullets.splice(i, 1);

                break;
            }
        }


        if (
            i < bullets.length &&
            (
                bullet.x < 0 ||
                bullet.x > canvas.width ||
                bullet.y < 0 ||
                bullet.y > canvas.height
            )
        ) {
            bullets.splice(i, 1);
        }
    }
}

function drawBullets() {

    ctx.fillStyle = "yellow";

    for (let i = 0; i < bullets.length; i++) {

        ctx.beginPath();

        ctx.arc(
            bullets[i].x,
            bullets[i].y,
            bullets[i].size,
            0,
            Math.PI * 2
        );

        ctx.fill();
    }
}

canvas.addEventListener("mousemove", function(event){
    mouse.x = event.clientX;
    mouse.y = event.clientY;
});

function getAngle() {

    const dx = mouse.x - player.x;
    const dy = mouse.y - player.y;

    return Math.atan2(dy, dx);
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

    if(player.x > canvas.width - player.width){
        player.x = canvas.width - player.width;
    }

    if(player.y<0){
        player.y=0;
    }

    if(player.y > canvas.height - player.height){
        player.y = canvas.height - player.height;
    }
    
}

function isColliding(a, b) {

    const aWidth = a.width || a.size;
    const aHeight = a.height || a.size;

    const bWidth = b.width || b.size;
    const bHeight = b.height || b.size;

    return (
        a.x < b.x + bWidth &&
        a.x + aWidth > b.x &&
        a.y < b.y + bHeight &&
        a.y + aHeight > b.y
    );
}

function draw(){  
    ctx.clearRect(0,0,canvas.width, canvas.height);
    const angle = getAngle();
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.width, player.height);
    ctx.save();
    ctx.translate(
        player.x + player.width / 2,
        player.y + player.height / 2
    );
    ctx.rotate(angle);
    ctx.fillStyle = "black";
    ctx.fillRect(0, -5, 30, 10);
    ctx.restore();
}

function drawGameOver() {

    ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "red";
    ctx.font = "50px Arial";
    ctx.textAlign = "center";

    ctx.fillText(
        "GAME OVER",
        canvas.width / 2,
        canvas.height / 2
    );

    ctx.fillStyle = "white";
    ctx.font = "20px Arial";

    ctx.fillText(
        "Refresh the page to play again",
        canvas.width / 2,
        canvas.height / 2 + 50
    );

    ctx.textAlign = "left";
}

function gameLoop() {
    if (!gameOver) {
        update();
        updateBullets();
        updateZombies();
        checkZombieCollision();
        draw();
        drawBullets();
        drawZombies();
        drawHealth();
        drawScore();
    } else {
        drawGameOver();
    }

    requestAnimationFrame(gameLoop);
}

gameLoop();

