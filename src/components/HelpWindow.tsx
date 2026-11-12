// Инструкция игрока: тот же README.html, что кладётся рядом с программой в версии для Windows.

import readme from "../../src-tauri/README.html?raw";
import Modal from "./Modal";

export default function HelpWindow({ onClose }: { onClose: () => void }) {
  return (
    <Modal title="Инструкция" onClose={onClose} size="lg">
      <iframe title="Инструкция" srcDoc={readme} className="h-[70vh] w-full rounded-md border-0 bg-[#16130f]" />
    </Modal>
  );
}
