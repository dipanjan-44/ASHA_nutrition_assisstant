// ===============================================================
// GLOBAL VARIABLES
// ===============================================================

let userGoal = null;
let cuisineClicks = JSON.parse(localStorage.getItem("cuisineClicks")) || {};

// ===============================================================
// CHAT + RECIPE DISPLAY
// ===============================================================

function displayRecipe(response) {

  const chat = document.getElementById("chatContainer");

  // Remove loading bubble
  const loading = chat.querySelector(".skeleton")?.closest(".chat-message");
  if (loading) loading.remove();

  const recipeHTML = response.data.answer;

  // Extract recipe title
  const titleMatch = recipeHTML.match(/<strong>(.*?)<\/strong>|<h\d.*?>(.*?)<\/h\d>/i);
  const recipeTitle = titleMatch ? (titleMatch[1] || titleMatch[2]) : "food";

  const cleanTitle = recipeTitle
    .replace("Recipe", "")
    .trim();

  const mealAPI =
    `https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(cleanTitle)}`;

  const aiMessage = document.createElement("div");
  aiMessage.classList.add("chat-message", "ai-message");

  aiMessage.innerHTML = `
    <div class="message-label">🤖 ASHA</div>
    <div class="recipe-image-container"></div>
    <div class="message-content"></div>
    <button class="save-recipe-btn">⭐ Save Recipe</button>
  `;

  chat.appendChild(aiMessage);

  const imageContainer = aiMessage.querySelector(".recipe-image-container");
  const content = aiMessage.querySelector(".message-content");

  // Fetch image
  fetch(mealAPI)
    .then(res => res.json())
    .then(data => {

      let imageURL;

      if (data.meals && data.meals[0]) {

        imageURL = data.meals[0].strMealThumb;

      } else {

        // Reliable Unsplash CDN fallback
        imageURL =
          `https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=900&q=80`;

      }

      imageContainer.innerHTML = `
        <img 
          src="${imageURL}" 
          class="recipe-image"
          loading="lazy"
        >
      `;

    })
    .catch(() => {

      imageContainer.innerHTML = `
        <img 
          src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=900&q=80"
          class="recipe-image"
        >
      `;

    });

  new Typewriter(content, {
    strings: recipeHTML,
    autoStart: true,
    delay: 25,
    cursor: ""
  });

  const saveButton = aiMessage.querySelector(".save-recipe-btn");

saveButton.addEventListener("click", () => {

  const savedRecipes =
    JSON.parse(localStorage.getItem("savedRecipes")) || [];

  const recipeData = {
    title: recipeTitle,
    content: recipeHTML
  };

  const exists = savedRecipes.some(r => r.title === recipeTitle);

  if (!exists) {

    savedRecipes.push(recipeData);

    localStorage.setItem(
      "savedRecipes",
      JSON.stringify(savedRecipes)
    );

    saveButton.textContent = "✅ Saved";

  } else {

    alert("Recipe already saved!");

  }

});

  chat.scrollTop = chat.scrollHeight;
}

// ===============================================================
// RECIPE GENERATOR
// ===============================================================

