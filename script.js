let ingredients = [];

function addIngredient() {
  const input = document.getElementById("ingredientInput");
  const value = input.value.trim();

  if (value === "") return;

  ingredients.push(value);
  input.value = "";

  displayIngredients();
}

function displayIngredients() {
  const list = document.getElementById("ingredientsList");
  list.innerHTML = "";

  ingredients.forEach((item, index) => {
    list.innerHTML += `<li>${index + 1}. ${item}</li>`;
  });
}

// Placeholder
function getRecipes() {
  document.getElementById("recipes").innerHTML =
    "<p>Recipe API will be added later.</p>";
}
