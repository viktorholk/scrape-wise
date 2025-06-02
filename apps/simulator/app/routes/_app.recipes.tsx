import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { prisma, Recipe } from "@packages/database";

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  const pageTitle = data?.currentPage ? `Recipes - Page ${data.currentPage} | Scrape Wise` : "Recipes | Scrape Wise";
  return [
    { title: pageTitle },
    { name: "description", content: "Explore a curated collection of delicious recipes, one dish at a time." },
  ];
};

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const pageParam = url.searchParams.get("page");
  const page = parseInt(pageParam || "1", 10);

  if (isNaN(page) || page < 1) {
    throw new Response("Invalid Page Number", { status: 404 });
  }

  const recipesPerPage = 3;
  const skip = (page - 1) * recipesPerPage;

  const [recipes, totalRecipes] = await prisma.$transaction([
    prisma.recipe.findMany({
      skip,
      take: recipesPerPage,
      orderBy: { createdAt: "desc" },
    }),
    prisma.recipe.count(),
  ]);

  const totalPages = Math.ceil(totalRecipes / recipesPerPage);

  if (page > totalPages && totalRecipes > 0) {
    throw new Response("Page Not Found", { status: 404 });
  }

  return json({
    recipes: recipes as Recipe[],
    currentPage: page,
    totalPages,
    totalRecipes,
  });
}

const ClockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5 inline-block text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const UsersIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5 inline-block text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 016-6h6a6 6 0 016 6v1h-1.5M18.5 14.5a3.5 3.5 0 100-7 3.5 3.5 0 000 7z" />
  </svg>
);

const StarIcon = ({ className = "h-5 w-5 inline-block text-amber-400" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

export default function RecipesPage() {
  const { recipes, currentPage, totalPages } = useLoaderData<typeof loader>();

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-blue-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-3xl">
        <header className="mb-10 text-center">
          <h1 className="text-5xl font-extrabold tracking-tight text-slate-800">
            Recipe Showcase
          </h1>
          <p className="mt-3 text-lg text-slate-600">
            Page {currentPage} of {totalPages} &bull; Discover your next favorite meal!
          </p>

          <Link to="/create" className="mt-4 px-4 py-2 bg-sky-500 text-white rounded-md hover:bg-sky-600 transition-colors">
            Create New Recipe
          </Link>
        </header>

        {recipes.length === 0 ? (
          <div className="text-center rounded-lg bg-white p-12 shadow-xl">
            <img src="/placeholder-no-recipes.svg" alt="No recipes found" className="mx-auto mb-6 h-40 w-40" /> 
            <h2 className="text-2xl font-semibold text-slate-700">No Recipes Yet!</h2>
            <p className=" text-slate-500">Looks like the cookbook is empty. Try seeding the database or adding new recipes.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {recipes.map((recipe) => (
              <article key={recipe.id} className="w-full flex flex-col md:flex-row md:items-center overflow-hidden rounded-xl bg-white shadow-2xl transition-all duration-300 ease-in-out hover:shadow-3xl h-[350px] md:h-[350px]">
                  <div className="md:w-2/5 md:h-[250px] h-64 w-full flex-shrink-0">
                    <img
                      src={"https://images.immediate.co.uk/production/volatile/sites/30/2013/05/spaghetti-carbonara-382837d.jpg?resize=768,574"}
                      alt={`Image of ${recipe.name}`}
                      className="h-full w-full object-cover object-center p-3"
                      onError={(e) => (e.currentTarget.style.display = 'none')} 
                    />
                  </div>
                <div className="flex flex-col justify-between p-6 md:p-8 flex-grow">
                  <div>
                    <h2 className="text-3xl font-bold text-sky-700 hover:text-sky-600 transition-colors">
                      {recipe.name} 
                    </h2>
                    {recipe.description && (
                      <p className="mt-3 text-slate-600 line-clamp-3 md:line-clamp-4 text-base">
                        {recipe.description}
                      </p>
                    )}
                    <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-700">
                      {recipe.prepTimeMinutes && (
                        <span className="flex items-center"><ClockIcon /> Prep: {recipe.prepTimeMinutes} min</span>
                      )}
                      {recipe.cookTimeMinutes && (
                        <span className="flex items-center"><ClockIcon /> Cook: {recipe.cookTimeMinutes} min</span>
                      )}
                      {recipe.servings && (
                        <span className="flex items-center"><UsersIcon /> Serves: {recipe.servings}</span>
                      )}
                    </div>
                  </div>
                  <footer className="mt-6">
                    <div className="flex items-center justify-between">
                      {recipe.rating && (
                        <div className="flex items-center">
                          {[...Array(Math.floor(recipe.rating))].map((_, i) => <StarIcon key={`star-${i}`} />)}
                          {[...Array(5 - Math.floor(recipe.rating))].map((_, i) => <StarIcon key={`empty-star-${i}`} className="h-5 w-5 inline-block text-slate-300" /> )}
                          <span className="ml-2 text-sm font-medium text-slate-600">({recipe.rating.toFixed(1)}/5)</span>
                        </div>
                      )}
                    </div>
                    {recipe.categories && recipe.categories.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {recipe.categories.map((category) => (
                          <span key={category} className="rounded-full bg-sky-100 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-sky-800">
                            {category}
                          </span>
                        ))}
                      </div>
                    )}
                  </footer>
                </div>
              </article>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <nav className="mt-4 flex items-center justify-between" aria-label="Pagination">
            <Link
              to={`/recipes?page=${currentPage - 1}`}
              className={`inline-flex items-center rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 ${
                currentPage <= 1 ? "pointer-events-none opacity-50" : ""
              }`}
              preventScrollReset
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="-ml-1 mr-2 h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
              Previous
            </Link>
            <span className="text-sm font-medium text-slate-700">
              Page {currentPage} of {totalPages}
            </span>
            <Link
              to={`/recipes?page=${currentPage + 1}`}
              className={`inline-flex items-center rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 ${
                currentPage >= totalPages ? "pointer-events-none opacity-50" : ""
              }`}
              preventScrollReset
            >
              Next
              <svg xmlns="http://www.w3.org/2000/svg" className="-mr-1 ml-2 h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>
            </Link>
          </nav>
        )}
      </div>
    </div>
  );
}
