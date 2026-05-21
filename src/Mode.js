import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import './Mode.css';
import { datalist } from "framer-motion/client";

const slideVariants = {
    initial: { x: "100%", opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: "-100%", opacity: 0 },
};

function Mode() {
    const navigate = useNavigate();
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [online_range, setOnlineRange] = useState("インターネットに接続しています...");
    let [online_range_start, setOnlineRangeStart] = useState(0);
    let [online_range_end, setOnlineRangeEnd] = useState(0);

    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener("online", handleOnline);
        window.addEventListener("offline", handleOffline);

        return () => {
            window.removeEventListener("online", handleOnline);
            window.removeEventListener("offline", handleOffline);
        };
    }, []);

    useEffect(() => {
        const getRangeFunc = async () => {
            try {
                const response = await fetch(
                    "https://eitango-server.souki110212.workers.dev/schedule"
                );
    
                if (!response.ok) {
                    throw new Error("Fetch failed");
                }
    
                const data = await response.json();
    
                console.log(data);
    
                // dict を number に変換
                const dictIndex = Number(data.dict);
    
                const dictName = [
                    "東進英単語 1800",
                    "速読英単語 1903"
                ][dictIndex];
    
                setOnlineRange(
                    `${dictName} ${data.start} ~ ${data.end}`
                );
                setOnlineRangeStart(data.start);
                setOnlineRangeEnd(data.end);
    
            } catch (err) {
                console.error("Error:", err);
            }
        };
    
        getRangeFunc();
    }, []);

    return (
        <motion.div
            variants={slideVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.3 }}
            className="Mode"
        >
            <Link to="/" className="back">&lt; もどる</Link>
            <h1 className="title">モード選択</h1>
            <button onClick={() => navigate("/select?mode=alone")}>ひとりで</button>
            <button
                onClick={() => navigate(`/game?mode=together&dict=0&start=${online_range_start}&end=${online_range_end}`)}
                disabled={!isOnline}
                title={!isOnline ? "オフライン時は利用できません" : ""}
            >
                みんなで{!isOnline ? " (オフライン時は利用不可)" : ""}
            </button>
            <button onClick={() => navigate("/mistakes")}>問題一覧を見る</button>
            <div className="schedule">
                <span>現在のスケジュール<span className="date">{/*15:00 ~ 17:00*/}</span></span>
                <div className="range">{online_range}</div>
            </div>
            <div className="changed-url">
                <h3>[お知らせ]サイトのURLが変更されました</h3>
                <Link to="/settings">前のサイトからデータを引き継ぐ</Link>
            </div>
        </motion.div>);
}

export default Mode;
