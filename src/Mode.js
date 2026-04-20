import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import './Mode.css';

const slideVariants = {
    initial: { x: "100%", opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: "-100%", opacity: 0 },
};

function Mode() {
    const navigate = useNavigate();
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
            <div class="schedule">
                <span>現在のスケジュール(<span class="date">15:00 ~ 17:00</span>)</span>
                <div class="range">東進英単語1800 1~50</div>
            </div>
            <button onClick={() => navigate("/select?mode=alone")}>ひとりで</button>
            <button onClick={() => navigate("/game?mode=together")}>みんなで</button>
            <button onClick={() => navigate("/mistakes")}>問題一覧を見る</button>
        </motion.div>);
}

export default Mode;