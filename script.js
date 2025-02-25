// Import Firebase modules

import { doc, addDoc, collection, getDocs, deleteDoc } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-firestore.js";

const db = window.db; // Get Firestore instance from global variable
const unusedVariable = "This is not used anywhere";


// Select elements
const registerButton = document.getElementById('registerButton');
const authButton = document.getElementById('authButton');
const status = document.getElementById('status');
const budgetItemInput = document.getElementById('budgetItem');
const budgetAmountInput = document.getElementById('budgetAmount');
const addBudgetButton = document.getElementById('addBudget');
const budgetList = document.getElementById('budgetList');

// === Biometric Authentication (WebAuthn) ===
registerButton.addEventListener('click', async () => {
  try {
    const publicKeyCredentialCreationOptions = {
      publicKey: {
        challenge: Uint8Array.from('randomChallenge', c => c.charCodeAt(0)), 
        rp: { name: "My WebAuthn App", id: window.location.hostname },
        user: {
          id: Uint8Array.from('user123', c => c.charCodeAt(0)),
          name: "user@example.com",
          displayName: "User",
        },
        pubKeyCredParams: [{ type: "public-key", alg: -7 }],
        authenticatorSelection: { authenticatorAttachment: "platform", userVerification: "required" },
        timeout: 60000,
        attestation: "none",
      }
    };

    const credential = await navigator.credentials.create(publicKeyCredentialCreationOptions);
    console.log('Registered credential:', credential);
    status.textContent = "Passkey created successfully!";
  } catch (error) {
    console.error('Registration error:', error);
    status.textContent = "Error during passkey creation.";
  }
});

authButton.addEventListener('click', async () => {
  try {
    const publicKeyCredentialRequestOptions = {
      publicKey: {
        challenge: Uint8Array.from('randomChallenge', c => c.charCodeAt(0)), 
        rpId: window.location.hostname,
        allowCredentials: [],
        userVerification: "required",
      }
    };

    const credential = await navigator.credentials.get(publicKeyCredentialRequestOptions);
    if (credential) {
      status.textContent = "Authentication successful!";
      console.log('Authenticated credential:', credential);
    } else {
      status.textContent = "Authentication failed.";
    }
  } catch (error) {
    console.error('Authentication error:', error);
    status.textContent = "Error during authentication.";
  }
});

// === Firebase CRUD Operations for Budget ===

// Add new budget item
addBudgetButton.addEventListener('click', async () => {
  const item = budgetItemInput.value.trim();
  const amount = parseFloat(budgetAmountInput.value.trim());

  if (item && !isNaN(amount)) {
    try {
      await addDoc(collection(db, "budget"), { item, amount });
      budgetItemInput.value = "";
      budgetAmountInput.value = "";
      loadBudgetItems();
    } catch (error) {
      console.error("Error adding document:", error);
    }
  }
});

// Load budget items from Firebase
async function loadBudgetItems() {
  budgetList.innerHTML = "";
  let totalBalance = 0;
  
  const querySnapshot = await getDocs(collection(db, "budget"));
  querySnapshot.forEach((docSnapshot) => {
    const { item, amount } = docSnapshot.data();
    totalBalance += amount; // Add income, subtract expenses (assuming negative values for expenses)

    const li = document.createElement("li");
    li.textContent = `${item}: $${amount}`;

    // Delete button
    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Delete";
    deleteButton.addEventListener('click', async () => {
      await deleteDoc(doc(db, "budget", docSnapshot.id));
      loadBudgetItems();
    });

    li.appendChild(deleteButton);
    budgetList.appendChild(li);
  });

  // Update total balance display
  document.getElementById("totalBalance").textContent = totalBalance.toFixed(2);
}


// Initial load
loadBudgetItems();
