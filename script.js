// Starting Page 
let page = 1;

// Fetching function
async function getData() {
    // Endpoint API
    const url = "https://api.github.com/user/repos";
    // PerPage Items
    const perPage = 10;
    

    try {
        // Assign constant to the fetching of data with headers.
        const response = await fetch(`${url}?per_page=${perPage}&page=${page}`, {
            headers: {
                "Accept": "application/vnd.github+json",
                "Authorization": "Bearer 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",
                "X-GitHub-Api-Version": "2022-11-28"
            },
        });

        // If no response throw error
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }

        // Else save response into json const as json collection and log it
        const json = await response.json();
        console.log(json);

        // return the collection
        return json
    } catch (error) {
        console.error(error.message);
    }
}
// ReposRender basic
function renderRepos(repos) {
    // Select DOM Element
    const repoList = document.getElementById("repo-list");
    // Empty it
    repoList.innerHTML = '';

    // forEach loop with array i return from getData()
    repos.forEach(repo => {
        // create li-element
        const listItem = document.createElement('li')
        // insert repo.name into it
        listItem.innerHTML = repo.name;
        // insert li-element into DOM Element
        repoList.appendChild(listItem);
    });
}

// At startup first 10 rendered
document.addEventListener("DOMContentLoaded", async () => {
    // save the return of getData (json collection) into var repos and wait to fetch data
    const repos = await getData();
    // if data it's fetched apply render-repos
    if (repos) {
        renderRepos(repos);
    }
});

let nextBtn = document.getElementById('next-page');
nextBtn.addEventListener('click', async () => {
    // save the return of getData (json collection) into var repos and wait to fetch data
    const repos = await getData();

    // If repo in pagina minori di 10
    if (repos.length < 10) {
        page = 1
        // if data it's fetched apply render-repos
        if (repos) {
            renderRepos(repos);
        }
    } else {
        // set page up
        page++;
        // if data it's fetched apply render-repos
        if (repos) {
            renderRepos(repos);
        }
    }
})