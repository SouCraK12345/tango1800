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
                <div class="range">現在開発中</div>
            </div>
        </motion.div>);
}

export default Mode;
