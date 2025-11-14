import fetch from "node-fetch";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // 1. Get IAM token
    const tokenResponse = await fetch("https://iam.cloud.ibm.com/identity/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Accept": "application/json"
      },
      body: new URLSearchParams({
        grant_type: "urn:ibm:params:oauth:grant-type:apikey",
        apikey: process.env.IBM_API_KEY
      })
    });

    const tokenData = await tokenResponse.json();
    const IAM_TOKEN = tokenData.access_token;

    // 2. Call Watson model
    const watsonResponse = await fetch(
      "https://us-south.ml.cloud.ibm.com/ml/v4/deployments/d1a0e271-0546-481c-8138-094878deea41/ai_service_stream?version=2021-05-01",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${IAM_TOKEN}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(req.body)
      }
    );

    const watsonData = await watsonResponse.json();
    return res.status(200).json(watsonData);

  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
