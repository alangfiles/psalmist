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
    const chapter = psalms.chapters.find((ch) => ch.chapter === psalmNumber.toString());
    if (!chapter) {
      return "Psalm not found";
    }
    return chapter.verses.map((verse) => `${verse.verse}. ${verse.text}`).join("\n");
  } catch (error) {
    console.error('Error fetching Psalms:', error);
    return 'Error loading Psalm';
  }
}

const PsalmistApp = () => {
  const totalPsalms = 150;
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
    <div className="p-4 max-w mx-auto">
      <h1 className="text-xl font-bold">Psalm {psalmNumber}</h1>
      <pre className="border p-2 bg-gray-100 whitespace-pre-wrap">{psalmText}</pre>
      <textarea
        className="w-full p-2 border mt-2 h-40"
        value={userInput}
        onChange={handleChange}
      />
      <p className="mt-2">Completion: {completion.toFixed(2)}%</p>
    </div>
  );
};

export default PsalmistApp;
