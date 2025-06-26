import React, { useState } from 'react';
import { 
  TextField, Typography, Button, Container, Box, List, ListItem, 
  ListItemText, IconButton, Fade, FormControlLabel, Switch, 
  MenuItem, Select, Grid 
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EventIcon from '@mui/icons-material/Event';
// Function to format currency based on the selected currency
export const formatCurrency = (amount, currency) => {
  const formatter = new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  return formatter.format(amount);
};
// Component for managing expenses
const Expenses = ({ expensesList, setExpensesList, deletedExpenses, setDeletedExpenses, currency }) => {
  const [expenseName, setExpenseName] = useState('');
  const [cost, setCost] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isRecurring, setIsRecurring] = useState(false);
  const [frequency, setFrequency] = useState('monthly');
  const [endDate, setEndDate] = useState('');
  // Function to handle adding a new expense
  const handleAddExpense = (e) => {
    e.preventDefault();

    const newExpense = {
      expense_name: expenseName,
      cost: parseFloat(cost),
      category,
      date,
      
      isRecurringDisplay: isRecurring,
      frequencyDisplay: frequency,
      endDateDisplay: endDate
    };

    setExpensesList((prevExpenses) => [...prevExpenses, newExpense]);
    // Reset form fields after adding the expense
    setExpenseName('');
    setCost('');
    setCategory('');
    setDate(new Date().toISOString().split('T')[0]);
    setIsRecurring(false);
    setFrequency('monthly');
    setEndDate('');
  };
  // Function to handle removing an expense
  const handleRemoveExpense = (indexToRemove) => {
    const expenseToRemove = expensesList[indexToRemove];
    setExpensesList((prevExpenses) =>
      prevExpenses.filter((_, index) => index !== indexToRemove)
    );
    // If the expense has an ID, add it to the deleted expenses list
    if (expenseToRemove.id) {
      setDeletedExpenses((prevDeleted) => [...prevDeleted, expenseToRemove.id]);
    }
  };

  return (
    <Fade in timeout={1000}>
      <Container maxWidth="sm">
        <Typography variant="h4" gutterBottom>Create New Expense</Typography>

        <form onSubmit={handleAddExpense}>
          <Box mb={2}>
            <TextField
              label="Expense Name"
              variant="outlined"
              value={expenseName}
              onChange={(e) => setExpenseName(e.target.value)}
              required
              fullWidth
            />
          </Box>
          <Box mb={2}>
            <TextField
              label={`Cost (${currency})`}
              type="number"
              variant="outlined"
              value={cost}
              onChange={(e) => setCost(e.target.value)}
              required
              fullWidth
              InputProps={{
                inputProps: { 
                  min: 0,
                  step: 0.01
                }
              }}
            />
          </Box>
          <Box mb={2}>
            <TextField
              label="Category"
              variant="outlined"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
              fullWidth
            />
          </Box>
          <Box mb={2}>
            <TextField
              label="Date"
              type="date"
              variant="outlined"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              fullWidth
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Box>
          
          <Box mb={2} sx={{ border: '1px solid rgba(0, 0, 0, 0.12)', borderRadius: 1, p: 2 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={isRecurring}
                  onChange={() => setIsRecurring(!isRecurring)}
                  color="primary"
                />
              }
              label="Recurring Expense"
            />
            
            {isRecurring && (
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={6}>
                  <Select
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value)}
                    fullWidth
                    size="small"
                  >
                    <MenuItem value="weekly">Weekly</MenuItem>
                    <MenuItem value="bi-weekly">Bi-weekly</MenuItem>
                    <MenuItem value="monthly">Monthly</MenuItem>
                    <MenuItem value="quarterly">Quarterly</MenuItem>
                    <MenuItem value="yearly">Yearly</MenuItem>
                  </Select>
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    type="date"
                    label="End Date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    fullWidth
                    size="small"
                    InputLabelProps={{
                      shrink: true,
                    }}
                    InputProps={{
                      startAdornment: <EventIcon fontSize="small" sx={{ mr: 1 }} />,
                    }}
                  />
                </Grid>
              </Grid>
            )}
          </Box>

          <Button type="submit" variant="contained" color="primary" fullWidth>
            Add Expense
          </Button>
        </form>

        <Box mt={4}>
          <Typography variant="h5" gutterBottom>Expense List:</Typography>
          <List>
            {expensesList.map((expense, index) => (
              <ListItem key={index}>
                <ListItemText 
                  primary={`${expense.expense_name} - ${formatCurrency(expense.cost, currency)} - ${expense.category} - ${expense.date}`} 
                  secondary={
                    expense.isRecurringDisplay ? (
                      <span style={{ display: 'flex', alignItems: 'center', marginTop: 4 }}>
                        <EventIcon fontSize="small" color="action" sx={{ mr: 0.5 }} />
                        {`Recurs ${expense.frequencyDisplay}${expense.endDateDisplay ? ` until ${expense.endDateDisplay}` : ''}`}
                      </span>
                    ) : null
                  }
                />
                <IconButton edge="end" aria-label="delete" onClick={() => handleRemoveExpense(index)}>
                  <DeleteIcon />
                </IconButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Container>
    </Fade>
  );
};

export default Expenses;
