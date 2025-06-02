import type { ActionFunctionArgs, MetaFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useActionData, Link } from "@remix-run/react";
import { prisma } from "@packages/database";
import { useState } from 'react';

export const meta: MetaFunction = () => {
  return [
    { title: "Create New Recipe | Scrape Wise" },
    { name: "description", content: "Add a new delicious recipe to the collection." },
  ];
};

interface ActionData {
  errors?: {
    name?: string;
    rating?: string;
    form?: string;
  };
}

interface Ingredient {
  item: string;
  quantity: string;
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const ratingString = formData.get("rating") as string;
  const rating = ratingString ? parseFloat(ratingString) : NaN;

  const prepTimeMinutesString = formData.get("prepTimeMinutes") as string;
  const prepTimeMinutes = prepTimeMinutesString ? parseInt(prepTimeMinutesString, 10) : NaN;

  const cookTimeMinutesString = formData.get("cookTimeMinutes") as string;
  const cookTimeMinutes = cookTimeMinutesString ? parseInt(cookTimeMinutesString, 10) : NaN;

  const servingsString = formData.get("servings") as string;
  const servings = servingsString ? parseInt(servingsString, 10) : NaN;

  const categoriesString = formData.get("categories") as string;
  const categories = categoriesString ? categoriesString.split(",").map(s => s.trim()).filter(s => s) : [];
  
  const ingredientsString = formData.get("ingredients") as string;
  let ingredients = [];
  try {
    if (ingredientsString) {
      ingredients = JSON.parse(ingredientsString);
    }
  } catch (e) {
    return json({ errors: { form: "Invalid JSON format for ingredients." } }, { status: 400 });
  }

  const instructionsString = formData.get("instructions") as string;
  const instructions = instructionsString ? instructionsString.split("\n").map(s => s.trim()).filter(s => s) : [];
  
  const notes = formData.get("notes") as string;


  if (!name) {
    return json({ errors: { name: "Recipe name is required" } }, { status: 400 });
  }

  if (ratingString && (isNaN(rating) || rating < 0 || rating > 5)) {
    return json({ errors: { rating: "Rating must be a number between 0 and 5" } }, { status: 400 });
  }

  try {
    await prisma.recipe.create({
      data: {
        name,
        description: description || null,
        rating: isNaN(rating) ? null : rating,
        categories,
        prepTimeMinutes: isNaN(prepTimeMinutes) ? null : prepTimeMinutes,
        cookTimeMinutes: isNaN(cookTimeMinutes) ? null : cookTimeMinutes,
        servings: isNaN(servings) ? null : servings,
        ingredients: ingredients.length > 0 ? ingredients : undefined, 
        instructions,
        notes: notes || null,
      },
    });
    return redirect(`/recipes`);
  } catch (error) {
    console.error("Failed to create recipe:", error);
    return json({ errors: { form: "Failed to save recipe. Please check your input and try again." } }, { status: 500 });
  }
}


