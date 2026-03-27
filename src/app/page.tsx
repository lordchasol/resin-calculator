"use client";

import { useState, useEffect } from "react";

export default function Home() {
  // ADMIN STATE
  const [showAdmin, setShowAdmin] = useState(false);

  const [pricePerLitre, setPricePerLitre] = useState(80);
  const [hourRate, setHourRate] = useState(30);
  const [integrationPrice, setIntegrationPrice] = useState(1);
  const [customPrice, setCustomPrice] = useState(1);

  // LOAD CONFIG
  useEffect(() => {
    const saved = localStorage.getItem("config");
    if (saved) {
      const config = JSON.parse(saved);
      setPricePerLitre(config.pricePerLitre);
      setHourRate(config.hourRate);
      setIntegrationPrice(config.integrationPrice);
      setCustomPrice(config.customPrice);
    }
  }, []);

  const saveConfig = () => {
    const config = {
      pricePerLitre,
      hourRate,
      integrationPrice,
      customPrice,
    };
    localStorage.setItem("config", JSON.stringify(config));
    setShowAdmin(false);
  };

  // PRICE CALCULATOR
  const [weight, setWeight] = useState(0);
  const [integration, setIntegration] = useState(false);
  const [time, setTime] = useState(0);
  const [custom, setCustom] = useState(false);

  const resinPrice = (weight / 1000) * pricePerLitre;
  const timePrice = (time / 60) * hourRate;

  const total =
    resinPrice +
    timePrice +
    (integration ? integrationPrice : 0) +
    (custom ? customPrice : 0);

  // MIX
  const [quantity, setQuantity] = useState(0);
  const partA = (quantity * 2) / 3;
  const partB = (quantity * 1) / 3;

  return (
    <main className="min-h-screen bg-[#F8F5F2] p-4 max-w-md mx-auto text-[#1F2937] flex flex-col gap-6">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">🧪 Resin</h1>
        <button onClick={() => setShowAdmin(!showAdmin)}>
          ⚙️
        </button>
      </div>

      {/* ADMIN PANEL */}
      {showAdmin && (
        <div className="bg-white p-4 rounded-xl border">
          <h2 className="font-semibold mb-3">Admin</h2>

          <input
            type="number"
            value={pricePerLitre}
            onChange={(e) => setPricePerLitre(Number(e.target.value))}
            className="w-full p-2 border rounded mb-2"
            placeholder="Prix €/L"
          />

          <input
            type="number"
            value={hourRate}
            onChange={(e) => setHourRate(Number(e.target.value))}
            className="w-full p-2 border rounded mb-2"
            placeholder="€/heure"
          />

          <input
            type="number"
            value={integrationPrice}
            onChange={(e) => setIntegrationPrice(Number(e.target.value))}
            className="w-full p-2 border rounded mb-2"
            placeholder="Prix intégration"
          />

          <input
            type="number"
            value={customPrice}
            onChange={(e) => setCustomPrice(Number(e.target.value))}
            className="w-full p-2 border rounded mb-3"
            placeholder="Prix personnalisation"
          />

          <button
            onClick={saveConfig}
            className="bg-black text-white w-full p-2 rounded"
          >
            Sauvegarder
          </button>
        </div>
      )}

      {/* PRICE */}
      <div className="bg-white p-5 rounded-2xl border">
        <h2 className="mb-3 font-semibold">💰 Prix</h2>

        <input
          type="number"
          placeholder="Poids (g)"
          className="w-full p-3 border rounded mb-2"
          onChange={(e) => setWeight(Number(e.target.value))}
        />

        <input
          type="number"
          placeholder="Temps (min)"
          className="w-full p-3 border rounded mb-2"
          onChange={(e) => setTime(Number(e.target.value))}
        />

        <label className="flex justify-between">
          Intégration
          <input
            type="checkbox"
            onChange={() => setIntegration(!integration)}
          />
        </label>

        <label className="flex justify-between mb-3">
          Personnalisation
          <input
            type="checkbox"
            onChange={() => setCustom(!custom)}
          />
        </label>

        <div className="bg-[#C08457] text-white p-3 rounded text-center text-xl font-bold">
          {total.toFixed(2)} €
        </div>
      </div>

      {/* MIX */}
      <div className="bg-white p-5 rounded-2xl border">
        <h2 className="mb-3 font-semibold">🧪 Mélange</h2>

        <input
          type="number"
          placeholder="Quantité (g)"
          className="w-full p-3 border rounded mb-3"
          onChange={(e) => setQuantity(Number(e.target.value))}
        />

        <div className="flex justify-between">
          <p>A : {partA.toFixed(2)} g</p>
          <p>B : {partB.toFixed(2)} g</p>
        </div>
      </div>
    </main>
  );
}
