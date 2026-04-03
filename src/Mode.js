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
            <button onClick={() => navigate("/select?mode=alone")}>ひとりで</button>
            <button onClick={() => navigate("/game?mode=together")}>みんなで</button>
            <button onClick={() => navigate("/mistakes")}>間違えた回数を見る</button>
        </motion.div>);
}

export default Mode;