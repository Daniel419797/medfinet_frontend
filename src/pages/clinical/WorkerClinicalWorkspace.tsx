import { useContext } from "react";
import UserContext from "../../contexts/UserContext";
import ClinicalOperations from "./ClinicalOperations";
import NutritionOperations from "./NutritionOperations";

export default function WorkerClinicalWorkspace() {
  const { currentMembership } = useContext(UserContext);

  if (currentMembership?.role === "NUTRITION_WORKER") {
    return <NutritionOperations />;
  }

  return <ClinicalOperations />;
}
