import { motion } from "framer-motion";
import { Link, useLocation, useNavigate } from "react-router-dom";
import React, { useState, useEffect, useMemo } from "react";
import './Select.css';
import { getCorrectCounts, getWrongCounts } from "./wrongCountStorage";

const slideVariants = {
    initial: { x: "100%", opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: "-100%", opacity: 0 },
};

function SelectButton({ start, end, mode, accuracy }) {
    const navigate = useNavigate();
    return (
        <button className="SelectButton" onClick={() => navigate(`/game?mode=${mode}&start=${start}&end=${end}`)}>
            <div className="rangeText">{start} ~ {end}</div>
            {accuracy !== null && <div className="accuracy">{accuracy}%</div>}
        </button>
    );
}

function Select() {
    const location = useLocation();
    const navigate = useNavigate();
    const [customStart, setCustomStart] = useState(localStorage.getItem("customStart") || "");
    const [customEnd, setCustomEnd] = useState(localStorage.getItem("customEnd") || "");
    const [words, setWords] = useState([]);

    useEffect(() => {
        fetch("/eitango.json")
            .then(res => res.json())
            .then(data => setWords(data))
            .catch(err => console.error(err));
    }, []);

    useEffect(() => {
        localStorage.setItem("customStart", customStart);
    }, [customStart]);

    useEffect(() => {
        localStorage.setItem("customEnd", customEnd);
    }, [customEnd]);

    const params = new URLSearchParams(location.search);
    const mode = params.get("mode") || "alone";

    const stats = useMemo(() => {
        const correctCounts = getCorrectCounts();
        const wrongCounts = getWrongCounts();
        return { correctCounts, wrongCounts };
    }, []);

    const getRangeAccuracy = (start, end) => {
        if (words.length === 0) return null;
        if (isNaN(start) || isNaN(end)) return null;
        let accuracySum = 0;
        let wordCount = 0;
        const s = Math.max(1, start);
        const e = Math.min(words.length, end);
        for (let i = s - 1; i < e; i++) {
            if (!words[i]) continue;
            const word = words[i][0];
            const correctCount = stats.correctCounts[word] || 0;
            const wrongCount = stats.wrongCounts[word] || 0;
            const totalCount = correctCount + wrongCount;
            const wordAccuracy = totalCount === 0 ? 0 : correctCount / totalCount;
            accuracySum += wordAccuracy;
            wordCount += 1;
        }
        if (wordCount === 0) return null;
        return ((accuracySum / wordCount) * 100).toFixed(1);
    };

    // 1~1800まで100区切りでボタンを生成
    const buttons = [];
    for (let i = 0; i < 18; i++) {
        const start = i * 100 + 1;
        const end = (i + 1) * 100;
        const accuracy = getRangeAccuracy(start, end);
        buttons.push(<SelectButton key={i} start={start} end={end} mode={mode} accuracy={accuracy} />);
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

    const customAccuracy = getRangeAccuracy(parseInt(customStart), parseInt(customEnd));

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
                    <button onClick={handleCustomStart} disabled={!customStart || !customEnd}>
                        決定
                        {customAccuracy !== null && <span className="customAccuracyText"> ({customAccuracy}%)</span>}
                    </button>
                </div>
            </div>

        </motion.div>
    );
}

export default Select;
