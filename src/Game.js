import { motion } from "framer-motion";
import { Link, useNavigate, useLocation } from "react-router-dom";
import './Game.css';
import './Loading.css';
import { WebHaptics, defaultPatterns } from "https://cdn.skypack.dev/web-haptics";
import { useEffect, useState } from "react";
import { incrementCorrectCount, incrementWrongCount } from "./wrongCountStorage";

const slideVariants = {
    initial: { x: "100%", opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: "-100%", opacity: 0 },
};

const haptics = new WebHaptics();


let mode;
let q_num = 0;
let start_num;
let end_num;
let eitango;
let navigate;

// setInterval, requestAnimationFrameのID管理用
let intervalIds = [];
let animationFrameIds = [];

// ダイアログをふわっと閉じる関数
function closeDialogWithFade() {
    const dialog = document.querySelector('.dialog');
    if (!dialog) return;
    dialog.classList.add('fadeOut');
    dialog.addEventListener('animationend', function handler() {
        dialog.classList.remove('fadeOut');
        dialog.close();
        document.querySelector(".dialog").style.display = "none";
        dialog.removeEventListener('animationend', handler);
    });
}

function sendPlaying() {
    if (ws && ws.readyState === WebSocket.OPEN) {
        sendMessage({ type: "playing", user_name: localStorage.getItem("user_name") });
    }
}


function addPersonIntoLoading(name) {
    const container = document.querySelector(".l_players");
    const l_person = document.createElement("div");
    l_person.classList.add("l_person");
    l_person.innerHTML = name;
    container.appendChild(l_person);
}


function StartGame() {
    if (mode === "together") {
        document.querySelector(".matchmaking").classList.add("show");
        setTimeout(() => {
            const id1 = setInterval(() => {
                if (joined_count < 1) {
                    if (startSoonReceived) {
                        document.querySelector(".matchmaking").innerHTML = "まもなくゲームが始まります!";
                    } else {
                        document.querySelector(".matchmaking").innerHTML = `${playingList.length}人が待機中...`
                    }
                } else {
                    document.querySelector(".matchmaking").innerHTML = `${joined_name}が参加しました!`
                    joined_count--;
                }
            }, 1000);
            intervalIds.push(id1);
        }, 3000);
        sendMessage({ type: "joined", user_name: localStorage.getItem("user_name") });
        const id2 = setInterval(sendPlaying, 5000);
        intervalIds.push(id2);
    }

    if (ws) {
        ws.onmessage = onMessage;
    }

    document.querySelector(".Ready").style.display = "none";
    document.querySelector(".Playing").style.display = "flex";
    number_of_questions = end_num - start_num + 1;
    // 該当範囲をコピー
    question_list = eitango.slice(start_num - 1, end_num);
    default_question_list = eitango.slice(start_num - 1, end_num);
    // シャッフル
    for (let i = question_list.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [question_list[i], question_list[j]] = [question_list[j], question_list[i]];
    }
    q_num = 0;
    game_start_time = Date.now();

    update();
    next_question();
}

function next_question() {
    document.querySelector(".English").textContent = question_list[q_num][0];
    const correct_japanese = question_list[q_num][1];
    const options = [correct_japanese];
    while (options.length < 4) {
        const random_japanese = eitango[Math.floor(Math.random() * eitango.length)][1];
        if (!options.includes(random_japanese)) {
            options.push(random_japanese);
        }
    }
    for (let i = options.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [options[i], options[j]] = [options[j], options[i]];
    }
    document.querySelector(".Japanese1").textContent = options[0];
    document.querySelector(".Japanese2").textContent = options[1];
    document.querySelector(".Japanese3").textContent = options[2];
    document.querySelector(".Japanese4").textContent = options[3];
    haptics.trigger(defaultPatterns.heavy);
    currentQuestionHadMistake = false;

    if (Date.now() - start_time > max_time) {
        max_time = 1600;
        btb_count = 0;
    } else {
        btb_count++;
    }
    if (max_time > 800) {
        max_time -= 100;
    }
    start_time = Date.now()
}


