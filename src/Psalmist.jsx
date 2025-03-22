import React, { useState, useEffect } from "react";

const getDayOfYear = () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now - start + (start.getTimezoneOffset() - now.getTimezoneOffset()) * 60 * 1000;
  return Math.floor(diff / (1000 * 60 * 60 * 24));
};

async function fetchPsalm(psalmNumber) {
  try {
    const response = await fetch('/psalms/psalms.json'); // Corrected path
    const psalms = await response.json();
    return psalms[psalmNumber]?.text || 'Psalm not found';
  } catch (error) {
    console.error('Error fetching Psalms:', error);
    return 'Error loading Psalm';
  }
}

const PsalmistApp = () => {
  const totalPsalms = 10;//150;
  const dayOfYear = getDayOfYear();
  const psalmNumber = (dayOfYear % totalPsalms) + 1;
  const localStorageKey = `psalm-${psalmNumber}`;
  
  const [psalmText, setPsalmText] = useState("");
  const [userInput, setUserInput] = useState(localStorage.getItem(localStorageKey) || "");
  const [completion, setCompletion] = useState(0);

  useEffect(() => {
    fetchPsalm(psalmNumber).then(setPsalmText);
  }, [psalmNumber]);

  useEffect(() => {
    localStorage.setItem(localStorageKey, userInput);
    setCompletion((userInput.length / psalmText.length) * 100);
  }, [userInput, psalmText, localStorageKey]);

  const handleChange = (e) => {
    setUserInput(e.target.value);
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-xl font-bold">Psalm {psalmNumber}</h1>
      <pre className="border p-2 bg-gray-100 whitespace-pre-wrap">{psalmText}</pre>
      <textarea
        className="w-full p-2 border mt-2"
        value={userInput}
        onChange={handleChange}
      />
      <p className="mt-2">Completion: {completion.toFixed(2)}%</p>
    </div>
  );
};

export default PsalmistApp;
