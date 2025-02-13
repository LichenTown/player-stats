import fs from "fs";
import path from "path";
import fetch from "node-fetch";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const statsDir = path.join(__dirname, "stats");
const usernameMapPath = path.join(__dirname, "username_map.json");
let usernameMap = {};

// Load existing username map if it exists
if (fs.existsSync(usernameMapPath)) {
  usernameMap = JSON.parse(fs.readFileSync(usernameMapPath, "utf8"));
}

// Function to get username from Mojang API
async function getUsername(uuid) {
  try {
    const response = await fetch(
      `https://corsjangsessionserver.b-cdn.net/session/minecraft/profile/${uuid}`
    );
    const data = await response.json();
    return data.name;
  } catch (e) {
    return "??";
  }
}

// Process each JSON file in the stats directory
fs.readdir(statsDir, async (err, files) => {
  if (err) {
    console.error("Failed to read stats directory:", err);
    return;
  }

  for (const file of files) {
    if (path.extname(file) === ".json") {
      const uuid = file.slice(0, -5);
      if (!usernameMap[uuid]) {
        try {
          const username = await getUsername(uuid);
          usernameMap[uuid] = username;
          console.log(`Mapped UUID ${uuid} to username ${username}`);
        } catch (error) {
          console.error(error.message);
        }
      }
    }
  }

  // Save the updated username map
  fs.writeFileSync(
    usernameMapPath,
    JSON.stringify(usernameMap, null, 2),
    "utf8"
  );
  console.log("Username map updated successfully.");
});
