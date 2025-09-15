import React, { useState } from "react";
import { Box, TextField, IconButton, CircularProgress } from "@mui/material";
import { Check } from "@mui/icons-material";

const BudgetCell = ({
  value,
  campaignId,
  onUpdate,
  onSnackbarOpen,
}) => {
  const [budget, setBudget] = useState(value);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleBudgetChange = (e) => {
    setBudget(Number(e.target.value));
  };

  const handleUpdate = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) throw new Error("No access token found");
      setIsUpdating(true);

      const payload = {
        Campaign_ID: String(campaignId),
        Budget: Number(budget),
      };

      const response = await fetch(
        `https://react-api-script.onrender.com/samsonite/budget-change?platform=Flipkart`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) throw new Error("Failed to update budget");

      // You can check payload here in the console if needed:
      // console.log("Sent payload:", payload);

      const updatedData = await response.json();
      onUpdate(campaignId, budget);

      onSnackbarOpen("Budget updated successfully!", "success");
    } catch (error) {
      console.error("Error updating budget:", error);
      onSnackbarOpen("Failed to update budget!", "error");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Box sx={{ display: "flex", justifyContent: "flex-start", alignItems: "center", gap: 1, width: "100%", height: "100%" }}>
      <TextField
        type="number"
        variant="outlined"
        size="small"
        value={budget}
        onChange={handleBudgetChange}
        sx={{ width: "140px" }}
        disabled={isUpdating}
      />
      <IconButton color="primary" onClick={handleUpdate} disabled={isUpdating}>
        {isUpdating ? <CircularProgress size={24} /> : <Check />}
      </IconButton>
    </Box>
  );
};

export default BudgetCell;
