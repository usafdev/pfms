const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Database connection
const db = mysql.createConnection({
  host: 'your-endpoint', // enter your db endpoint
  user: 'your-user', // enter your db username
  password: 'your-password', // enter your db password
  database: 'your-database' // enter your db name
});

db.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err);
    return;
  }
  console.log('Connected to the MySQL database.');
});

// Helper function to find user by username
function findUserByUsername(username) {
  return new Promise((resolve, reject) => {
    db.query('SELECT * FROM users WHERE username = ?', [username], (err, results) => {
      if (err) reject(err);
      resolve(results[0]);
    });
  });
}

// Helper function to find user by ID
function findUserById(id) {
  return new Promise((resolve, reject) => {
    db.query('SELECT * FROM users WHERE id = ?', [id], (err, results) => {
      if (err) reject(err);
      resolve(results[0]);
    });
  });
}

// Login Route
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  console.log(`[INFO] Login attempt for username: ${username}`);

  try {
    const user = await findUserByUsername(username);
    
    if (user && user.password === password) {
      console.log(`[SUCCESS] User authenticated: ${username} (ID: ${user.id})`);
      res.json({ token: 'your-jwt-token-here', userId: user.id });
    } else {
      console.warn(`[WARNING] Invalid login credentials for username: ${username}`);
      res.status(401).json({ error: 'Invalid credentials' });
    }

  } catch (error) {
    console.error(`[ERROR] Login error for username: ${username} - ${error.message}`);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// Signup Route
app.post('/api/auth/signup', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await findUserByUsername(username);
    if (user) {
      return res.status(400).json({ error: 'User already exists' });
    }

    db.query('INSERT INTO users (username, password) VALUES (?, ?)', [username, password], (err, results) => {
      if (err) {
        res.status(500).json({ error: 'Internal server error' });
      } else {
        res.status(201).json({ message: 'Signup successful', userId: results.insertId });
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Sync Expenses Route
app.post('/api/sync/expenses', (req, res) => {
  const { userId, expenses } = req.body;
  if (!userId || !expenses) {
    return res.status(400).json({ error: 'Invalid data' });
  }

  expenses.forEach(expense => {
    db.query('INSERT INTO expenses (user_id, expense_name, cost, category, date) VALUES (?, ?, ?, ?, ?)', 
             [userId, expense.expense_name, expense.cost, expense.category, expense.date], (err) => {
      if (err) {
        console.error('Error inserting expense:', err);
        res.status(500).json({ error: 'Failed to sync expenses' });
        return;
      }
    });
  });
  res.status(200).json({ message: 'Expenses synced successfully' });
});

// Fetch Expenses Route
app.get('/api/fetch/expenses/:userId', (req, res) => {
    const userId = req.params.userId;
    if (!userId) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }
  
    db.query('SELECT * FROM expenses WHERE user_id = ?', [userId], (err, results) => {
      if (err) {
        return res.status(500).json({ error: 'Internal server error' });
      }
  
      // Modify date to remove time
      results.forEach(expense => {
        if (expense.date) {
          // If the date is a string, split it
          if (typeof expense.date === 'string') {
            expense.date = expense.date.split('T')[0];
          }
          // If the date is a Date object, format it
          else if (expense.date instanceof Date) {
            expense.date = expense.date.toISOString().split('T')[0];
          }
        }
      });
  
      res.json(results);
    });
  });
  

// Sync Budget Route
app.post('/api/sync/budget', (req, res) => {
  const { userId, monthlyBudget } = req.body;
  if (!userId || monthlyBudget === undefined) {
    return res.status(400).json({ error: 'Invalid data' });
  }

  db.query('INSERT INTO budgets (user_id, monthly_budget) VALUES (?, ?) ON DUPLICATE KEY UPDATE monthly_budget=VALUES(monthly_budget)', 
           [userId, monthlyBudget], (err) => {
    if (err) {
      console.error('Error inserting budget:', err);
      res.status(500).json({ error: 'Failed to sync budget' });
    } else {
      res.status(200).json({ message: 'Budget synced successfully' });
    }
  });
});

// Fetch Budget Route
app.get('/api/fetch/budget/:userId', (req, res) => {
  const userId = req.params.userId;
  if (!userId) {
    return res.status(400).json({ error: 'Invalid user ID' });
  }

  db.query('SELECT monthly_budget FROM budgets WHERE user_id = ?', [userId], (err, results) => {
    if (err) {
      res.status(500).json({ error: 'Internal server error' });
    } else {
      res.json(results[0]);
    }
  });
});

// Update Expense Route
app.put('/api/update/expense/:id', (req, res) => {
    const expenseId = req.params.id;
    const { userId, expense_name, cost, category, date } = req.body;
  
    if (!expenseId || !userId || !expense_name || cost === undefined || !category || !date) {
      return res.status(400).json({ error: 'Invalid data' });
    }
  
    db.query(
      'UPDATE expenses SET user_id = ?, expense_name = ?, cost = ?, category = ?, date = ? WHERE id = ?',
      [userId, expense_name, cost, category, date, expenseId],
      (err, result) => {
        if (err) {
          console.error('Error updating expense:', err);
          res.status(500).json({ error: 'Failed to update expense' });
        } else if (result.affectedRows === 0) {
          res.status(404).json({ error: 'Expense not found' });
        } else {
          res.status(200).json({ message: 'Expense updated successfully' });
        }
      }
    );
  });

// Delete Expense Route
app.delete('/api/delete/expense/:id', (req, res) => {
  const expenseId = req.params.id;

  if (!expenseId) {
    return res.status(400).json({ error: 'Invalid expense ID' });
  }

  db.query('DELETE FROM expenses WHERE id = ?', [expenseId], (err, result) => {
    if (err) {
      console.error('Error deleting expense:', err);
      res.status(500).json({ error: 'Failed to delete expense' });
    } else if (result.affectedRows === 0) {
      res.status(404).json({ error: 'Expense not found' });
    } else {
      res.status(200).json({ message: 'Expense deleted successfully' });
    }
  });
});

// Start the server
app.listen(8080, () => console.log('Server running on http://localhost:8080'));