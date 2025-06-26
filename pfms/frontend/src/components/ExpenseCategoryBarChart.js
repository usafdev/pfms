import React, { useState } from 'react';
import { 
  Typography, 
  Box, 
  Paper, 
  ToggleButtonGroup, 
  ToggleButton 
} from '@mui/material';
// Function to format currency based on the selected currency
const formatCurrency = (amount, currency) => {
  const options = {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  };

  if (['USD', 'JPY'].includes(currency)) {
    options.currencyDisplay = 'narrowSymbol';
  }

  return new Intl.NumberFormat(undefined, options)
    .format(amount)
    .replace(/^[A-Z]{3}\s?/, '');
};
// Dates again
const getStartOfDay = (date) => {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  return start;
};

const getEndOfDay = (date) => {
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);
  return end;
};

const getStartOfWeek = (date) => {
  const start = new Date(date);
  start.setDate(start.getDate() - start.getDay());
  start.setHours(0, 0, 0, 0);
  return start;
};

const getEndOfWeek = (date) => {
  const end = new Date(date);
  end.setDate(end.getDate() - end.getDay() + 6);
  end.setHours(23, 59, 59, 999);
  return end;
};

const getStartOfMonth = (date) => {
  const start = new Date(date);
  start.setDate(1);
  start.setHours(0, 0, 0, 0);
  return start;
};

const getEndOfMonth = (date) => {
  const end = new Date(date);
  end.setMonth(end.getMonth() + 1);
  end.setDate(0);
  end.setHours(23, 59, 59, 999);
  return end;
};

const ExpenseCategoryBarChart = ({ expensesList, currency }) => {
  const [timeRange, setTimeRange] = useState('week');
  const today = new Date();

  const getFilteredExpenses = () => {
    let startDate, endDate;
    
    switch (timeRange) {
      case 'day':
        startDate = getStartOfDay(today);
        endDate = getEndOfDay(today);
        break;
      case 'week':
        startDate = getStartOfWeek(today);
        endDate = getEndOfWeek(today);
        break;
      case 'month':
        startDate = getStartOfMonth(today);
        endDate = getEndOfMonth(today);
        break;
      default:
        startDate = getStartOfWeek(today);
        endDate = getEndOfWeek(today);
    }

    return expensesList.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate >= startDate && expenseDate <= endDate;
    });
  };

  const filteredExpenses = getFilteredExpenses();

  const expensesByCategory = filteredExpenses.reduce((acc, expense) => {
    const category = expense.category;
    if (!acc[category]) {
      acc[category] = 0;
    }
    acc[category] += expense.cost;
    return acc;
  }, {});

  const data = Object.keys(expensesByCategory).map(category => ({
    name: category,
    cost: expensesByCategory[category]
  }));

  const maxCost = Math.max(...data.map(item => item.cost), 0);

  const getTitle = () => {
    switch (timeRange) {
      case 'day':
        return 'Expenses by Category (Today)';
      case 'week':
        return 'Expenses by Category (This Week)';
      case 'month':
        return 'Expenses by Category (This Month)';
      default:
        return 'Expenses by Category';
    }
  };

  const handleTimeRangeChange = (event, newTimeRange) => {
    if (newTimeRange !== null) {
      setTimeRange(newTimeRange);
    }
  };

  if (data.length === 0) {
    return (
      <Paper elevation={3} sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h5" gutterBottom>{getTitle()}</Typography>
          <ToggleButtonGroup
            value={timeRange}
            exclusive
            onChange={handleTimeRangeChange}
            size="small"
          >
            <ToggleButton value="day">Daily</ToggleButton>
            <ToggleButton value="week">Weekly</ToggleButton>
            <ToggleButton value="month">Monthly</ToggleButton>
          </ToggleButtonGroup>
        </Box>
        <Typography variant="body1">No expenses found for this period.</Typography>
      </Paper>
    );
  }

  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5" gutterBottom>{getTitle()}</Typography>
        <ToggleButtonGroup
          value={timeRange}
          exclusive
          onChange={handleTimeRangeChange}
          size="small"
        >
          <ToggleButton value="day">Daily</ToggleButton>
          <ToggleButton value="week">Weekly</ToggleButton>
          <ToggleButton value="month">Monthly</ToggleButton>
        </ToggleButtonGroup>
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {data.map((item, index) => (
          <Box key={index} sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ 
              width: '100%',
              mr: 2,
              display: 'flex',
              alignItems: 'center'
            }}>
              <Box sx={{ 
                width: `${(item.cost / maxCost) * 100}%`,
                height: 20,
                bgcolor: 'primary.main',
                borderRadius: 1,
                transition: 'width 0.5s ease'
              }} />
              <Typography variant="body2" sx={{ ml: 1, minWidth: 100 }}>
                {item.name}
              </Typography>
            </Box>
            <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
              {formatCurrency(item.cost, currency)}
            </Typography>
          </Box>
        ))}
      </Box>
    </Paper>
  );
};

export default ExpenseCategoryBarChart;
