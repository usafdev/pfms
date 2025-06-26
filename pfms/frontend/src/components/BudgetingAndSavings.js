import React, { useState, useEffect, useCallback } from 'react';
import { TextField, Typography, Container, Box, Fade } from '@mui/material';

// Function to format currency based on the selected currency
const formatCurrency = (amount, currency) => {
  const formatter = new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  return formatter.format(amount);
};

// Component for budgeting and savings
const BudgetingAndSavings = ({ expensesList, monthlyBudget, setMonthlyBudget, currency }) => {
  const [remainingBudget, setRemainingBudget] = useState(0);
  const [dailyGoal, setDailyGoal] = useState(0);
  // Function to handle key press events on the text field
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      const budget = parseFloat(e.target.value);
      if (!isNaN(budget)) {
        setMonthlyBudget(budget);
      }
    }
  };
  // Callback function to calculate remaining budget and daily goal
  const calculateBudget = useCallback(() => {
    const totalSpentSoFar = expensesList.reduce((total, expense) => total + expense.cost, 0);
    const remaining = monthlyBudget - totalSpentSoFar;
    const daysLeft = Math.max(1, 30 - Math.floor(totalSpentSoFar / ((monthlyBudget || 1) / 30))); 
    const suggestedGoal = daysLeft > 0 ? remaining / daysLeft : 0;
    
    setRemainingBudget(remaining);
    setDailyGoal(suggestedGoal);
  }, [expensesList, monthlyBudget]);
  // Effect to calculate budget whenever monthly budget changes
  useEffect(() => {
    if (monthlyBudget > 0) {
      calculateBudget();
    }
  }, [calculateBudget, monthlyBudget]);

  return (
    <Fade in timeout={1000}>
      <Container maxWidth="sm">
        <Typography variant="h4" gutterBottom>Budgeting and Savings</Typography>
        <Typography variant="body1" gutterBottom>Track your expenses and savings goals here.</Typography>

        <Box mt={2}>
          <TextField
            label={`Set your monthly budget (${currency})`}
            type="number"
            variant="outlined"
            onKeyPress={handleKeyPress}
            defaultValue={monthlyBudget}
            fullWidth
            InputProps={{
              inputProps: { 
                min: 0,
                step: 0.01
              }
            }}
          />
        </Box>

        <Box mt={4}>
          <Typography variant="h5" gutterBottom>Insights:</Typography>
          <Typography variant="body1">
            <strong>Remaining Budget:</strong> {formatCurrency(remainingBudget, currency)} left for the month.
          </Typography>
          <Typography variant="body1">
            <strong>Suggested Daily Goal:</strong> {formatCurrency(dailyGoal, currency)} per day to stay on track.
          </Typography>
        </Box>
      </Container>
    </Fade>
  );
};

export default BudgetingAndSavings;
