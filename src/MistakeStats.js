import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { getCorrectCounts, getWrongCounts } from "./wrongCountStorage";
import "./MistakeStats.css";

const slideVariants = {
    initial: { x: "100%", opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: "-100%", opacity: 0 },
};

function MistakeStats() {
    const [words, setWords] = useState([]);
    const [error, setError] = useState("");

    useEffect(() => {
        fetch("/eitango.json")
            .then((res) => res.json())
            .then((data) => setWords(Array.isArray(data) ? data : []))
            .catch(() => setError("データの読み込みに失敗しました。"));
    }, []);

    const rows = useMemo(() => {
        const wrongCounts = getWrongCounts();
        const correctCounts = getCorrectCounts();
        const mapped = words.map((item, index) => {
            const english = item[0];
            const japanese = item[1];
            const wrongCount = wrongCounts[english] || 0;
            const correctCount = correctCounts[english] || 0;
            const totalCount = wrongCount + correctCount;
            const accuracy = totalCount === 0 ? 0 : (correctCount / totalCount) * 100;

            return {
                no: index + 1,
                english,
                japanese,
                wrongCount,
                correctCount,
                accuracy,
            };
        });

        return mapped.sort((a, b) => {
            if (b.wrongCount !== a.wrongCount) {
                return b.wrongCount - a.wrongCount;
            }
            if (b.correctCount !== a.correctCount) {
                return b.correctCount - a.correctCount;
            }
            return a.no - b.no;
        });
    }, [words]);

    return (
        <motion.div
            variants={slideVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.3 }}
            className="MistakeStats"
        >
            <Link
                to="/mode"
                className="back"
            >
                &lt; もどる
            </Link>
            <h1 className="title">ミス統計を見る</h1>
            {error ? (
                <p>{error}</p>
            ) : (
                <div className="statsTableWrap">
                    <table className="statsTable">
                        <thead>
                            <tr>
                                <th>English</th>
                                <th>日本語</th>
                                <th style={{width: "7%" }}>正解</th>
                                <th style={{width: "7%" }}>ミス</th>
                                <th>正解率</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((row) => (
                                <tr key={row.no}>
                                    <td>{row.english}</td>
                                    <td>{row.japanese}</td>
                                    <td>{row.correctCount}</td>
                                    <td>{row.wrongCount}</td>
                                    <td>{row.accuracy.toFixed(1)}%</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </motion.div>
    );
}

export default MistakeStats;
