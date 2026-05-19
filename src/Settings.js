import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  getHapticsEnabled,
  getVolumeLevel,
  setHapticsEnabled,
  setVolumeLevel,
} from "./settingsStorage";
import "./Settings.css";

const LEGACY_SITE_ORIGIN = "https://soucrak12345.github.io";
const LEGACY_SITE_URL = `${LEGACY_SITE_ORIGIN}/tango1800/`;
const HANDOVER_RESPONSE_TYPE = "STORAGE_DATA";
const HANDOVER_STORAGE_KEYS = [
  "correct_counts_v1",
  "wrong_counts_v1",
  "correct_counts_v1_dict_0",
  "correct_counts_v1_dict_1",
  "wrong_counts_v1_dict_0",
  "wrong_counts_v1_dict_1",
  "counts_dict_migration_v1_done_correct_counts_v1",
  "counts_dict_migration_v1_done_wrong_counts_v1",
  "customStart",
  "customEnd",
];

function importHandoverStorage(storageData) {
  let importedCount = 0;

  HANDOVER_STORAGE_KEYS.forEach((key) => {
    const value = storageData[key];
    if (value !== undefined && value !== null) {
      localStorage.setItem(key, String(value));
      importedCount += 1;
    }
  });

  return importedCount;
}

function readHandoverPayload() {
  if (window.name) {
    try {
      const payload = JSON.parse(window.name);
      if (payload.type === HANDOVER_RESPONSE_TYPE && payload.storage) {
        return payload;
      }
    } catch {
      // Try the URL hash fallback below.
    }
  }

  const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  const handoverData = hashParams.get("handoverData");
  if (!handoverData) return null;

  const payload = JSON.parse(handoverData);
  if (payload.type !== HANDOVER_RESPONSE_TYPE || !payload.storage) return null;
  return payload;
}

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

  useEffect(() => {
    if (!window.name && !window.location.hash.includes("handoverData=")) return;

    try {
      const payload = readHandoverPayload();
      if (!payload) return;

      const importedCount = importHandoverStorage(payload.storage);
      setHandoverStatus(
        importedCount > 0
          ? `引き継ぎが完了しました。${importedCount}件のデータを保存しました。`
          : "前のサイトに引き継げるデータが見つかりませんでした。"
      );
    } catch {
      setHandoverStatus("引き継ぎデータの読み込みに失敗しました。もう一度お試しください。");
    } finally {
      window.name = "";
      window.history.replaceState(null, "", window.location.pathname);
    }
  }, []);

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

    const returnUrl = new URL(window.location.href);
    returnUrl.search = "";
    returnUrl.hash = "";
    const handoverUrl = new URL(LEGACY_SITE_URL);
    handoverUrl.searchParams.set("handover", "1");
    handoverUrl.searchParams.set("returnUrl", returnUrl.toString());

    window.location.assign(handoverUrl.toString());
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