let canvas;
let ctx;
let bar_canvas;
let b_ctx;
let max_time = 1500;
let start_time = Date.now();
let game_start_time = Date.now();
let elapsed_time = 0;
let question_list = [];
let default_question_list = [];
let number_of_questions = 0;
let correct_answers = 0;
let ws;
let btb_count = 0;
let btb_total = 0; // BTB累計
let joined_count = 0;
let joined_name = "";
let beeped = false;
const blockWidth = 100;
const blockHeight = 20;
let blocks = [];
let particles = [];
let playingList = [];
let startSoonReceived = false;
let startGameReceived = false;
let currentQuestionHadMistake = false;

function resetGameState() {
    q_num = 0;
    max_time = 1500;
    start_time = Date.now();
    game_start_time = Date.now();
    elapsed_time = 0;
    question_list = [];
    default_question_list = [];
    number_of_questions = 0;
    correct_answers = 0;
    btb_count = 0;
    btb_total = 0;
    joined_count = 0;
    joined_name = "";
    beeped = false;
    blocks = [];
    particles = [];
    playingList = [];
    startSoonReceived = false;
    startGameReceived = false;
}

// ===== 割り込み追加 =====
function addBlock(indexFromBottom) {
    // 挿入
    blocks.splice(indexFromBottom, 0, {
        x: 0,
        y: 0,
        vy: 0,
        color: "#f44336"
    });

    // 全ブロックを強制再配置（ここがポイント）
    for (let i = 0; i < blocks.length; i++) {
        let targetY = canvas.height - blockHeight * (i + 1);
        blocks[i].y = targetY;
        blocks[i].vy = 0;
    }
}

// ===== 破壊 =====
function breakBlock() {

    // break.mp3を再生
    const audio = new Audio('/break.mp3');
    audio.play();

    if (blocks.length === 0) return;

    const block = blocks.shift();

    const pieceSize = 10;
    const cols = blockWidth / pieceSize;
    const rows = blockHeight / pieceSize;

    for (let x = 0; x < cols; x++) {
        for (let y = 0; y < rows; y++) {
            particles.push({
                x: block.x + x * pieceSize,
                y: block.y + y * pieceSize,
                size: pieceSize,
                vx: (Math.random() - 0.5) * 4,
                vy: (Math.random() - 1.5) * 4,
                gravity: 0.3,
                color: block.color
            });
        }
    }
}

// ===== 更新 =====
function update() {
    ctx.clearRect(-100, 0, 200, 1000);

    // 落下処理（破壊時のみ効く）
    for (let i = 0; i < blocks.length; i++) {
        let b = blocks[i];
        let targetY = canvas.height - blockHeight * (i + 1);

        if (b.y < targetY) {
            b.vy += 0.5;
            b.y += b.vy;

            if (b.y > targetY) {
                b.y = targetY;
                b.vy = 0;
            }
        }
    }

    // 描画
    blocks.forEach(b => {
        ctx.fillStyle = b.color;
        ctx.fillRect(b.x, b.y, blockWidth, blockHeight);

        ctx.strokeStyle = "#000";
        ctx.strokeRect(b.x, b.y, blockWidth, blockHeight);
    });

    // 破片
    particles.forEach(p => {
        p.vy += p.gravity;
        p.x += p.vx;
        p.y += p.vy;

        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, p.size, p.size);

        ctx.strokeStyle = "#000";
        ctx.strokeRect(p.x, p.y, p.size, p.size);
    });

    // 右下の正解数/総問題数も毎フレーム更新
    const correctElem = document.querySelector('.corner-correct');
    const totalElem = document.querySelector('.corner-total');
    if (correctElem) correctElem.textContent = correct_answers;
    if (totalElem) totalElem.textContent = number_of_questions;
    const btbElem = document.querySelector('.btb-count');
    if (btbElem) btbElem.textContent = btb_count;
    const btbTotalElem = document.querySelector('.btb-total');
    if (btbTotalElem) btbTotalElem.textContent = btb_total;

    // ゲームプレイ時間の更新
    elapsed_time = (Date.now() - game_start_time) / 1000;
    const timerElem = document.querySelector('.game-timer');
    if (timerElem) {
        timerElem.textContent = elapsed_time.toFixed(2);
    }

    b_ctx.clearRect(0, 0, 1000, 50);
    if (Date.now() - start_time > max_time) {
        if (!beeped) {
            const audio = new Audio('/beep.mp3');
            audio.play();
            // 失敗時、カウント中のbtb_countを累計に加算
            btb_total += btb_count;
            beeped = true;
        }
        b_ctx.fillStyle = "red";
        btb_count = 0;
    } else {
        b_ctx.fillStyle = "orange";
        beeped = false;
    }
    b_ctx.fillRect(0, 0, ((Date.now() - start_time) / max_time * 1000), 50);

    if (question_list.length == 0) {
        // 最後の累計加算（カウント中分を加える）
        if (btb_count > 0) {
            btb_total += btb_count;
            btb_count = 0;
        }
        console.log(question_list.length);
        return
    }
    const animId = requestAnimationFrame(update);
    animationFrameIds.push(animId);
}

