import type { AISettings, FormData } from "@/types/routePlanner";
import type { PlaceCategory } from "@/types/placeFinder";

export type PlaceTransferTarget = "destination" | "append-stage" | "replace-stage";

export interface PlaceFinderTransferPayload {
  placeName: string;
  locality: string;
  category: PlaceCategory;
  target: PlaceTransferTarget;
  stageIndex?: number;
  transferredAt: number;
}

interface PlaceTransferLabelInput {
  placeName: string;
  locality?: string;
}

interface PlannerDraftPayload {
  formData?: FormData;
  aiSettings?: AISettings;
}

const PLACE_FINDER_TRANSFER_KEY = "cr_place_finder_transfer";
export const PLANNER_DRAFT_KEY = "cr_planner_draft_v1";

export const buildPlaceTransferLabel = ({ placeName, locality }: PlaceTransferLabelInput) => {
  const trimmedPlaceName = placeName.trim();
  const trimmedLocality = locality?.trim() || "";

  return trimmedLocality ? `${trimmedPlaceName}, ${trimmedLocality}` : trimmedPlaceName;
};

export const storePlaceFinderTransfer = (payload: Omit<PlaceFinderTransferPayload, "transferredAt">) => {
  if (typeof window === "undefined") return;

  const nextPayload: PlaceFinderTransferPayload = {
    ...payload,
    transferredAt: Date.now(),
  };

  sessionStorage.setItem(PLACE_FINDER_TRANSFER_KEY, JSON.stringify(nextPayload));
};

export const consumePlaceFinderTransfer = (): PlaceFinderTransferPayload | null => {
  if (typeof window === "undefined") return null;

  const raw = sessionStorage.getItem(PLACE_FINDER_TRANSFER_KEY);
  if (!raw) return null;

  sessionStorage.removeItem(PLACE_FINDER_TRANSFER_KEY);

  try {
    const parsed = JSON.parse(raw);
    if (!parsed?.placeName || !parsed?.target) {
      return null;
    }

    const target: PlaceTransferTarget =
      parsed.target === "destination" || parsed.target === "replace-stage" ? parsed.target : "append-stage";

    return {
      placeName: String(parsed.placeName),
      locality: String(parsed.locality || ""),
      category: parsed.category === "camp_site" ? "camp_site" : "caravan_site",
      target,
      stageIndex: typeof parsed.stageIndex === "number" ? parsed.stageIndex : undefined,
      transferredAt: Number(parsed.transferredAt || Date.now()),
    };
  } catch {
    return null;
  }
};

export const readPlannerDraft = (): PlannerDraftPayload | null => {
  if (typeof window === "undefined") return null;

  const raw = sessionStorage.getItem(PLANNER_DRAFT_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as PlannerDraftPayload;
  } catch {
    sessionStorage.removeItem(PLANNER_DRAFT_KEY);
    return null;
  }
};

export const writePlannerDraft = (payload: PlannerDraftPayload) => {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(PLANNER_DRAFT_KEY, JSON.stringify(payload));
};

export const clearPlannerDraft = () => {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(PLANNER_DRAFT_KEY);
};
