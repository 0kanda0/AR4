var saikoroApp = {};

saikoroApp.scene = document.querySelector('#scene');
saikoroApp.words = [
    "びっくりした話",
    "情けない話",
    "はじめて◯◯した話",
    "ひょっとしたら私だけ",
    "恥ずかしい話",
    "怖い話",
    "今だからゴメンナサイ話",
    "ちょっとイイ話"
];

function main() {
    var sai = document.querySelector('#sai-physics').body;
    init(sai);
    throwSai(sai);
}

function init(obj) {
    // カメラのsleepイベント発火の設定
    obj.allowSleep = true;
    obj.sleepSpeedLimit = 1;
    obj.sleepTimeLimit = 1;
    obj.world.allowSleep = true;

    // さいころが停止したら真上までカメラを移動させるイベントを登録
    obj.addEventListener("sleep", function() {
        moveCam(obj);
    });

    document.getElementById("button").addEventListener("click", throwSai);
}

function throwSai(sai) {
    var cam = document.getElementById("cam");

    // さいころの各面にワードをセッティング
    setWords();

    // カメラの位置の初期化
    cam.setAttribute("position", "0 10 0");
    cam.setAttribute("rotation", "-30 0 0");

    // さいころが力の影響を（再び）受けるように設定しなおす
    sai.wakeUp();

    // さいころを初期ポジションにセット
    sai.position = new CANNON.Vec3(0, 10, -10);

    // さいころ全体に力を与える
    sai.velocity.set(0, 0, -4);

    // さいころに回転を与える
    sai.applyImpulse(
        new CANNON.Vec3(Math.random() * 20, Math.random() * 20, Math.random() * 20), // 与えるベクトル
        new CANNON.Vec3(0.5, Math.random() * 10, Math.random() * 10) // 力を与える点（さいころのローカル座標）
    );
}

function setWords() {
    // 配列の中身をランダムで並び替える
    Array.prototype.shuffle = function() {
        return this.map(function(a) {
                return [a, Math.random()]
            })
            .sort(function(a, b) {
                return a[1] - b[1]
            })
            .map(function(a) {
                return a[0]
            });
    }

    saikoroApp.words = saikoroApp.words.shuffle();

    // 配列の長さが6以上になるまで「フリーテーマ」で埋める
    while (saikoroApp.words.length < 6) {
        saikoroApp.words.push("フリーテーマ");
    }

    // サイコロの各面（の元になるHTML）にワードをセッティング
    for (var i = 0; i < 6; i++) {
        document.getElementById("target" + (i + 1)).innerText = saikoroApp.words[i];
    }
}

// カメラをサイコロの真上に移動させる
function moveCam(obj) {
    var cam = document.getElementById("cam");
    var target = new THREE.Vector3(obj.position.x, obj.position.y + 1.5, obj.position.z);
    var animDuration = 3000;

    // サイコロの直上にカメラを動かす
    var posAnim = document.createElement('a-animation');
    posAnim.setAttribute("attribute", "position");
    posAnim.setAttribute("from", AFRAME.utils.coordinates.stringify(cam.getAttribute("position")));
    posAnim.setAttribute("to", AFRAME.utils.coordinates.stringify(target));
    posAnim.setAttribute("begin", "saiStop");
    posAnim.setAttribute("dur", animDuration);
    cam.appendChild(posAnim.cloneNode(true));

    // 真下を向く
    var rotAnim = document.createElement('a-animation');
    rotAnim.setAttribute("attribute", "rotation");
    rotAnim.setAttribute("from", "-30 0 0");
    rotAnim.setAttribute("to", "-90 0 0");
    rotAnim.setAttribute("begin", "saiStop");
    rotAnim.setAttribute("dur", animDuration);
    cam.appendChild(rotAnim.cloneNode(true));

    cam.emit("saiStop");
}

if (saikoroApp.scene.hasLoaded) {
    main();
} else {
    saikoroApp.scene.addEventListener('loaded', main);
}