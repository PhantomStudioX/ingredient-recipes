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
    .map(i => `<li class="mb-1">• ${i.original}</li>`)
    .join("");

  const stepHtml = steps
    .map(s => `<p><strong>Step ${s.number}:</strong> ${s.step}</p>`)
    .join("");

  const html = `
    <div id="recipeModal"
      class="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-md flex justify-center items-center p-4 z-50">

      <div class="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-y-auto max-h-[90vh] animate-fadeIn">
        <img src="${recipe.image}" class="w-full h-56 object-cover" />

        <div class="p-5">
          <h2 class="text-2xl font-bold mb-3">${recipe.title}</h2>

          <h3 class="font-semibold text-lg mb-1">Ingredients</h3>
          <ul class="mb-4 text-gray-700 list-disc pl-5">${ingredientList}</ul>

          <h3 class="font-semibold text-lg mb-1">Instructions</h3>
          <div class="text-gray-700 leading-relaxed">${stepHtml}</div>

          <button onclick="closePopup()"
            class="mt-6 w-full bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition">
            Close
          </button>
        </div>
      </div>
    </div>
  `;

  document.getElementById("popupContainer").innerHTML = html;
  document.body.style.overflow = "hidden";
}

function closePopup() {
  const container = document.getElementById("popupContainer");
  container.innerHTML = "";        // remove the popup HTML
  document.body.style.overflow = "auto"; // allow scrolling again
}