export default function CreateRecipePage() {
  const actionData = useActionData<ActionData>();
  const [ingredientsList, setIngredientsList] = useState<Ingredient[]>([
    { item: "All-purpose flour", quantity: "2 cups" },
    { item: "Granulated sugar", quantity: "1 cup" },
    { item: "Large eggs", quantity: "3" },
    { item: "Vanilla extract", quantity: "1 tsp" },
  ]);

  const handleAddIngredient = () => {
    setIngredientsList([...ingredientsList, { item: "", quantity: "" }]);
  };

  const handleRemoveIngredient = (index: number) => {
    const list = [...ingredientsList];
    list.splice(index, 1);
    setIngredientsList(list);
  };

  const handleIngredientChange = (index: number, field: keyof Ingredient, value: string) => {
    const list = [...ingredientsList];
    list[index][field] = value;
    setIngredientsList(list);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-blue-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-3xl">
        <header className="mb-10 text-center">
          <h1 className="text-5xl font-extrabold tracking-tight text-slate-800">
            Add a New Recipe
          </h1>
          <p className="mt-3 text-lg text-slate-600">
            Share your culinary creations with the world!
          </p>
          <Link to="/recipes" className="mt-4 inline-block px-4 py-2 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300 transition-colors">
            &larr; Back to Recipes
          </Link>
        </header>

        <div className="max-w-2xl mx-auto">
          <Form method="post" className="space-y-8 rounded-xl bg-white p-8 shadow-2xl sm:p-10">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-700">
                Recipe Name
              </label>
              <input
                type="text"
                name="name"
                id="name"
                required
                className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm"
                aria-describedby="name-error"
                defaultValue="Delicious Chocolate Cake"
              />
              {actionData?.errors?.name && (
                <p className="mt-2 text-sm text-red-600" id="name-error">
                  {actionData.errors.name}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-slate-700">
                Description
              </label>
              <textarea
                name="description"
                id="description"
                rows={3}
                className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm"
                defaultValue="A rich and moist chocolate cake, perfect for any occasion. This classic recipe is easy to follow and yields a crowd-pleasing dessert."
              />
            </div>
            
            <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2">
              <div>
                <label htmlFor="rating" className="block text-sm font-medium text-slate-700">
                  Rating (0-5)
                </label>
                <input
                  type="number"
                  name="rating"
                  id="rating"
                  step="0.1"
                  min="0"
                  max="5"
                  className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm"
                  aria-describedby="rating-error"
                  defaultValue="4.5"
                />
                {actionData?.errors?.rating && (
                  <p className="mt-2 text-sm text-red-600" id="rating-error">
                    {actionData.errors.rating}
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="servings" className="block text-sm font-medium text-slate-700">
                  Servings
                </label>
                <input
                  type="number"
                  name="servings"
                  id="servings"
                  min="1"
                  className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm"
                  defaultValue="12"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2">
              <div>
                <label htmlFor="prepTimeMinutes" className="block text-sm font-medium text-slate-700">
                  Prep Time (minutes)
                </label>
                <input
                  type="number"
                  name="prepTimeMinutes"
                  id="prepTimeMinutes"
                  min="0"
                  className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm"
                  defaultValue="20"
                />
              </div>
              <div>
                <label htmlFor="cookTimeMinutes" className="block text-sm font-medium text-slate-700">
                  Cook Time (minutes)
                </label>
                <input
                  type="number"
                  name="cookTimeMinutes"
                  id="cookTimeMinutes"
                  min="0"
                  className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm"
                  defaultValue="35"
                />
              </div>
            </div>

            <div>
              <label htmlFor="categories" className="block text-sm font-medium text-slate-700">
                Categories (comma-separated)
              </label>
              <input
                type="text"
                name="categories"
                id="categories"
                className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm"
                placeholder="e.g., Italian, Quick, Dessert"
                defaultValue="Dessert, Baking, Chocolate"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Ingredients
              </label>
              {ingredientsList.map((ingredient, index) => (
                <div key={index} className="flex items-center space-x-2 mb-2">
                  <input
                    type="text"
                    placeholder="Item (e.g., Flour)"
                    value={ingredient.item}
                    onChange={(e) => handleIngredientChange(index, "item", e.target.value)}
                    className="block w-full rounded-md border-slate-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm"
                  />
                  <input
                    type="text"
                    placeholder="Quantity (e.g., 2 cups)"
                    value={ingredient.quantity}
                    onChange={(e) => handleIngredientChange(index, "quantity", e.target.value)}
                    className="block w-full rounded-md border-slate-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm"
                  />
                  {ingredientsList.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveIngredient(index)}
                      className="px-3 py-2 text-sm font-medium text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={handleAddIngredient}
                className="mt-2 px-3 py-2 text-sm font-medium text-sky-600 hover:text-sky-800 border border-sky-500 rounded-md hover:bg-sky-50 transition-colors"
              >
                Add Ingredient
              </button>
              <input type="hidden" name="ingredients" value={JSON.stringify(ingredientsList.filter(ing => ing.item.trim() !== "" || ing.quantity.trim() !== ""))} />
              <p className="mt-1 text-xs text-slate-500">
                Add each ingredient and its quantity.
              </p>
            </div>

            <div>
              <label htmlFor="instructions" className="block text-sm font-medium text-slate-700">
                Instructions (one step per line)
              </label>
              <textarea
                name="instructions"
                id="instructions"
                rows={5}
                className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm"
                placeholder="1. Mix dry ingredients.\n2. Add wet ingredients.\n3. Bake at 350°F for 30 minutes."
                defaultValue={`1. Preheat oven to 350°F (175°C). Grease and flour two 9-inch round cake pans.
2. In a large bowl, sift together flour, sugar, cocoa powder, baking soda, baking powder, and salt.
3. Add eggs, buttermilk, oil, and vanilla extract. Beat on medium speed for 2 minutes.
4. Stir in boiling water (batter will be thin).
5. Pour batter evenly into prepared pans.
6. Bake for 30-35 minutes, or until a wooden skewer inserted into the center comes out clean.
7. Let cakes cool in pans for 10 minutes before inverting onto wire racks to cool completely.`}
              />
            </div>

            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-slate-700">
                Notes (optional)
              </label>
              <textarea
                name="notes"
                id="notes"
                rows={3}
                className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm"
                defaultValue="For an extra rich flavor, use dark cocoa powder. Frost with your favorite chocolate buttercream after cooling."
              />
            </div>
            
            {actionData?.errors?.form && (
              <p className="mt-2 text-sm font-semibold text-red-700 text-center" id="form-error">
                {actionData.errors.form}
              </p>
            )}

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="rounded-lg bg-sky-600 px-6 py-3 text-base font-semibold text-white shadow-md hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 transition ease-in-out duration-150"
              >
                Create Recipe
              </button>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
}
