import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { getWrongCounts } from "./wrongCountStorage";
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
            .catch(() => setError("問題データの読み込みに失敗しました。"));
    }, []);

    const rows = useMemo(() => {
        const counts = getWrongCounts();
        const mapped = words.map((item, index) => {
            const english = item[0];
            const japanese = item[1];
            return {
                no: index + 1,
                english,
                japanese,
                wrongCount: counts[english] || 0,
            };
        });

        return mapped.sort((a, b) => {
            if (b.wrongCount !== a.wrongCount) {
                return b.wrongCount - a.wrongCount;
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
            <Link to="/mode" className="back">&lt; もどる</Link>
            <h1 className="title">間違えた回数</h1>
            {error ? (
                <p>{error}</p>
            ) : (
                <div className="statsTableWrap">
                    <table className="statsTable">
                        <thead>
                            <tr>
                                <th>No.</th>
                                <th>English</th>
                                <th>日本語</th>
                                <th>間違えた回数</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((row) => (
                                <tr key={row.no}>
                                    <td>{row.no}</td>
                                    <td>{row.english}</td>
                                    <td>{row.japanese}</td>
                                    <td>{row.wrongCount}</td>
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
