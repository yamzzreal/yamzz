import fetch from "node-fetch";
import { Buffer } from "buffer";

export const handler = async (event) => {
  const USERNAME = "yamzzreal";
  const REPO = "yamzz";
  const FILE_PATH = "product.json";
  const TOKEN = process.env.GITHUB_PAT;

  const newProducts = JSON.parse(event.body);

  // 1. Get current SHA
  const fileURL = `https://api.github.com/repos/${USERNAME}/${REPO}/contents/${FILE_PATH}`;

  const getFile = await fetch(fileURL, {
    headers: { Authorization: `Bearer ${TOKEN}` },
  });
  const fileData = await getFile.json();

  const newContentBase64 = Buffer.from(
    JSON.stringify(newProducts, null, 2)
  ).toString("base64");

  // 2. Upload new JSON
  const update = await fetch(fileURL, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message: "Update product data",
      content: newContentBase64,
      sha: fileData.sha,
    }),
  });

  const result = await update.json();

  return {
    statusCode: 200,
    body: JSON.stringify(result),
  };
};
