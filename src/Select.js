import { motion } from "framer-motion";
import { Link, useLocation, useNavigate } from "react-router-dom";
import React, { useState } from "react";
import './Select.css';

const slideVariants = {
    initial: { x: "100%", opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: "-100%", opacity: 0 },
};

function SelectButton({ start, end, mode }) {
    const navigate = useNavigate();
    return (
        <button className="SelectButton" onClick={() => navigate(`/game?mode=${mode}&start=${start}&end=${end}`)}>
            {start} ~ {end}
        </button>
    );
}

function Select() {
    const location = useLocation();
    const navigate = useNavigate();
    const [customStart, setCustomStart] = useState("");
    const [customEnd, setCustomEnd] = useState("");

    const params = new URLSearchParams(location.search);
    const mode = params.get("mode") || "alone";

    // 1~1800まで100区切りでボタンを生成
    const buttons = [];
    for (let i = 0; i < 18; i++) {
        const start = i * 100 + 1;
        const end = (i + 1) * 100;
        buttons.push(<SelectButton key={i} start={start} end={end} mode={mode} />);
    }

    const handleCustomStart = () => {
        const start = parseInt(customStart);
        const end = parseInt(customEnd);
        if (!isNaN(start) && !isNaN(end) && start > 0 && end >= start) {
            navigate(`/game?mode=${mode}&start=${start}&end=${end}`);
        } else {
            alert("正しい範囲を入力してください");
        }
    };

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
            <p>{mode === "alone" ? "ひとりで" : "みんなで"}</p>

            <div className="buttonContainer">
                {buttons}

                <div className="customRange">
                    <input
                        type="number"
                        placeholder="開始"
                        value={customStart}
                        onChange={(e) => setCustomStart(e.target.value)}
                    />
                    <span> ~ </span>
                    <input
                        type="number"
                        placeholder="終了"
                        value={customEnd}
                        onChange={(e) => setCustomEnd(e.target.value)}
                    />
                    <button onClick={handleCustomStart} disabled={!customStart || !customEnd}>決定</button>
                </div>
            </div>

        </motion.div>
    );
}

export default Select;