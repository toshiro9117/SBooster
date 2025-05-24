const SteamUser = require('steam-user');
const express = require('express');
const accounts = require('./config/accounts'); // adjust path if needed

const app = express();
app.use(express.urlencoded({ extended: true }));

let pendingSteamGuardRequest = null;

app.get('/', (req, res) => {
  if (pendingSteamGuardRequest) {
    res.send(`
      <form method="POST" action="/submit-code">
        <label>Enter Steam Guard code:</label><br/>
        <input name="steamGuardCode" required autofocus />
        <button type="submit">Submit</button>
      </form>
    `);
  } else {
    res.send('Bot is not requesting Steam Guard code now.');
  }
});

app.post('/submit-code', (req, res) => {
  const code = req.body.steamGuardCode;
  if (pendingSteamGuardRequest) {
    pendingSteamGuardRequest.resolve(code);
    pendingSteamGuardRequest = null;
    res.send('Code received! Bot will continue login.');
  } else {
    res.send('No Steam Guard code is needed right now.');
  }
});

async function getSteamGuardCode() {
  return new Promise((resolve) => {
    pendingSteamGuardRequest = { resolve };
  });
}

const steamClient = new SteamUser();

steamClient.on('steamGuard', async (domain, callback) => {
  console.log(`Steam Guard code required (${domain})`);
  const code = await getSteamGuardCode();
  callback(code);
});

// Using first account from config/accounts.js - adjust if you have multiple accounts
const account = accounts[0]; 

steamClient.logOn({
  accountName: account.username,
  password: account.password
});

steamClient.on('loggedOn', () => {
  console.log('Logged into Steam successfully!');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Web server listening on port ${PORT}`));
