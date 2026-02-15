"use client";

import { useState } from "react";
import { getRouterContract } from "../lib/router";

export default function Home() {
  const [wallet, setWallet] = useState(null);
  const [routerStatus, setRouterStatus] = useState("");

  // 🔹 Connect MetaMask
  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("MetaMask is not installed!");
      return;
    }

    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      setWallet(accounts[0]);
      console.log("Connected Account:", accounts[0]);
    } catch (error) {
      console.error("Connection failed:", error);
    }
  };

  // 🔹 Test Router Smart Contract Connection
  const testRouterConnection = async () => {
    try {
      const router = await getRouterContract();

      if (!router) {
        setRouterStatus("Router connection failed");
        return;
      }

      console.log("Router Contract:", router);
      setRouterStatus("Router connected successfully ✅");
    } catch (error) {
      console.error("Router error:", error);
      setRouterStatus("Router connection error ❌");
    }
  };

  return (
    <div style={{ padding: "50px", fontFamily: "Arial" }}>
      <h1>My DEX</h1>

      {/* Connect Wallet */}
      {!wallet ? (
        <button
          onClick={connectWallet}
          style={{
            padding: "10px 20px",
            backgroundColor: "black",
            color: "white",
            borderRadius: "8px",
            cursor: "pointer",
            marginBottom: "20px",
          }}
        >
          Connect Wallet
        </button>
      ) : (
        <p style={{ marginBottom: "20px" }}>
          Connected Wallet: <strong>{wallet}</strong>
        </p>
      )}

      {/* Test Router */}
      {wallet && (
        <button
          onClick={testRouterConnection}
          style={{
            padding: "10px 20px",
            backgroundColor: "#1e90ff",
            color: "white",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          Test Router Connection
        </button>
      )}

      {/* Status */}
      {routerStatus && (
        <p style={{ marginTop: "20px" }}>
          Status: {routerStatus}
        </p>
      )}
    </div>
  );
}
