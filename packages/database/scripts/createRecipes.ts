import {  prisma, Prisma } from "../src";

import { faker } from "@faker-js/faker";
// Define an interface for the ingredient structure for clarity
interface Ingredient {
  name: string;
  quantity: number;
  unit: string;
}

const recipeCategories = ["Breakfast", "Brunch", "Lunch", "Dinner", "Dessert", "Snack", "Appetizer", "Side Dish", "Soup", "Salad", "Vegan", "Vegetarian", "Gluten-Free", "Quick & Easy", "Italian", "Mexican", "Asian", "Indian", "Mediterranean"];
const ingredientUnits = ["gram", "kg", "ml", "liter", "tsp", "tbsp", "cup", "pcs", "oz", "lb"];

async function main() {
  console.log(`Starting to seed recipes with faker.js...`);

  const recipesToCreateData: Prisma.RecipeCreateInput[] = [];

  for (let i = 1; i <= 50; i++) {
    const numCategories = faker.number.int({ min: 1, max: 3 });
    const selectedCategories = faker.helpers.arrayElements(recipeCategories, numCategories);

    const numIngredients = faker.number.int({ min: 3, max: 8 });
    const recipeIngredients: Ingredient[] = [];
    for (let k = 0; k < numIngredients; k++) {
      recipeIngredients.push({
        name: faker.commerce.productMaterial(),
        quantity: faker.number.int({ min: 1, max: 500 }),
        unit: faker.helpers.arrayElement(ingredientUnits),
      });
    }

    const numInstructions = faker.number.int({ min: 3, max: 7 });
    const recipeInstructions: string[] = [];
    for (let l = 0; l < numInstructions; l++) {
      recipeInstructions.push(`Step ${l + 1}: ${faker.lorem.sentence()}`);
    }

    const recipeData: Prisma.RecipeCreateInput = {
      name: `${faker.commerce.productName()} Recipe`,
      description: faker.lorem.paragraph(2),
      rating: parseFloat(faker.number.float({ min: 2.5, max: 5 }).toFixed(1)),
      categories: { set: Array.from(new Set(selectedCategories)) }, 
      prepTimeMinutes: faker.number.int({ min: 10, max: 90 }),
      cookTimeMinutes: faker.number.int({ min: 15, max: 180 }),
      servings: faker.number.int({ min: 1, max: 10 }),
      ingredients: recipeIngredients as unknown as Prisma.JsonArray,
      instructions: { set: recipeInstructions },
      imageUrl: faker.image.urlLoremFlickr({ category: 'food' }),
      notes: i % 3 === 0 ? faker.lorem.sentence() : null,
    };
    recipesToCreateData.push(recipeData);
    console.log(`Prepared recipe: ${recipeData.name}`);
  }

  console.log("\nStarting database transaction...");
  for (const recipeData of recipesToCreateData) {
    try {
      const createdRecipe = await prisma.recipe.create({
        data: recipeData,
      });
      console.log(`Successfully created recipe: ${createdRecipe.name} (ID: ${createdRecipe.id})`);
    } catch (e: any) {
      console.error(`Error creating recipe ${recipeData.name}:`, e.message);
      if (e.code) {
        console.error(`Prisma error code: ${e.code}`);
      }
    }
  }

  console.log("\nFinished seeding recipes.");
}

main()
  .catch((e) => {
    console.error("Critical error in seeding script:", e);
  })
  .finally(async () => {
    console.log("Disconnecting Prisma client...");
    await prisma.$disconnect();
    console.log("Prisma client disconnected.");
  });