function sendMessage(data) {
    if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(data));
    }
}

function onMessage(event) {
    const data = JSON.parse(event.data);
    if (data.type === "joined") {
        joined_count = 2;
        joined_name = data.user_name;
    }
    if (data.type === "playingList") {
        playingList = data.players;
    }
    if (data.type === "StartSoon") {
        startSoonReceived = true;
    }
    if (data.type === "StartGame") {
        if (startGameReceived == false) {
            document.querySelector(".matchmaking").classList.remove("show");
            document.querySelector(".loading").classList.add("show");
            document.querySelector(".l_start").innerHTML = data.start_num;
            document.querySelector(".l_end").innerHTML = data.end_num;
            playingList.forEach(name => addPersonIntoLoading(name));
            setTimeout(() => {
                navigate("/multiplay?&start=" + data.start_num + "&end=" + data.end_num);
                ws.close();
            }, 5000);
        }
        startSoonReceived = false;
        startGameReceived = true;
    }
}

const loginRequest = async (body) => {
    try {
        const response = await fetch(
            "https://script.google.com/macros/s/AKfycbxUXRYE6f9Ojmje9qopcAxO-xU2MBwcd_cVI6i1-vCJuuBeFLhpO2ooqBJ8G9xdE0YUfQ/exec",
            {
                method: "POST",
                headers: {
                    "Content-Type": "text/plain",
                },
                body: JSON.stringify(body),
            }
        );

        const result = await response.text();
        console.log(result);
        if (result != "Invalid Password" && result != "Invalid Token") {
            document.querySelector(".account-name").textContent = body.user_name;
            document.querySelector(".account").style.display = "flex";
        }
        return result;
    } catch (error) {
        console.error("error", error);
    }
};

function login() {
    const username = document.querySelector(".username").value;
    const password = document.querySelector(".password").value;
    if (username && password) {
        let loginData = {
            type: "login",
            user_name: username,
            password: password,
        };
        loginRequest(loginData).then(result => {
            if (result != "Invalid Password") {
                localStorage.setItem("user_name", username);
                localStorage.setItem("token", result);
                closeDialogWithFade();
            } else {
                alert("パスワードが違います");
                document.querySelector(".login").style.display = "flex";
                document.querySelector(".spinner").style.display = "none";
                document.querySelector(".text").style.display = "none";
            }
        });
        document.querySelector(".login").style.display = "none";
        document.querySelector(".spinner").style.display = "block";
        document.querySelector(".text").style.display = "block";
    } else {
        alert("ユーザー名とパスワードを入力してください");
    }
}

