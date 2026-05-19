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

const LEGACY_SITE_ORIGIN = "https://soucrak12345.github.io";
const LEGACY_SITE_URL = `${LEGACY_SITE_ORIGIN}/tango1800/`;
const HANDOVER_REQUEST_TYPE = "GET_STORAGE";
const HANDOVER_RESPONSE_TYPE = "STORAGE_DATA";
const HANDOVER_TIMEOUT_MS = 10000;
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
    setHandoverStatus("前のサイトからデータを取得しています...");

    let iframe = null;
    let popup = null;
    let timeoutId = null;
    let requestIntervalId = null;

    const cleanup = () => {
      window.removeEventListener("message", handleMessage);
      if (timeoutId) window.clearTimeout(timeoutId);
      if (requestIntervalId) window.clearInterval(requestIntervalId);
      if (iframe) iframe.remove();
      if (popup && !popup.closed) popup.close();
      setIsHandingOver(false);
    };

    const importStorage = (storageData) => {
      let importedCount = 0;

      HANDOVER_STORAGE_KEYS.forEach((key) => {
        const value = storageData[key];
        if (value !== undefined && value !== null) {
          localStorage.setItem(key, String(value));
          importedCount += 1;
        }
      });

      cleanup();
      setHandoverStatus(
        importedCount > 0
          ? `引き継ぎが完了しました。${importedCount}件のデータを保存しました。`
          : "前のサイトに引き継げるデータが見つかりませんでした。"
      );
    };

    function handleMessage(e) {
      if (e.origin !== LEGACY_SITE_ORIGIN) return;
      if (!e.data || typeof e.data !== "object") return;

      if (e.data.type === HANDOVER_RESPONSE_TYPE) {
        importStorage(e.data.storage || {});
        return;
      }

      if (HANDOVER_STORAGE_KEYS.some((key) => Object.prototype.hasOwnProperty.call(e.data, key))) {
        importStorage(e.data);
      }
    }

    window.addEventListener("message", handleMessage);

    const handoverUrl = new URL(LEGACY_SITE_URL);
    handoverUrl.searchParams.set("handover", "1");
    handoverUrl.searchParams.set("origin", window.location.origin);

    popup = window.open(
      handoverUrl.toString(),
      "tango1800-handover",
      "popup,width=480,height=640"
    );

    if (!popup) {
      iframe = document.createElement("iframe");
      iframe.src = LEGACY_SITE_URL;
      iframe.style.display = "none";
      iframe.onload = () => {
        iframe.contentWindow.postMessage(
          { type: HANDOVER_REQUEST_TYPE },
          LEGACY_SITE_ORIGIN
        );
      };
      document.body.appendChild(iframe);
    } else {
      requestIntervalId = window.setInterval(() => {
        if (popup.closed) return;
        popup.postMessage({ type: HANDOVER_REQUEST_TYPE }, LEGACY_SITE_ORIGIN);
      }, 500);
    }

    timeoutId = window.setTimeout(() => {
      cleanup();
      setHandoverStatus("引き継ぎに失敗しました。ポップアップがブロックされていないか確認して、もう一度お試しください。");
    }, HANDOVER_TIMEOUT_MS);
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
