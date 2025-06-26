import React, { useState } from 'react';
import { 
  Typography, 
  Box, 
  Paper, 
  Grid,
  ToggleButtonGroup,
  ToggleButton
} from '@mui/material';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
// Array of colors for the pie chart
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];
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
// Functions to get the start and end of given dates
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

const getStartOfYear = (date) => {
  const start = new Date(date);
  start.setMonth(0, 1);
  start.setHours(0, 0, 0, 0);
  return start;
};

const getEndOfYear = (date) => {
  const end = new Date(date);
  end.setMonth(11, 31);
  end.setHours(23, 59, 59, 999);
  return end;
};
// Component for expense analysis
const ExpenseAnalysis = ({ expensesList, currency }) => {
  const [timeRange, setTimeRange] = useState('week');
  const today = new Date();
  // Function to filter expenses based on the selected time range
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
      case 'year':
        startDate = getStartOfYear(today);
        endDate = getEndOfYear(today);
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
// Filtered expenses based on the selected time range
  const filteredExpenses = getFilteredExpenses();
  // Calculate total expenses for the filtered period
  const totalExpenses = filteredExpenses.reduce((total, expense) => total + expense.cost, 0);
  // Group expenses by category
  const expensesByCategory = filteredExpenses.reduce((acc, expense) => {
    if (!acc[expense.category]) {
      acc[expense.category] = 0;
    }
    acc[expense.category] += expense.cost;
    return acc;
  }, {});
  // Convert expensesByCategory to an array of objects for the chart
  const data = Object.keys(expensesByCategory).map(category => ({
    name: category,
    value: expensesByCategory[category],
  }));
  // Function to get the title based on the selected time range
  const getTitle = () => {
    switch (timeRange) {
      case 'day':
        return 'Expense Analysis (Today)';
      case 'week':
        return 'Expense Analysis (This Week)';
      case 'month':
        return 'Expense Analysis (This Month)';
      case 'year':
        return 'Expense Analysis (This Year)';
      default:
        return 'Expense Analysis';
    }
  };
  // Function to handle time range change
  const handleTimeRangeChange = (event, newTimeRange) => {
    if (newTimeRange !== null) {
      setTimeRange(newTimeRange);
    }
  };

  return (
    <Paper elevation={3} style={{ padding: '20px', margin: '20px 0' }}>
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
          <ToggleButton value="year">Yearly</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {data.length === 0 ? (
        <Typography variant="body1">No expenses found for this period.</Typography>
      ) : (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Box mb={2}>
              <Typography variant="h6" gutterBottom>
                Total Expenses: {formatCurrency(totalExpenses, currency)}
              </Typography>
            </Box>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value, currency)} />
              </PieChart>
            </ResponsiveContainer>
          </Grid>
          <Grid item xs={12} md={6}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                width={500}
                height={300}
                data={data}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value, currency)} />
                <Legend />
                <Bar dataKey="value" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </Grid>
        </Grid>
      )}
    </Paper>
  );
};

export default ExpenseAnalysis;
