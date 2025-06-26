import React, { useState } from 'react';
import axios from 'axios';
import { Button, Typography, Container, Box, List, ListItem, CircularProgress, Fade } from '@mui/material';

const CloudSync = ({ expensesList, setExpensesList, monthlyBudget, setMonthlyBudget, userId, deletedExpenses, setDeletedExpenses }) => {
  const [status, setStatus] = useState('');
  const [syncData, setSyncData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

// Function to sync data to the cloud
const handleSyncToCloud = async () => {
  setIsLoading(true);
  setStatus('Syncing data to cloud...');

  try {
    console.log('Syncing expenses:', expensesList);
    console.log('Syncing budget:', monthlyBudget);

    // Fetch existing expenses from the cloud
    const expensesResponse = await axios.get(`http://localhost:8080/api/fetch/expenses/${userId}`);
    const existingExpenses = expensesResponse.data;

    // Create a map of existing expenses for quick lookup
    const existingExpensesMap = new Map();
    existingExpenses.forEach(expense => {
      existingExpensesMap.set(expense.id, expense);
    });

    // Prepare lists for insertion, update, and deletion
    const expensesToInsert = [];
    const expensesToUpdate = [];
    const expensesToDelete = deletedExpenses;

    expensesList.forEach(expense => {
      if (expense.id) {
        if (existingExpensesMap.has(expense.id)) {
          // If the expense already exists, add it to the update list
          expensesToUpdate.push(expense);
        } else {
          // If the expense does not exist, add it to the insert list
          expensesToInsert.push(expense);
        }
      } else {
        // If the expense does not have an ID, treat it as a new expense
        expensesToInsert.push(expense);
      }
    });

    // Insert new expenses
    if (expensesToInsert.length > 0) {
      await axios.post('http://localhost:8080/api/sync/expenses', {
        userId,
        expenses: expensesToInsert.map(expense => ({
          expense_name: expense.expense_name,
          cost: expense.cost,
          category: expense.category,
          date: expense.date
        }))
      });
    }

    // Update existing expenses
    if (expensesToUpdate.length > 0) {
      for (const expense of expensesToUpdate) {
        await axios.put(`http://localhost:8080/api/update/expense/${expense.id}`, {
          userId,
          expense_name: expense.expense_name,
          cost: expense.cost,
          category: expense.category,
          date: expense.date
        });
      }
    }

    // Delete expenses
    if (expensesToDelete.length > 0) {
      for (const expenseId of expensesToDelete) {
        await axios.delete(`http://localhost:8080/api/delete/expense/${expenseId}`);
      }
      setDeletedExpenses([]); // Clear deleted expenses after syncing
    }

    await axios.post('http://localhost:8080/api/sync/budget', {
      userId,
      monthlyBudget,
    });

    setStatus('Data synced successfully!');
  } catch (error) {
    setStatus('Failed to sync data.');
    console.error('Sync failed', error);
  } finally {
    setIsLoading(false);
  }
};

  // Function to fetch synced data from the cloud
  const handleFetchFromCloud = async () => {
    setIsLoading(true);
    setStatus('Fetching data from cloud...');

    try {
      const expensesResponse = await axios.get(`http://localhost:8080/api/fetch/expenses/${userId}`);
      const budgetResponse = await axios.get(`http://localhost:8080/api/fetch/budget/${userId}`);

      console.log('Fetched expenses:', expensesResponse.data);
      console.log('Fetched budget:', budgetResponse.data);

      setSyncData(expensesResponse.data);
      setExpensesList(expensesResponse.data.map(expense => ({
        ...expense,
        cost: parseFloat(expense.cost) || 0
      })));
      
      const fetchedBudget = parseFloat(budgetResponse.data?.monthly_budget);
      setMonthlyBudget(isNaN(fetchedBudget) ? 0 : fetchedBudget);
      

      setStatus('Data fetched successfully!');
    } catch (error) {
      setStatus('Failed to fetch data.');
      console.error('Fetch failed', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Fade in>
      <Container maxWidth="md">
        {/* Display status message */}
        <Box mt={2}>
          <Typography variant="body1" gutterBottom>{status}</Typography>
        </Box>

        {/* Buttons for syncing and fetching data */}
        <Box mt={2}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSyncToCloud}
            disabled={isLoading}
            style={{ marginRight: '10px' }}
          >
            {isLoading ? <CircularProgress size={24} /> : 'Sync to Cloud'}
          </Button>
          <Button
            variant="contained"
            color="secondary"
            onClick={handleFetchFromCloud}
            disabled={isLoading}
          >
            {isLoading ? <CircularProgress size={24} /> : 'Fetch from Cloud'}
          </Button>
        </Box>

        {/* Display synced data */}
        <Box mt={4}>
          <Typography variant="h5" gutterBottom>Cloud Data:</Typography>
          <List>
            {syncData.length === 0 ? (
              <Typography variant="body1">No data available. Sync first!</Typography>
            ) : (
              syncData.map((item, index) => (
                <ListItem key={index}>
                  {item.expense_name}: ${item.cost} - {item.date}
                </ListItem>
              ))
            )}
          </List>
        </Box>
      </Container>
    </Fade>
  );
};

export default CloudSync;