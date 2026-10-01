export type ChatModelOption = {
  id: string;
  label: string;
  description: string;
  local: true;
};

// Placeholder "auto" — serwer sam wykrywa aktywny model w LM Studio
export const LM_STUDIO_AUTO: ChatModelOption = {
  id: "lm-studio",
  label: "🖥️ LM Studio (auto)",
  description: "Używa aktualnie załadowanego modelu w LM Studio",
  local: true,
};

// Statyczna lista do exports — dynamiczne modele dochodzą w model-select
export const CHAT_MODELS: ChatModelOption[] = [LM_STUDIO_AUTO];

export const DEFAULT_MODEL_ID = LM_STUDIO_AUTO.id;
