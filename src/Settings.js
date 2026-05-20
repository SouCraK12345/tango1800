import { motion } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
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
  const [handoverStatus, setHandoverStatus] = useState("");
  const [isHandingOver, setIsHandingOver] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const search_params = new URLSearchParams(location.search);
    if (search_params.has("previous_data"));
    const data = JSON.parse(search_params.get("previous_data"));
    console.log(data);
    for(var i in data){
      localStorage[i] = data[i];
    }
  }, [location]);

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

  const handover_data = () => {
    if (isHandingOver) return;
    if (!window.confirm("これを実行すると、現在のサイトのデータが前のサイトのデータで上書きされます。")) return;

    setIsHandingOver(true);
    setHandoverStatus("前のサイトへ移動してデータを取得します...");

    window.location.href = `https://soucrak12345.github.io/tango1800/?callbackurl=${location.host}&export`;
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
        デバイスの振動
      </label>
      <button onClick={handover_data} disabled={isHandingOver}>
        {isHandingOver ? "引き継ぎ中..." : "前のサイトからデータを引き継ぐ"}
      </button>
      {handoverStatus && <p className="handoverStatus">{handoverStatus}</p>}
      <Link to="/" className="backButton">ホームへ戻る</Link>
    </motion.div>
  );
}

export default Settings;
