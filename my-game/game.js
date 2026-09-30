const canvas = document.getElementById("gameCanvas");

const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let gameOver = false;

let score =0;
let wave = 1;
let zombiesToSpawn = 5;
let zombiesSpawned = 0;
let waveInProgress = true;
let waveMessage = true;
let waveMessageTime = 0;

const player = {
    x: 375,
    y: 275,
    width: 30,
    height: 30,
    speed: 5,
    sprintSpeed: 8,
    health: 100,
    stamina: 100,
    maxStamina: 100,
    color: "blue",
    lastHit: 0,
    damageCooldown: 500
};

const mouse = {
    x: 0,
    y: 0
};

const bullets = [];
const zombies = [];
const healthPacks = [];

function spawnHealthPack() {

    const healthPack = {
        x: Math.random() * (canvas.width - 25),
        y: Math.random() * (canvas.height - 25),
        width: 25,
        height: 25,
        healAmount: 20,
        createdAt: Date.now()
    };

    healthPacks.push(healthPack);
}

setInterval(spawnHealthPack, 10000);


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
    const zombie = {
        x: 0,
        y: 0,
        width: 40,
        height: 40,
        speed: 1 + (wave - 1) * 0.2,
        health: wave
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

function startWave() {
    zombiesToSpawn = 5 + (wave - 1) * 3;
    zombiesSpawned = 0;
    waveInProgress = true;

    waveMessage = true;
    waveMessageTime = Date.now();

    spawnNextZombie();
}

function spawnNextZombie() {
    if (zombiesSpawned < zombiesToSpawn) {
        spawnZombie();
        zombiesSpawned++;

        setTimeout(spawnNextZombie, 1500);
    }
}

function checkWaveProgress() {
    if (
        waveInProgress &&
        zombiesSpawned === zombiesToSpawn &&
        zombies.length === 0
    ) {
        waveInProgress = false;

        setTimeout(function () {
            wave++;
            startWave();
        }, 3000);
    }
}



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

function drawHealthPacks() {

    for (let pack of healthPacks) {

        const timeLeft = 5000 - (Date.now() - pack.createdAt);

        if (timeLeft <= 2000) {

            if (Math.floor(Date.now() / 200) % 2 === 0) {
                continue;
            }
        }
        ctx.fillStyle = "lime";
        ctx.fillRect(
            pack.x,
            pack.y,
            pack.width,
            pack.height
        );

        ctx.fillStyle = "white";

        ctx.fillRect(
            pack.x + 5,
            pack.y + 10,
            15,
            5
        );

        ctx.fillRect(
            pack.x + 10,
            pack.y + 5,
            5,
            15
        );
    }
}

function checkHealthPackCollision() {

    for (let i = healthPacks.length - 1; i >= 0; i--) {

        const pack = healthPacks[i];

        if(Date.now() - pack.createdAt >= 5000){
            healthPacks.splice(i,1);
            continue;
        }

        if (isColliding(player, pack)) {

            player.health += pack.healAmount;

            if (player.health > 100) {
                player.health = 100;
            }

            healthPacks.splice(i, 1);
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

function drawWave() {
    if (waveMessage) {

        if (Date.now() - waveMessageTime < 2000) {

            ctx.fillStyle = "white";
            ctx.font = "40px Arial";
            ctx.textAlign = "center";

            ctx.fillText(
                "WAVE " + wave,
                canvas.width / 2,
                100
            );

            ctx.textAlign = "left";

        } else {
            waveMessage = false;
        }
    }
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

        let bulletHit = false;

        for (let j = zombies.length - 1; j >= 0; j--) {

            const zombie = zombies[j];

            if (isColliding(bullet, zombie)) {

                zombie.health--;

                bullets.splice(i, 1);
                bulletHit = true;

                if (zombie.health <= 0) {
                    score += 10;
                    zombies.splice(j, 1);
                }

                break;
            }
        }

        if (bulletHit) {
            continue;
        }

        if (
            bullet.x < 0 ||
            bullet.x > canvas.width ||
            bullet.y < 0 ||
            bullet.y > canvas.height
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

const keys = {};

document.addEventListener("keydown", function(event) {
    keys[event.key.toLowerCase()] = true;
});

document.addEventListener("keyup", function(event) {
    keys[event.key.toLowerCase()] = false;
});

function update() {
    let currentSpeed = player.speed;

    const moving =
    keys["w"] ||
    keys["a"] ||
    keys["s"] ||
    keys["d"];

    if (keys["shift"] && moving && player.stamina > 0) {
        currentSpeed = player.sprintSpeed;

        player.stamina -= 1;

        if (player.stamina < 0) {
            player.stamina = 0;
        }
    } else {
        currentSpeed = player.speed;

        if (player.stamina < player.maxStamina) {
            player.stamina += 0.5;
        }
    }

   
    if (keys["w"]) player.y -= currentSpeed;
    if (keys["s"]) player.y += currentSpeed;
    if (keys["a"]) player.x -= currentSpeed;
    if (keys["d"]) player.x += currentSpeed;

    if (player.x < 0) player.x = 0;
    if (player.x > canvas.width - player.width) {
        player.x = canvas.width - player.width;
    }

    if (player.y < 0) player.y = 0;
    if (player.y > canvas.height - player.height) {
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

function drawStamina() {

    ctx.fillStyle = "gray";
    ctx.fillRect(20, 70, 200, 15);

    ctx.fillStyle = "cyan";
    ctx.fillRect(
        20,
        70,
        player.stamina * 2,
        15
    );

    ctx.strokeStyle = "white";
    ctx.strokeRect(20, 70, 200, 15);

    ctx.fillStyle = "white";
    ctx.font = "14px Arial";
    ctx.fillText("Stamina", 20, 100);
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
    ctx.fillRect(0, -3, 20, 5);
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
        checkHealthPackCollision();
        checkWaveProgress();
        draw();
        drawBullets();
        drawZombies();
        drawHealth();
        drawHealthPacks();
        drawStamina();
        drawScore();
        drawWave();
    } else {
        drawGameOver();
    }

    requestAnimationFrame(gameLoop);
}

startWave();
gameLoop();

