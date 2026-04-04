import { motion } from "framer-motion";
import { Link, useNavigate, useLocation } from "react-router-dom";
import './Result.css';

const slideVariants = {
    initial: { x: "100%", opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: "-100%", opacity: 0 },
};

function Result() {
    const navigate = useNavigate();
    const location = useLocation();
    const data = location.state;
    let resultHTML;
    if (data == null) {
        resultHTML = <div className="result">データが見つかりませんでした。<br />これはおそらくアプリの問題ではなく、あなたが再読み込みしたからですね。もう一度最初からやり直しです。頑張ってください。</div>;
    } else {
        resultHTML = (
            <div className="result">
                総問題数: {data.total}<br />
                単語数: {data.num_words}<br />
                ポイント: {data.btb_total}
            </div>
        )
    }
    return (
        <motion.div
            variants={slideVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.3 }}
            className="Result"
        >
            <h1 className="title">リザルト</h1>
            {resultHTML}
            <button onClick={() => navigate("/")} className="wide">もどる</button>
        </motion.div>);
}

export default Result;