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
      <div class="bg-white rounded-xl shadow p-4 hover:shadow-lg transition">
        <img src="${recipe.strMealThumb}" class="rounded-lg w-full mb-3" />

        <h2 class="text-xl font-bold mb-2">${recipe.strMeal}</h2>

        <button onclick="getDetails('${recipe.idMeal}')"
          class="w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700 transition">
          View Recipe
        </button>
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
  // Build ingredients (MealDB gives up to 20)
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
      class="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-md flex justify-center items-center p-4 z-50">

      <div class="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-y-auto max-h-[90vh] animate-fadeIn">

        <img src="${recipe.strMealThumb}" class="w-full h-56 object-cover" />

        <div class="p-5">
          <h2 class="text-2xl font-bold mb-3">${recipe.strMeal}</h2>

          <h3 class="font-semibold text-lg mb-1">Ingredients</h3>
          <ul class="mb-4 text-gray-700 list-disc pl-5">${ingredientList}</ul>

          <h3 class="font-semibold text-lg mb-1">Instructions</h3>
          <div class="text-gray-700 leading-relaxed whitespace-pre-line">
            ${recipe.strInstructions}
          </div>

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
  document.getElementById("popupContainer").innerHTML = "";
  document.body.style.overflow = "auto";
}
