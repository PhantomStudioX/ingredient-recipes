let ingredients = [];

function addIngredient() {
  const input = document.getElementById("ingredientInput");
  const value = input.value.trim();

  if (!value) return;

  // split by comma
  const newItems = value.split(",").map(i => i.trim()).filter(i => i !== "");

  ingredients.push(...newItems);
  input.value = "";
  displayIngredients();
}

function displayIngredients() {
  const container = document.getElementById("ingredientList");
  container.innerHTML = "";

  ingredients.forEach((item, index) => {
    container.innerHTML += `
      <div class="bg-[#222] text-white px-3 py-2 rounded-full flex items-center gap-2 text-sm border border-[#333]">
        <span>${item}</span>
        <button onclick="removeIngredient(${index})" class="text-red-400">✕</button>
      </div>
    `;
  });
}

function removeIngredient(index) {
  ingredients.splice(index, 1);
  displayIngredients();
}

// ⭐ Get recipes that match ANY ingredient, not all
async function searchRecipes() {
  if (ingredients.length === 0) {
    alert("Please enter ingredients!");
    return;
  }

  let allResults = [];

  // fetch recipes for each ingredient separately
  for (let ing of ingredients) {
    const url = `https://www.themealdb.com/api/json/v1/1/filter.php?i=${ing}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.meals) {
      allResults.push(...data.meals);
    }
  }

  // remove duplicates
  const unique = [];
  const ids = new Set();

  allResults.forEach(meal => {
    if (!ids.has(meal.idMeal)) {
      ids.add(meal.idMeal);
      unique.push(meal);
    }
  });

  displayResults(unique);
}

function displayResults(recipes) {
  const container = document.getElementById("results");
  container.innerHTML = "";

  if (recipes.length === 0) {
    container.innerHTML = "<p>No recipes found.</p>";
    return;
  }

  recipes.forEach((recipe) => {
    container.innerHTML += `
      <div class="recipe-card rounded-2xl overflow-hidden shadow-lg bg-[#1a1a1a] border border-[#333] hover:scale-[1.02] transition">
        <img src="${recipe.image}" class="w-full h-40 object-cover" />
    
        <div class="p-4">
          <h2 class="font-bold text-lg mb-2 text-white">${recipe.title}</h2>
    
          <button onclick="getDetails(${recipe.id})"
            class="w-full bg-purple-600 py-2 rounded-lg hover:bg-purple-700 transition">
            View Recipe
          </button>
        </div>
      </div>
    `;
  });
}

async function getDetails(id) {
  const url = `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`;
  const response = await fetch(url);
  const data = await response.json();
  showDetailPopup(data.meals[0]);
}

function showDetailPopup(recipe) {
  // Build ingredients
  let ingredientList = "";
  for (let i = 1; i <= 20; i++) {
    const ingredient = recipe[`strIngredient${i}`];
    const measure = recipe[`strMeasure${i}`];

    if (ingredient && ingredient.trim() !== "") {
      ingredientList += `<li class="mb-1">• ${ingredient} - ${measure}</li>`;
    }
  }

  const html = `
    <div id="recipeModal"
      class="popup-overlay">

      <div class="popup-card popup-fade">

        <button onclick="closePopup()" class="close-btn">✕</button>

        <img src="${recipe.strMealThumb}" class="w-full h-56 object-cover" />

        <div class="popup-content">
          <h2>${recipe.strMeal}</h2>

          <h3 class="font-semibold text-lg mb-1">Ingredients</h3>
          <ul class="mb-4">${ingredientList}</ul>

          <h3 class="font-semibold text-lg mb-1">Instructions</h3>
          <div class="leading-relaxed whitespace-pre-line">
            ${recipe.strInstructions}
          </div>
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
