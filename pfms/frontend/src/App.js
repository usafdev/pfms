import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, IconButton, Container, Box, Grid, Fade, Menu, MenuItem, useTheme, Paper } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import Login from './components/Login';
import Signup from './components/Signup';
import BudgetingAndSavings from './components/BudgetingAndSavings';
import Expenses from './components/Expenses';
import CloudSync from './components/CloudSync';
import ExpenseCategoryBarChart from './components/ExpenseCategoryBarChart';
import ExpenseAnalysis from './components/ExpenseAnalysis';
import SavingsAndInsights from './components/SavingsAndInsights';
import getTheme from './theme';
import { ThemeProvider } from '@mui/material/styles';

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
// Main content component of the application
const AppContent = ({ username, setUsername, themeMode, toggleThemeMode }) => {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState(null);
  const [expensesList, setExpensesList] = useState([]);
  const [monthlyBudget, setMonthlyBudget] = useState(0);
  const [dailyGoal, setDailyGoal] = useState(0);
  const [deletedExpenses, setDeletedExpenses] = useState([]);
  const [currency, setCurrency] = useState(localStorage.getItem('currency') || 'USD');
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId');
  // Effect to load expenses and budget from local storage on component mount
  useEffect(() => {
    if (token) {
      const savedExpenses = JSON.parse(localStorage.getItem('expensesList')) || [];
      const savedBudget = parseFloat(localStorage.getItem('monthlyBudget')) || 0;
      setExpensesList(savedExpenses);
      setMonthlyBudget(savedBudget);
    }
  }, [token]);
  // Effect to save expenses and budget to local storage whenever they change
  useEffect(() => {
    if (token) {
      localStorage.setItem('expensesList', JSON.stringify(expensesList));
      localStorage.setItem('monthlyBudget', monthlyBudget.toString());
    }
  }, [expensesList, monthlyBudget, token]);
  // Effect to save currency to local storage whenever it changes
  useEffect(() => {
    localStorage.setItem('currency', currency);
  }, [currency]);
  // Calculate total expenses for today
  const today = new Date().toISOString().split('T')[0];
  const totalSpentToday = expensesList
    .filter(expense => expense.date === today)
    .reduce((total, expense) => total + expense.cost, 0);
  // Effect to calculate daily goal based on monthly budget
  useEffect(() => {
    if (monthlyBudget) {
      setDailyGoal((monthlyBudget / 30).toFixed(2));
    }
  }, [monthlyBudget]);
  // Function to handle user logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('userId');
    localStorage.removeItem('expensesList');
    localStorage.removeItem('monthlyBudget');
    setUsername('');
    setExpensesList([]);
    setMonthlyBudget(0);
    navigate('/');
  };
  // Function to open the menu
  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };
  // Function to close the menu
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  // Function to toggle theme mode
  const handleToggleTheme = () => {
    const newMode = themeMode === 'dark' ? 'light' : 'dark';
    toggleThemeMode(newMode);
    localStorage.setItem('themeMode', newMode);
    handleMenuClose();
  };
  // Function to change currency
  const handleCurrencyChange = (newCurrency) => {
    setCurrency(newCurrency);
    handleMenuClose();
  };

  return (
    <div style={{ backgroundColor: theme.palette.background.default, minHeight: '100vh' }}>
      <AppBar position="static">
        <Toolbar>
          <IconButton edge="start" color="inherit" aria-label="menu" onClick={handleMenuOpen}>
            <MenuIcon />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={handleToggleTheme}>
              {themeMode === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            </MenuItem>
            <MenuItem onClick={() => handleCurrencyChange('USD')}>$ Dollar</MenuItem>
            <MenuItem onClick={() => handleCurrencyChange('EUR')}>€ Euro</MenuItem>
            <MenuItem onClick={() => handleCurrencyChange('GBP')}>£ Pound</MenuItem>
            <MenuItem onClick={() => handleCurrencyChange('JPY')}>¥ Yen</MenuItem>
          </Menu>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, color: '#ffffff' }}>
            PFMS
          </Typography>
          <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
            <Button color="inherit" component={Link} to="/">Home</Button>
            <Button color="inherit" component={Link} to="/budgeting">Budgeting</Button>
            <Button color="inherit" component={Link} to="/create-expense">Expenses</Button>
            <Button color="inherit" component={Link} to="/savings-insights">Spending & Insights</Button>
            <Button color="inherit" component={Link} to="/cloud-sync">Cloud Sync</Button>
            <Button color="inherit" component={Link} to="/expense-analysis">Analysis</Button>
            {!token ? (
              <>
                <Button color="inherit" component={Link} to="/login">Login</Button>
                <Button color="inherit" component={Link} to="/signup">Sign Up</Button>
              </>
            ) : (
              <Button color="inherit" onClick={handleLogout}>Logout</Button>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" style={{ marginTop: '20px' }}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Routes>
              <Route path="/" element={<Home username={username} totalSpent={totalSpentToday} dailyGoal={dailyGoal} expensesList={expensesList} currency={currency} />} />
              <Route path="/login" element={<Login setUsername={setUsername} />} />
              <Route path="/signup" element={<Signup />} />
              <Route
                path="/budgeting"
                element={
                  <BudgetingAndSavings
                    expensesList={expensesList}
                    monthlyBudget={monthlyBudget}
                    setMonthlyBudget={setMonthlyBudget}
                    currency={currency}
                  />
                }
              />
              <Route path="/create-expense" element={<Expenses expensesList={expensesList} setExpensesList={setExpensesList} deletedExpenses={deletedExpenses} setDeletedExpenses={setDeletedExpenses} currency={currency} />} />
              <Route path="/cloud-sync" element={<CloudSync expensesList={expensesList} setExpensesList={setExpensesList} monthlyBudget={monthlyBudget} setMonthlyBudget={setMonthlyBudget} userId={userId} deletedExpenses={deletedExpenses} setDeletedExpenses={setDeletedExpenses} />} />
              <Route path="/expense-analysis" element={<ExpenseAnalysis expensesList={expensesList} currency={currency} />} />
              <Route 
                path="/savings-insights" 
                element={
                  <SavingsAndInsights 
                    expensesList={expensesList} 
                    monthlyBudget={monthlyBudget} 
                    currency={currency} 
                  />
                } 
              />
            </Routes>
          </Grid>
        </Grid>
      </Container>
    </div>
  );
};
// Home component to display the homepage
const Home = ({ username, totalSpent, dailyGoal, expensesList, currency }) => {
  const theme = useTheme();
  const goalStatusColor = totalSpent <= dailyGoal ? theme.palette.success.main : theme.palette.error.main;
  const percentageSpent = dailyGoal ? Math.min(100, (totalSpent / dailyGoal) * 100) : 0;
  const remainingDaily = Math.max(0, dailyGoal - totalSpent);

  return (
    <Fade in timeout={1000}>
      <Container maxWidth="md">
        <Box textAlign="center" mb={4}>
          <Typography variant="h3" gutterBottom sx={{ fontWeight: 'bold' }}>
            {username ? `Welcome back, ${username}!` : 'Welcome to PFMS'}
          </Typography>
        </Box>

        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 'medium' }}>
                Today's Expenses
              </Typography>
              
              <Box sx={{ 
                height: 10, 
                bgcolor: 'divider', 
                borderRadius: 5, 
                mb: 2,
                overflow: 'hidden'
              }}>
                <Box 
                  sx={{ 
                    height: '100%', 
                    width: `${percentageSpent}%`, 
                    bgcolor: goalStatusColor,
                    transition: 'width 0.5s ease, background-color 0.5s ease'
                  }} 
                />
              </Box>

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body1">Spent:</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {formatCurrency(totalSpent, currency)}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body1">Remaining:</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {formatCurrency(remainingDaily, currency)}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body1">Daily Goal:</Typography>
                  <Typography variant="h5">
                    {formatCurrency(dailyGoal, currency)}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 'medium' }}>
                Statistics
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box>
                  <Typography variant="body1">This Week:</Typography>
                  <Typography variant="h6">
                    {formatCurrency(
                      expensesList
                        .filter(e => new Date(e.date) >= new Date(new Date().setDate(new Date().getDate() - 7)))
                        .reduce((sum, e) => sum + e.cost, 0),
                      currency
                    )}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body1">This Month:</Typography>
                  <Typography variant="h6">
                    {formatCurrency(
                      expensesList
                        .filter(e => new Date(e.date).getMonth() === new Date().getMonth())
                        .reduce((sum, e) => sum + e.cost, 0),
                      currency
                    )}
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12}>
            <ExpenseCategoryBarChart expensesList={expensesList} currency={currency} />
          </Grid>
        </Grid>
      </Container>
    </Fade>
  );
};
// States to store username and theme
const App = () => {
  const [username, setUsername] = useState(localStorage.getItem('username') || '');
  const [themeMode, setThemeMode] = useState(localStorage.getItem('themeMode') || 'dark');

  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    setUsername(storedUsername || '');
  }, []);
  // Function to toggle theme mode
  const toggleThemeMode = (mode) => {
    localStorage.setItem('themeMode', mode);
    setThemeMode(mode);
  };

  const theme = getTheme(themeMode);

  return (
    <ThemeProvider theme={theme}>
      <Router>
        <AppContent username={username} setUsername={setUsername} themeMode={themeMode} toggleThemeMode={toggleThemeMode} />
      </Router>
    </ThemeProvider>
  );
};

export default App;
