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

function SelectButton({ start, end, mode, accuracy, tab }) {
    const navigate = useNavigate();
    return (
        <button className="SelectButton" onClick={() => navigate(`/game?mode=${mode}&start=${start}&end=${end}&dict=${tab}`)}>
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

    const [tab, setTab] = useState(0);

    useEffect(() => {
        const jsonFile = tab === 0 ? "eitango.json" : "sokutan.json";
        fetch(`${process.env.PUBLIC_URL}/${jsonFile}`)
            .then(res => res.json())
            .then(data => setWords(data))
            .catch(err => console.error(err));
    }, [tab]);

    useEffect(() => {
        localStorage.setItem("customStart", customStart);
    }, [customStart]);

    useEffect(() => {
        localStorage.setItem("customEnd", customEnd);
    }, [customEnd]);

    const params = new URLSearchParams(location.search);
    const mode = params.get("mode") || "alone";

    const stats = useMemo(() => {
        const correctCounts = getCorrectCounts(tab);
        const wrongCounts = getWrongCounts(tab);
        return { correctCounts, wrongCounts };
    }, [tab]);

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

    const createRangeButtons = (targetTab) => {
        const buttonCount = Math.ceil(words.length / 100);
        const rangeButtons = [];
        for (let i = 0; i < buttonCount; i++) {
            const start = i * 100 + 1;
            const end = Math.min((i + 1) * 100, words.length);
            const accuracy = getRangeAccuracy(start, end);
            rangeButtons.push(
                <SelectButton
                    key={`${targetTab}-${i}`}
                    start={start}
                    end={end}
                    mode={mode}
                    accuracy={accuracy}
                    tab={targetTab}
                />
            );
        }
        return rangeButtons;
    };

    const handleCustomStart = (tab) => {
        const start = parseInt(customStart);
        const end = parseInt(customEnd);
        if (!isNaN(start) && !isNaN(end) && start > 0 && end >= start) {
            navigate(`/game?mode=${mode}&start=${start}&end=${end}&dict=${tab}`);
        } else {
            alert("正しい範囲を入力してください");
        }
    };

    const navigatePriorityMode = (priorityMode, tab) => {
        navigate(`/game?mode=${mode}&priority=${priorityMode}&dict=${tab}`);
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


            <div className="tabs">
                <button onClick={() => setTab(0)}>東進 英単語1800</button>
                <button onClick={() => setTab(1)}>速読英単語1903</button>
            </div>
            <div className="slider">
                <div className="buttonContainer">
                    <div className="slide" style={{ transform: `translateX(-${tab * 106}%)` }}>
                        {mode === "alone" && tab === 0 && (
                            <div className="priorityModes">
                                <button
                                    className="priorityModeButton"
                                    onClick={() => navigatePriorityMode("leastPlayed50", 0)}
                                >
                                    プレイ回数が少ない順
                                </button>
                                <button
                                    className="priorityModeButton"
                                    onClick={() => navigatePriorityMode("lowAccuracy50", 0)}
                                >
                                    正答率が低い順
                                </button>
                            </div>
                        )}
                        {createRangeButtons(0)}
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
                            <button onClick={() => handleCustomStart(0)} disabled={!customStart || !customEnd}>
                                決定
                                {customAccuracy !== null && <span className="customAccuracyText"> ({customAccuracy}%)</span>}
                            </button>
                        </div>
                    </div>
                    <div className="slide" style={{ transform: `translateX(-${tab * 106}%)` }}>
                        {mode === "alone" && tab === 1 && (
                            <div className="priorityModes">
                                <button
                                    className="priorityModeButton"
                                    onClick={() => navigatePriorityMode("leastPlayed50", 1)}
                                >
                                    プレイ回数が少ない順
                                </button>
                                <button
                                    className="priorityModeButton"
                                    onClick={() => navigatePriorityMode("lowAccuracy50", 1)}
                                >
                                    正答率が低い順
                                </button>
                            </div>
                        )}
                        {createRangeButtons(1)}
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
                            <button onClick={() => handleCustomStart(1)} disabled={!customStart || !customEnd}>
                                決定
                                {customAccuracy !== null && <span className="customAccuracyText"> ({customAccuracy}%)</span>}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

        </motion.div>
    );
}

export default Select;
