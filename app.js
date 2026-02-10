const API_KEY = "7595d5e5e82f400fb5175bf7e4ebe7ec";

let ingredients = [];

function addIngredient() {
  const input = document.getElementById("ingredientInput");
  const value = input.value.trim();

  if (!value) return;

  ingredients.push(value);
  input.value = "";
  displayIngredients();
}

function displayIngredients() {
  const container = document.getElementById("ingredientList");
  container.innerHTML = "";

  ingredients.forEach((item, index) => {
    container.innerHTML += `
      <div class="flex justify-between items-center p-2 bg-white rounded border">
        <span>${item}</span>
        <button onclick="removeIngredient(${index})" class="text-red-500 text-sm">Remove</button>
      </div>
    `;
  });
}

function removeIngredient(index) {
  ingredients.splice(index, 1);
  displayIngredients();
}

async function searchRecipes() {
  if (ingredients.length === 0) {
    alert("Please add at least one ingredient!");
    return;
  }

  const url = `https://api.spoonacular.com/recipes/findByIngredients?ingredients=${ingredients.join(",")}&number=20&apiKey=${API_KEY}`;

  const response = await fetch(url);
  let data = await response.json();

  // ❗ Filter to show only normal, simple recipes:
  data = data.filter(r =>
    !r.title.toLowerCase().includes("gourmet") &&
    !r.title.toLowerCase().includes("fine dining") &&
    !r.title.toLowerCase().includes("beef wellington") &&
    !r.title.toLowerCase().includes("souffle") &&
    r.missedIngredientCount <= 3  // fewer missing ingredients = easier
  );

  displayResults(data);
}

function displayResults(recipes) {
  const container = document.getElementById("results");
  container.innerHTML = "";

  recipes.forEach((recipe) => {
    container.innerHTML += `
      <div class="bg-white rounded-xl shadow p-4 hover:shadow-lg transition">
        <img src="${recipe.image}" class="rounded-lg w-full mb-3" />

        <h2 class="text-xl font-bold mb-2">${recipe.title}</h2>

        <button onclick="getDetails(${recipe.id})"
          class="w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700 transition">
          View Recipe
        </button>
      </div>
    `;
  });
}

async function getDetails(id) {
  const url = `https://api.spoonacular.com/recipes/${id}/information?apiKey=${API_KEY}`;

  const response = await fetch(url);
  const data = await response.json();

  showDetailPopup(data);
}

function showDetailPopup(recipe) {
  const steps =
    recipe.analyzedInstructions?.[0]?.steps?.length > 0
      ? recipe.analyzedInstructions[0].steps
      : (recipe.instructions || "")
          .replace(/<[^>]+>/g, "")
          .split(". ")
          .map((t, i) => ({ number: i + 1, step: t }))
          .filter(s => s.step.trim() !== "");

  const ingredientList = recipe.extendedIngredients
    .map(i => `<li>• ${i.original}</li>`)
    .join("");

  const stepHtml = steps
    .map(s => `<p><strong>Step ${s.number}:</strong> ${s.step}</p>`)
    .join("");

  const html = `
    <div class="popup-overlay" id="recipeModal">

      <div class="popup-card">
        <button class="close-btn" onclick="closePopup()">✕</button>

        <h2>${recipe.title}</h2>

        <div class="popup-content">
          <img src="${recipe.image}" />

          <h3 class="font-semibold text-lg mb-1">Ingredients</h3>
          <ul class="mb-4">${ingredientList}</ul>

          <h3 class="font-semibold text-lg mb-1">Instructions</h3>
          ${stepHtml}
        </div>

      </div>

    </div>
  `;

  document.getElementById("popupContainer").innerHTML = html;
  document.body.style.overflow = "hidden";
}

function closePopup() {
  document.getElementById("popupContainer").innerHTML = "";
  document.body.style.overflow = "auto";
}
