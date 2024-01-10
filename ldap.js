const express = require('express');
const ldapAuth = require('ldap-authentication');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

// Middleware to parse JSON request body
app.use(bodyParser.json());

// LDAP configuration
const ldapConfig = {
  ldapOpts: {
    url: 'ldap://your-ldap-server.com:389',
    maxConnections: 10,
    bindDN: 'cn=admin,dc=example,dc=com', // Replace with your LDAP admin DN
    bindCredentials: 'adminPassword', // Replace with your LDAP admin password
    checkInterval: 60000,
    reconnect: true
  },
  ldapSearchBase: 'ou=users,dc=example,dc=com', // Replace with your LDAP search base DN
  ldapSearchFilter: '(uid={{username}})' // LDAP filter to search for users
};

// LDAP authentication middleware
app.use(ldapAuth(ldapConfig));

// Route for protected resource
app.get('/protected', (req, res) => {
  res.json({ message: 'You have access to the protected resource.' });
});

// Error handler for failed LDAP authentication
app.use((err, req, res, next) => {
  if (err.name === 'UnauthorizedError') {
    res.status(401).json({ error: 'Unauthorized: Invalid credentials' });
  } else {
    next(err);
  }
});

// Start the Express server
app.listen(port, () => {
  console.log(`Express server listening at http://localhost:${port}`);
});
