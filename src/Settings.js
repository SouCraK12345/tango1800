import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useState } from "react";
import {
  getHapticsEnabled,
  getVolumeLevel,
  setHapticsEnabled,
  setVolumeLevel,
} from "./settingsStorage";
import "./Settings.css";

const slideVariants = {
  initial: { x: "100%", opacity: 0 },
  animate: { x: 0, opacity: 1 },
  exit: { x: "-100%", opacity: 0 },
};

function Settings() {
  const [volume, setVolume] = useState(getVolumeLevel());
  const [hapticsEnabled, setHapticsEnabledState] = useState(getHapticsEnabled());

  const handleChange = (event) => {
    const nextVolume = Number(event.target.value);
    setVolume(nextVolume);
    setVolumeLevel(nextVolume);
  };

  const handleHapticsChange = (event) => {
    const enabled = event.target.checked;
    setHapticsEnabledState(enabled);
    setHapticsEnabled(enabled);
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
        step="0.01"
        value={volume}
        onChange={handleChange}
      />
      <label className="toggleRow" htmlFor="haptics-enabled">
        <input
          id="haptics-enabled"
          type="checkbox"
          checked={hapticsEnabled}
          onChange={handleHapticsChange}
        />
        プレイ時の触覚フィードバック
      </label>
      <Link to="/" className="backButton">ホームへ戻る</Link>
    </motion.div>
  );
}

export default Settings;
