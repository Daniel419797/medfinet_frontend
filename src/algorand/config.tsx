// src/algorand/config.js

export const algodConfig = {
  server: "http://localhost",  // If using LocalNet
  port: 4001,
  token: "a".repeat(64),  // Default token for sandbox/localnet
};

export const contractConfig = {
  appId: 1004, // Replace with your actual deployed App ID
};
