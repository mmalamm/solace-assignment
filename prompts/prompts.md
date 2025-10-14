In my application, in the search form, I want to enable the user to enter a search term, where the user should be able to search by name or city.
I also want to allow the user to choose specialties from a list to filter advocates who have those specialties
I also want to allow them to choose from one of the degrees, PhD MD or MSW
I also want them to be able to filter by x+ years of experience

I want the results to be paginated sensibly to allow the user to choose between 10, 25, or 100 results per page

is the database set up correctly in order to do this? how would I have to modify the src/app/api/advocates/route.ts to accommadate the form submission action? can you explain and outline the solution for me before you do anything? and write the explanation and steps as a markdown file

---

Now let's work on the frontend 1 pager (refs/frontend-implementation-plan.md)

I want to use Shad cn to style the frontend

I want to create 4 different components on the page: <Form />, <Results />, <Header /> and <Footer />.

Form:

I want the form to be a sidebar. on bigger screens, i want the form to persist on the side along with the results, and on smaller screens I want it to toggle in and out of the side with a button in the header, so that the results show by default, and are partially covered when the form is open. I want the form to have:

- a search input field, that handles the location/name search
- a multi-select list for the specialties (which can be found in src/db/seed/advocates.ts on lines 5-32)
- a single select radio for degree (either MSW/PhD/MD)
- a slider type (or other sensible ui element) for filtering by minimum YoE
- a submit button that executes the api call

Results:

I want the results to reflect in the component as a beautiful list of cards using shadcn components. I want the pagination and resultsPerPage controls to exist here also

Header:

I want to have a beautiful, simple header element that features the solace logo (public/solace.svg), and the search icon for smaller screens to toggle the form sidebar

Footer:

just a simple static component with some information that typically would be included in a minimalist footer

**State Management**
I would like to use good state management to handle the frontend state. I was considering using a solution with caching like react query or something, and perhaps maintaining state in the URL somehow but I am not sure if this is a good experience, or even necessary for this demo app.

maybe just reactContext with a custom hook might suffice but would love your thoughs on this; feel free to take a look at the route (src/app/api/advocates/route.ts) to come up with a least friction path to an elegant and simple to understand solution

notate a good, easy to follow doc to achieve these goals please

---

2 things:

- Make the footer even simpler. just the <p> under the separator will suffice
- take a look at the solace website to draw inspiration for the shadcn config: https://www.solace.health/

make these updates and I think we might be ready to get started

---

ok let's do some polish on the UI. I found several issues:

- the desktop view is not centered (typically something i fix by putting it into a container with margin auto, but am open to your suggestions)
- the padding is 0 so the components butt up against the edge of the view
- the sidebar on mobile doesnt scroll down so the submit button is not properly in the viewport on my small phone

can you come up with a plan for these fixes and notate them in a ui-polish.md document?
