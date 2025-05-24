const SteamUser = require('steam-user');
const express = require('express');
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
    res.send('Code received!