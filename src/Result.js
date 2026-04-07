import { motion } from "framer-motion";
import { Link, useNavigate, useLocation } from "react-router-dom";
import './Result.css';
import { useEffect, useState } from "react";

const slideVariants = {
    initial: { x: "100%", opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: "-100%", opacity: 0 },
};

function showRanking(players) {
    console.log(players);

    // 小さい順でソート
    players.sort((a, b) => a.score - b.score);

    const container = document.querySelector(".rk-container");
    container.style.display = "block";
    const root = document.querySelector(".rk-ranking");

    players.forEach((player, index) => {
        const item = document.createElement("div");
        item.className = "rk-item";
        item.style.backgroundColor = player.user_name == localStorage.getItem("user_name") ? "orange" : "white";

        item.innerHTML = `
      <div class="rk-left">
        <div class="rk-rank">${index + 1}</div>
        <div class="rk-name">${player.user_name}</div>
      </div>
      <div class="rk-score">${player.score}</div>
    `;

        root.appendChild(item);
    });
}

function Result() {
    const navigate = useNavigate();
    const location = useLocation();
    const data = location.state;
    let resultHTML;
    if (data == null) {
        resultHTML = <div className="result">データが見つかりませんでした。<br />これはおそらくアプリの問題ではなく、あなたが再読み込みしたからですね。もう一度最初からやり直しです。頑張ってください。</div>;
    } else {
        const minutes = Math.floor(data.elapsed_time / 60);
        const seconds = data.elapsed_time % 60;
        console.log(data);
        resultHTML = (
            <div className="result">
                プレイ時間: {minutes}:{seconds < 10 ? '0' : ''}{Math.floor(seconds * 10) / 10}<br />
                総問題数: {data.total}<br />
                単語数: {data.num_words}<br />
                正解数: {data.correct_count ?? 0}<br />
                不正解数: {data.wrong_count ?? 0}<br />
                解いた問題の数: {data.solved_count ?? data.total}<br />
                スコア: {data.btb_total}<br />
            </div>
        )
    }
    useEffect(() => {
        showRanking(data.ranking)
    })
    return (
        <motion.div
            variants={slideVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.3 }}
            className="Result"
        >
            <h1 className="title">リザルト</h1>
            <div className="rk-container">
                <div className="rk-ranking"></div>
            </div>
            {resultHTML}
            <button onClick={() => navigate("/")} className="wide">もどる</button>
        </motion.div>);
}

export default Result;
