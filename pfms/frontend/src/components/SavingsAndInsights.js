import React from 'react';
import { Typography, Box, Paper, Grid, List, ListItem, ListItemText, Divider } from '@mui/material';
import { formatCurrency } from './Expenses';

const SavingsAndInsights = ({ expensesList, monthlyBudget, currency }) => {
  // Calculate total expenses
  const totalExpenses = expensesList.reduce((total, expense) => total + expense.cost, 0);
  
  // Calculate remaining budget
  const remainingBudget = monthlyBudget - totalExpenses;
  
  // Calculate average daily spending
  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const daysPassed = Math.floor((today - firstDayOfMonth) / (1000 * 60 * 60 * 24)) + 1;
  const averageDailySpending = totalExpenses / daysPassed;
  
  // Calculate projected monthly spending
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const projectedMonthlySpending = averageDailySpending * daysInMonth;
  
  // Calculate savings potential
  const savingsPotential = monthlyBudget - projectedMonthlySpending;
  
  // Categorise expenses
  const expensesByCategory = expensesList.reduce((acc, expense) => {
    if (!acc[expense.category]) {
      acc[expense.category] = 0;
    }
    acc[expense.category] += expense.cost;
    return acc;
  }, {});
  
  // Get top spending category
  const topCategory = Object.entries(expensesByCategory).sort((a, b) => b[1] - a[1])[0];
  
  // Generate personalised insights
  const generateInsights = () => {
    const insights = [];
    
    // Budget insights
    if (remainingBudget < 0) {
      insights.push(`You've exceeded your monthly budget by ${formatCurrency(Math.abs(remainingBudget), currency)}. Consider reviewing your spending habits.`);
    } else {
      insights.push(`You have ${formatCurrency(remainingBudget, currency)} remaining in your monthly budget.`);
    }
    
    // Spending pace insights
    if (projectedMonthlySpending > monthlyBudget) {
      insights.push(`At your current spending rate, you're projected to exceed your budget by ${formatCurrency(projectedMonthlySpending - monthlyBudget, currency)} this month.`);
    } else {
      insights.push(`At your current spending rate, you're on track to save ${formatCurrency(savingsPotential, currency)} this month.`);
    }
    
    // Category insights
    if (topCategory) {
      insights.push(`Your top spending category is ${topCategory[0]}, accounting for ${formatCurrency(topCategory[1], currency)} (${(topCategory[1] / totalExpenses * 100).toFixed(1)}%) of your expenses.`);
    }
    
    // Daily spending insights
    if (averageDailySpending > (monthlyBudget / daysInMonth)) {
      insights.push(`Your average daily spending of ${formatCurrency(averageDailySpending, currency)} is higher than your recommended daily budget of ${formatCurrency(monthlyBudget / daysInMonth, currency)}.`);
    } else {
      insights.push(`Great job! Your average daily spending of ${formatCurrency(averageDailySpending, currency)} is below your recommended daily budget.`);
    }
    
    return insights;
  };

  const insights = generateInsights();

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Spending & Insights</Typography>
      <Typography variant="subtitle1" gutterBottom>
        Personalised financial insights based on your spending patterns
      </Typography>
      
      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>Key Metrics</Typography>
            <List>
              <ListItem>
                <ListItemText 
                  primary="Monthly Budget" 
                  secondary={formatCurrency(monthlyBudget, currency)} 
                />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemText 
                  primary="Total Expenses This Month" 
                  secondary={formatCurrency(totalExpenses, currency)} 
                />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemText 
                  primary="Remaining Budget" 
                  secondary={formatCurrency(remainingBudget, currency)} 
                  secondaryTypographyProps={{ 
                    color: remainingBudget >= 0 ? 'success.main' : 'error.main',
                    fontWeight: 'bold'
                  }}
                />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemText 
                  primary="Projected Monthly Spending" 
                  secondary={formatCurrency(projectedMonthlySpending, currency)} 
                  secondaryTypographyProps={{ 
                    color: projectedMonthlySpending <= monthlyBudget ? 'success.main' : 'error.main',
                    fontWeight: 'bold'
                  }}
                />
              </ListItem>
            </List>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>Personalised Insights</Typography>
            <List>
              {insights.map((insight, index) => (
                <React.Fragment key={index}>
                  <ListItem>
                    <ListItemText primary={insight} />
                  </ListItem>
                  {index < insights.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Grid>
        
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Actionable Recommendations</Typography>
            <List>
              <ListItem>
                <ListItemText 
                  primary="Review your top spending categories" 
                  secondary="Consider if there are areas where you can reduce unnecessary spending." 
                />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemText 
                  primary="Set up savings goals" 
                  secondary={`Based on your current spending, you could potentially save ${formatCurrency(savingsPotential > 0 ? savingsPotential : 0, currency)} this month.`} 
                />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemText 
                  primary="Track daily spending" 
                  secondary="Monitor your daily expenses to stay within your budget." 
                />
              </ListItem>
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SavingsAndInsights;