function Game() {
    navigate = useNavigate();
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const [value, setValue] = useState("");

    function logout() {
        localStorage.removeItem("user_name");
        localStorage.removeItem("token");
        navigate("/mode");
    }

    useEffect(() => {
        setValue("");
        resetGameState();
        mode = params.get("mode");
        if (mode === "together") {
            start_num = 1;
            end_num = 1800;
            document.querySelector(".dialog").showModal();
            setTimeout(() => {
                document.querySelector(".dialog").style.display = "flex";
            }, 500);
            ws = new WebSocket("wss://eitango-server.souki110212.workers.dev");
            if (localStorage.getItem("user_name") == null) {
                document.querySelector(".login").style.display = "flex";
                document.querySelector(".spinner").style.display = "none";
                document.querySelector(".text").style.display = "none";
            } else {
                let loginData = {
                    type: "login",
                    user_name: localStorage.getItem("user_name"),
                    token: localStorage.getItem("token")
                };
                loginRequest(loginData).then(result => {
                    if (result != "Invalid Token") {
                        closeDialogWithFade();
                    } else {
                        localStorage.removeItem("user_name");
                        localStorage.removeItem("token");
                        document.querySelector(".login").style.display = "flex";
                        document.querySelector(".spinner").style.display = "none";
                        document.querySelector(".text").style.display = "none";
                    }
                });
            }
        }

        fetch('/eitango.json')
            .then(res => res.json())
            .then(data => {
                eitango = data;
                console.log(eitango);
            })
            .catch(err => console.error('eitango.jsonの読み込みに失敗しました', err));

        bar_canvas = document.getElementById("bar");
        b_ctx = bar_canvas.getContext("2d");
        bar_canvas.width = 1000;
        bar_canvas.height = 50;

        canvas = document.getElementById("canvas");
        ctx = canvas.getContext("2d");

        canvas.width = 200;
        canvas.height = 1000;
        ctx.translate(100, 0);
        // 初期化
        const totalBlocks = end_num - start_num + 1;
        for (let i = 0; i < totalBlocks; i++) {
            blocks.push({
                x: 0,
                y: canvas.height - blockHeight * (i + 1),
                vy: 0,
                color: "#4CAF50"
            });
        }

        document.querySelectorAll(".Japanese").forEach(button => {
            button.addEventListener("click", () => {
                const selected_japanese = button.textContent;
                const correct_japanese = question_list[q_num][1];
                if (selected_japanese === correct_japanese) {
                    if (!currentQuestionHadMistake) {
                        incrementCorrectCount(question_list[q_num][0]);
                        correct_answers++;
                    }
                    document.querySelector(".answer").textContent = `${question_list[q_num][0]} = ${correct_japanese}`;
                    question_list.splice(q_num, 1);
                    document.querySelectorAll(".Japanese").forEach(button => {
                        button.style.backgroundColor = "#2196F3";
                        button.style.boxShadow = "0 5px #0b7dda";
                    });
                    breakBlock();
                    if (question_list.length === 0) {
                        document.querySelector(".finish").classList.add("show");
                        return;
                    }
                    next_question();
                } else {
                    currentQuestionHadMistake = true;
                    incrementWrongCount(question_list[q_num][0]);
                    button.style.backgroundColor = "lightgray";
                    button.style.boxShadow = "0 5px gray";
                    haptics.trigger(defaultPatterns.error);
                    for (var i = 0; i < 2; i++) {
                        let randomNum;
                        if (i === 0) {
                            randomNum = Math.floor(Math.random() * 4) + 2;
                        } else {
                            randomNum = Math.floor(Math.random() * 4) + 6;
                        }
                        addBlock(randomNum);
                        question_list.splice(randomNum, 0, question_list[q_num]);
                    }
                    const audio = new Audio('/wrong.mp3');
                    audio.play();
                    number_of_questions += 2;
                }
            });
        });
        document.querySelector(".finish").addEventListener("animationend", () => {
            // すべてのsetInterval, requestAnimationFrameを解除
            intervalIds.forEach(id => clearInterval(id));
            intervalIds = [];
            animationFrameIds.forEach(id => cancelAnimationFrame(id));
            animationFrameIds = [];
            navigate("/result", { state: { num_words: end_num - start_num + 1, total: number_of_questions, btb_total, elapsed_time } });
        });



        // ===== 開発用: btb-count長押しで初期画面に戻る =====
        setTimeout(() => {
            const btbElem = document.querySelector('.btb-count');
            if (btbElem) {
                let pressTimer = null;
                btbElem.addEventListener('mousedown', () => {
                    pressTimer = setTimeout(() => {
                        window.location.href = '/';
                    }, 1200); // 1.2秒長押しで遷移
                });
                btbElem.addEventListener('mouseup', () => {
                    clearTimeout(pressTimer);
                });
                btbElem.addEventListener('mouseleave', () => {
                    clearTimeout(pressTimer);
                });
                // スマホ対応
                btbElem.addEventListener('touchstart', () => {
                    pressTimer = setTimeout(() => {
                        window.location.href = '/';
                    }, 1200);
                });
                btbElem.addEventListener('touchend', () => {
                    clearTimeout(pressTimer);
                });
                btbElem.addEventListener('touchcancel', () => {
                    clearTimeout(pressTimer);
                });
            }
        }, 1000); // btb-count描画後に実行

        // クリーンアップ: 画面遷移やアンマウント時にタイマー・アニメーション解除
        return () => {
            intervalIds.forEach(id => clearInterval(id));
            intervalIds = [];
            animationFrameIds.forEach(id => cancelAnimationFrame(id));
            animationFrameIds = [];
        };
    }, []);

    start_num = parseInt(params.get("start"));
    end_num = parseInt(params.get("end"));

    return (
        <motion.div
            variants={slideVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.3 }}
            className="Game"
        >
            <div className="Ready">
                <Link to="/mode" className="back">&lt; もどる</Link>
                <h1 className="title">範囲: {params.get("mode") === "alone" ? `${start_num} ~ ${end_num}` : "ランダム"}</h1>
                <p>{params.get("mode") === "alone" ? "ひとりで" : "みんなで"}</p>
                <button onClick={() => StartGame()}>開始</button>
                <div className="account">
                    <p>アカウント: <span className="account-name"></span></p>
                    <button className="logout" onClick={() => logout()}>ログアウト</button>
                </div>
            </div>
            <div className="Playing">
                <div className="game-timer">0:00</div>
                <div className="finish">Finish!</div>
                <h1 className="English"></h1>
                <div className="ButtonContainer">
                    <button className="Japanese1 Japanese">日本語1</button>
                    <button className="Japanese2 Japanese">日本語2</button>
                    <button className="Japanese3 Japanese">日本語3</button>
                    <button className="Japanese4 Japanese">日本語4</button>
                </div>
                <p className="answer">英語に合う日本語を選んでください</p>
                <canvas id="canvas"></canvas>
                <canvas id="bar"></canvas>
                <div className="corner-stats">
                    <span className="corner-correct">{correct_answers}</span>
                    <span className="corner-slash">/</span>
                    <span className="corner-total">{number_of_questions}</span>
                </div>
                <div style={{ position: "absolute", left: 10, bottom: 10, color: "#333", fontWeight: "bold", fontSize: "1.2em" }}>
                    <span className="btb-total">0</span>p
                </div>
                <div className="btb-count"></div>
            </div>
            <dialog className="dialog">
                <div className="spinner"></div>
                <div className="text">
                    インターネットに接続しています<span className="dots"></span>
                </div>
                <form className="login" onSubmit={e => { e.preventDefault(); login(); }}>
                    <h1>ログイン</h1>
                    <input name="username" type="text" placeholder="ユーザー名" className="username" autoComplete="username" required />
                    <input name="password" type="password" placeholder="パスワード" className="password" autoComplete="current-password" required />
                    <button className="login-button" type="submit">ログイン</button>
                    <a target="_blank" href="https://script.google.com/macros/s/AKfycbxUXRYE6f9Ojmje9qopcAxO-xU2MBwcd_cVI6i1-vCJuuBeFLhpO2ooqBJ8G9xdE0YUfQ/exec
">アカウントを登録</a>
                </form>
            </dialog>
            <div className="matchmaking">マッチメイク中...</div>
            <div className="loading">
                <h1>範囲: <span className="l_start"></span> ～ <span className="l_end"></span></h1>
                <div className="l_players"></div>
            </div>
        </motion.div>);
}

export default Game;