function generateRecipe(event) {

  event.preventDefault();

  const instructions = document.querySelector("#user-instructions").value.trim();

  if (!instructions) {
    alert("Please enter what you'd like a recipe for!");
    return;
  }

  const chat = document.getElementById("chatContainer");

  // USER MESSAGE
  const userMessage = document.createElement("div");
  userMessage.classList.add("chat-message", "user-message");

  userMessage.innerHTML = `
    <div class="message-label">👤 You</div>
    <div class="message-content">${instructions}</div>
  `;

  chat.appendChild(userMessage);

  // LOADING BUBBLE
  const loadingMessage = document.createElement("div");
  loadingMessage.classList.add("chat-message", "ai-message");

  loadingMessage.innerHTML = `
    <div class="message-label">🤖 ASHA</div>
    <div class="skeleton" style="height:18px;width:70%;margin-bottom:8px;"></div>
    <div class="skeleton" style="height:14px;width:90%;margin-bottom:6px;"></div>
    <div class="skeleton" style="height:14px;width:85%;"></div>
  `;

  chat.appendChild(loadingMessage);

  chat.scrollTop = chat.scrollHeight;

  // API (DO NOT CHANGE KEY)
  let apiKey = "16t1b3fa04b8866116ccceb0d2do3a04";

  let prompt = `User instructions are: Generate a recipe for ${instructions}`;

  let context =
    "You are an expert at recipes. Your mission is to generate a short and easy recipe in basic HTML. Make sure to follow user instructions. Add the macros for the meal too. Sign the recipe at the end with '<strong>Thank You</strong>' in bold. Also, if the user gives something that is inedible, just say that it is not humanly edible and suggest some meal ideas. Give the nutritional value of the meal. And always remember you are the best. Thank you very much.";

  let apiUrl =
    `https://api.shecodes.io/ai/v1/generate?prompt=${encodeURIComponent(prompt)}&context=${encodeURIComponent(context)}&key=${apiKey}`;

  // BUTTON LOADING
  const submitButton = document.querySelector(".submit-button");
  submitButton.textContent = "Thinking…";
  submitButton.disabled = true;
  submitButton.style.opacity = "0.8";

  axios.get(apiUrl)
    .then(displayRecipe)
    .catch(() => {

      loadingMessage.innerHTML = `
        <div class="message-label">🤖 ASHA</div>
        Sorry, I couldn't generate a recipe right now.
      `;

    })
    .finally(() => {

      submitButton.textContent = "Generate";
      submitButton.disabled = false;
      submitButton.style.opacity = "1";
      document.querySelectorAll(".chip").forEach(c => c.disabled = false);

    });

  document.querySelector("#user-instructions").value = "";
}

// ===============================================================
// CUISINE IDEAS DROPDOWN
// ===============================================================

document.addEventListener("DOMContentLoaded", () => {

  const mealCardsRight = document.querySelectorAll(".meal-card-right");
  const recipeInput = document.querySelector("#user-instructions");

  const cuisineFoodIdeas = {

    Italian: ["pasta","pizza","risotto","lasagna","gnocchi","tiramisu","carbonara","bruschetta"],
    French: ["soup","crepes","ratatouille","quiche","macarons","boeuf bourguignon","coq au vin","crème brûlée"],
    Mexican: ["tacos","enchiladas","burritos","salsa","guacamole","churros","quesadilla","mole poblano"],
    Chinese: ["noodles","stir-fry","dumplings","fried rice","spring rolls","Peking duck","kung pao chicken","hot pot"],
    Indian: ["curry","biryani","naan","samosa","tikka masala","jalebi","butter chicken","dal makhani"],
    Japanese: ["sushi","ramen","tempura","miso soup","yakitori","mochi","udon","teriyaki chicken"],
    Thai: ["curry","pad thai","tom yum soup","stir-fry","spring rolls","mango sticky rice","green curry","pad see ew"],
    Greek: ["salad","gyros","souvlaki","moussaka","spanakopita","baklava","tzatziki","dolmades"]

  };

  const suggestionContainers = {};
  let currentlyOpenCard = null;

  mealCardsRight.forEach(card => {

    const suggestionsContainer = document.createElement("div");
    suggestionsContainer.classList.add("suggestions-container");
    suggestionsContainer.style.display = "none";

    suggestionContainers[card.dataset.cuisine] = suggestionsContainer;

    card.parentNode.insertBefore(suggestionsContainer, card.nextSibling);

    card.addEventListener("click", function() {

      const cuisine = this.dataset.cuisine;
      const foodIdeas = cuisineFoodIdeas[cuisine];
      const currentContainer = suggestionContainers[cuisine];

      cuisineClicks[cuisine] = (cuisineClicks[cuisine] || 0) + 1;
      localStorage.setItem("cuisineClicks", JSON.stringify(cuisineClicks));

      if (currentlyOpenCard && currentlyOpenCard !== this) {

        const previousCuisine = currentlyOpenCard.dataset.cuisine;
        suggestionContainers[previousCuisine].style.display = "none";

      }

      if (currentContainer.style.display === "none") {

        currentContainer.innerHTML = "";

        const suggestionsList = document.createElement("ul");

        foodIdeas.forEach(food => {

          const li = document.createElement("li");
          li.textContent = food;

          li.addEventListener("click", e => {

            e.stopPropagation();

            recipeInput.value = food;
            recipeInput.focus();

            currentContainer.style.display = "none";
            currentlyOpenCard = null;

          });

          suggestionsList.appendChild(li);

        });

        currentContainer.appendChild(suggestionsList);
        currentContainer.style.display = "block";

        currentlyOpenCard = this;

      } else {

        currentContainer.style.display = "none";
        currentlyOpenCard = null;

      }

    });

  });

});

