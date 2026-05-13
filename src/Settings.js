import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useState } from "react";
import { getVolumeLevel, setVolumeLevel } from "./settingsStorage";
import "./Settings.css";

const slideVariants = {
  initial: { x: "100%", opacity: 0 },
  animate: { x: 0, opacity: 1 },
  exit: { x: "-100%", opacity: 0 },
};

function Settings() {
  const [volume, setVolume] = useState(getVolumeLevel());

  const handleChange = (event) => {
    const nextVolume = Number(event.target.value);
    setVolume(nextVolume);
    setVolumeLevel(nextVolume);
  };

  return (
    <motion.div
      variants={slideVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.3 }}
      className="Settings"
    >
      <h1>設定</h1>
      <label className="volumeLabel" htmlFor="volume-range">
        音量: {Math.round(volume * 100)}%
      </label>
      <input
        id="volume-range"
        type="range"
        min="0"
        max="1"
        step="0.05"
        value={volume}
        onChange={handleChange}
      />
      <Link to="/" className="backButton">ホームへ戻る</Link>
    </motion.div>
  );
}

export default Settings;
