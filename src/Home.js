import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
// import { useEffect } from "react";
import './Home.css';

const slideVariants = {
    initial: { x: "100%", opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: "-100%", opacity: 0 },
};

function Home() {
    const navigate = useNavigate();
    return (
        <motion.div
            variants={slideVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.3 }}
            className="Home"
            onClick={() => {
                // document.querySelector(".settingsButton").style.display = "none";
                navigate("/mode")
            }}
            >
            <h1 className="title">英単語1800</h1>
            Tap To Start
        </motion.div>);
}

export default Home;