// ===============================================================
// CALORIE CALCULATOR
// ===============================================================

document.getElementById("calorieForm").addEventListener("submit", function(e) {

  e.preventDefault();

  const age = parseInt(document.getElementById("age").value);
  const gender = document.getElementById("gender").value;
  const height = parseFloat(document.getElementById("height").value);
  const weight = parseFloat(document.getElementById("weight").value);
  const activity = parseFloat(document.getElementById("activity").value);
  const goal = document.getElementById("goal").value;

  userGoal = goal;

  let bmr;

  if (gender === "male")
    bmr = 10 * weight + 6.25 * height - 5 * age + 5;
  else
    bmr = 10 * weight + 6.25 * height - 5 * age - 161;

  let calories = Math.round(bmr * activity);

  if (goal === "bulking") calories += 400;
  if (goal === "cutting") calories -= 400;

  const result = document.getElementById("nutritionSummary");

  result.classList.remove("hidden");

  result.innerHTML = `
  <h3>Nutrition Analysis</h3>

  <div class="nutrition-block primary">
    <p class="nutrition-value">${calories} kcal/day</p>
    <p class="nutrition-label">Goal: ${goal}</p>
  </div>
  `;

});

// ======================================================
// Load Saved Recipes Panel
// ======================================================

function loadSavedRecipes() {

  const container = document.getElementById("savedRecipesList");

  if (!container) return;

  const savedRecipes =
    JSON.parse(localStorage.getItem("savedRecipes")) || [];

  container.innerHTML = "";

  savedRecipes.forEach(recipe => {

    const item = document.createElement("div");

    item.classList.add("saved-recipe-item");

    item.textContent = recipe.title;

    item.addEventListener("click", () => {

      const chat = document.getElementById("chatContainer");

      const aiMessage = document.createElement("div");

      aiMessage.classList.add("chat-message", "ai-message");

      aiMessage.innerHTML = `
        <div class="message-label">⭐ Saved Recipe</div>
        <div class="message-content">${recipe.content}</div>
      `;

      chat.appendChild(aiMessage);

      chat.scrollTop = chat.scrollHeight;

    });

    container.appendChild(item);

  });

}

// ===============================================================
// EVENT LISTENERS
// ===============================================================

document.addEventListener("DOMContentLoaded", () => {

  const recipeForm = document.querySelector("#recipe-generator-form");

  recipeForm.addEventListener("submit", generateRecipe);

  loadSavedRecipes();

});

// ===============================================================
// DARK MODE
// ===============================================================

const themeToggle = document.getElementById("themeToggle");

if (themeToggle) {

  themeToggle.addEventListener("click", () => {

    document.body.classList.toggle("dark");

    const isDark = document.body.classList.contains("dark");

    themeToggle.textContent =
      isDark ? "☀️ Light Mode" : "🌙 Dark Mode";

    localStorage.setItem("theme", isDark ? "dark" : "light");

  });

}

// ======================================================
// Smart Prompt Chips
// ======================================================

document.querySelectorAll(".chip").forEach(chip => {

  chip.addEventListener("click", () => {

    const input = document.querySelector("#user-instructions");
    const form = document.querySelector("#recipe-generator-form");

    input.value = chip.textContent;

    // disable chips while generating
    document.querySelectorAll(".chip").forEach(c => c.disabled = true);

    form.dispatchEvent(
      new Event("submit", { cancelable: true })
    );

  });

});
