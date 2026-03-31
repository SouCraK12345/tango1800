import { motion } from "framer-motion";
import { Link, useLocation, useNavigate } from "react-router-dom";
import React from "react";
import './Select.css';

const slideVariants = {
    initial: { x: "100%", opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: "-100%", opacity: 0 },
};

function SelectButton({ start, end }) {
    const navigate = useNavigate();
    return (
        <button className="SelectButton" onClick={() => navigate(`/game?mode=alone&start=${start}&end=${end}`)}>
            {start} ~ {end}
        </button>
    );
}

function Select() {
    const location = useLocation();
    // 1~1800まで100区切りでボタンを生成
    const buttons = [];
    for (let i = 0; i < 18; i++) {
        const start = i * 100 + 1;
        const end = (i + 1) * 100;
        buttons.push(<SelectButton key={i} start={start} end={end} />);
    }

    const params = new URLSearchParams(location.search);

    return (
        <motion.div
            variants={slideVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.3 }}
            className="Select">
            <Link to="/mode" className="back">&lt; もどる</Link>
            <h1>範囲を選択</h1>
            <p>{params.get("mode") === "alone" ? "ひとりで" : "みんなで"}</p>
            <div className="buttonContainer">
                {buttons}
            </div>
        </motion.div>
    );
}

export default Select;