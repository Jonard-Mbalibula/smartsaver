import app from './api/index.js';
import 'dotenv/config'; // Make sure you have dotenv or equivalent installed for local env vars

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`SmartSaver API Server running on port ${PORT}`);
    console.log(`Access health check at: http://localhost:${PORT}/api/health`);
});
```
*Note: I assumed your routes were originally in `api/index.js`, but your `npm run dev` command points to `api/index.js`. If you move your code to `api/index.js`, this file should import it from there.*

---

### Step 2: Update your `package.json`

Now, you need to update your `npm run dev` script to use this new startup file instead of the old one, so Nodemon monitors `server.js`.

**In your `package.json`:**

```json
"scripts": {
  "dev": "nodemon server.js",
  "start": "node server.js"
}