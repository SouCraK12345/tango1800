import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import './Mode.css';

const slideVariants = {
    initial: { x: "100%", opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: "-100%", opacity: 0 },
};

function Mode() {
    const navigate = useNavigate();
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [online_range, setOnlineRange] = useState("インターネットに接続しています...");

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
            const response = await fetch("https://eitango-server.souki110212.workers.dev/schedule");
            const data = await response.json();
            setOnlineRange(
                ["東進英単語 1800", "速読英単語 1903"][data.dict] + data.start + " ~ " + data.end
            );
        }
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
                onClick={() => navigate("/game?mode=together")}
                disabled={!isOnline}
                title={!isOnline ? "オフライン時は利用できません" : ""}
            >
                みんなで{!isOnline ? " (オフライン時は利用不可)" : ""}
            </button>
            <button onClick={() => navigate("/mistakes")}>問題一覧を見る</button>
            <div class="schedule">
                <span>現在のスケジュール(<span class="date">15:00 ~ 17:00</span>)</span>
                <div class="range">{online_range}</div>
            </div>
        </motion.div>);
}

export default Mode;
