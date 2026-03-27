"use client";

import { useState, useEffect } from "react";

export default function Home() {
  // ADMIN
  const [showAdmin, setShowAdmin] = useState(false);

  const [pricePerLitre, setPricePerLitre] = useState(80);
  const [hourRate, setHourRate] = useState(30);
  const [integrationPrice, setIntegrationPrice] = useState(1);
  const [customPrice, setCustomPrice] = useState(1);

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

  // PRICE
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
    <main className="min-h-screen bg-[#F8F5F2] p-4 flex flex-col gap-6 max-w-md mx-auto text-[#1F2937]">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">🧪 Resin Calculator</h1>
        <button
          onClick={() => setShowAdmin(!showAdmin)}
          className="text-xl"
        >
          ⚙️
        </button>
      </div>

      {/* ADMIN PANEL */}
      {showAdmin && (
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200">
          <h2 className="font-semibold mb-4 text-lg">⚙️ Paramètres</h2>

          <input
            type="number"
            value={pricePerLitre}
            onChange={(e) => setPricePerLitre(Number(e.target.value))}
            className="w-full p-3 border border-gray-300 rounded-xl mb-3"
            placeholder="Prix €/L"
          />

          <input
            type="number"
            value={hourRate}
            onChange={(e) => setHourRate(Number(e.target.value))}
            className="w-full p-3 border border-gray-300 rounded-xl mb-3"
            placeholder="€/heure"
          />

          <input
            type="number"
            value={integrationPrice}
            onChange={(e) => setIntegrationPrice(Number(e.target.value))}
            className="w-full p-3 border border-gray-300 rounded-xl mb-3"
            placeholder="Prix intégration"
          />

          <input
            type="number"
            value={customPrice}
            onChange={(e) => setCustomPrice(Number(e.target.value))}
            className="w-full p-3 border border-gray-300 rounded-xl mb-4"
            placeholder="Prix personnalisation"
          />

          <button
            onClick={saveConfig}
            className="bg-[#3F3F46] text-white p-3 rounded-xl w-full active:scale-95 transition"
          >
            Sauvegarder
          </button>
        </div>
      )}

      {/* PRICE */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200">
        <h2 className="font-semibold mb-4 text-lg">💰 Calcul prix</h2>

        <input
          type="number"
          placeholder="Poids (g)"
          className="w-full p-3 border border-gray-300 rounded-xl mb-3"
          onChange={(e) => setWeight(Number(e.target.value))}
        />

        <input
          type="number"
          placeholder="Temps (minutes)"
          className="w-full p-3 border border-gray-300 rounded-xl mb-3"
          onChange={(e) => setTime(Number(e.target.value))}
        />

        <div className="flex justify-between items-center mb-2">
          <span>Intégration</span>
          <input
            type="checkbox"
            onChange={() => setIntegration(!integration)}
          />
        </div>

        <div className="flex justify-between items-center mb-4">
          <span>Personnalisation</span>
          <input
            type="checkbox"
            onChange={() => setCustom(!custom)}
          />
        </div>

        <div className="bg-[#C08457] text-white p-4 rounded-xl text-center text-xl font-bold">
          {total.toFixed(2)} €
        </div>
      </div>

      {/* MIX */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200">
        <h2 className="font-semibold mb-4 text-lg">🧪 Calcul mélange</h2>

        <input
          type="number"
          placeholder="Quantité totale (g)"
          className="w-full p-3 border border-gray-300 rounded-xl mb-4"
          onChange={(e) => setQuantity(Number(e.target.value))}
        />

        <div className="flex gap-3">
          <div className="flex-1 bg-[#F1ECE7] p-3 rounded-xl text-center">
            <p className="text-sm text-gray-600">Résine A</p>
            <p className="text-lg font-bold">{partA.toFixed(2)} g</p>
          </div>

          <div className="flex-1 bg-[#F1ECE7] p-3 rounded-xl text-center">
            <p className="text-sm text-gray-600">Résine B</p>
            <p className="text-lg font-bold">{partB.toFixed(2)} g</p>
          </div>
        </div>
      </div>
    </main>
  );
}
