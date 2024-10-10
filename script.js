// Params for url query
let page = 1;
const perPage = 10;
let lastPageUrl = null;
let searchQuery = '';

// DOM Elements
const searchBar = document.getElementById("search-bar");
const searchButton = document.getElementById("search-button");
const nextBtn = document.getElementById('next-page');
const prevBtn = document.getElementById('prev-page');
const loader = document.getElementById('loader');
const repoList = document.getElementById("repo-list");


// Fetching function for global search
async function getData(url = null) {
    // Use url provided as parameter or the other url
    const apiUrl = url || `https://api.github.com/search/repositories?q=${searchQuery}&per_page=${perPage}&page=${page}`;

    // Try to make the call
    try {
        // Headers to make it work
        const response = await fetch(apiUrl, {
            headers: {
                "Accept": "application/vnd.github+json",
                "X-GitHub-Api-Version": "2022-11-28"
            },
        });

        // If response it's not good throw error with status
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }
        // Wait the response
        const json = await response.json();
        console.log(json);

        // Get the link in the headers
        const linkHeader = response.headers.get('Link');
        // If it's not the last page and page it's first and linkHeader exist get the last page url
        if (!lastPageUrl && page === 1 && linkHeader) {
            lastPageUrl = getLastPageUrl(linkHeader);
        }
        // Return the json
        return json;
    } catch (error) {
        // If the error has been thrown, catch it and console log it
        console.error(error.message);
    }
}

// Last url retriever
function getLastPageUrl(linkHeader) {
    // Since links are two strings divided by a , split by ,
    const links = linkHeader.split(", ");
    // For each of strings in the created array by split
    for (const link of links) {
        // Deconstruct into urlPart and relPart each link
        const [urlPart, relPart] = link.split("; ");
        // If includes rel=last so it's the last page url return it without brackets
        if (relPart.includes('rel="last"')) {
            return urlPart.slice(1, -1);
        }
    }
    // If nothing found return null
    return null;
}

// Search logic
searchButton.addEventListener("click", async () => {
    // Trim the input of the user
    searchQuery = searchBar.value.trim();
    // Reset the page to 1 cause each click it's a new page so needed page 1 of the result
    page = 1;

    // Get the selector from the DOM
    let selection = document.getElementById('searchQuery');
    // Take the value selected in the selector
    const selectedOption = selection.value;

    // If the searchQuery it's longer then 2 carachters go and make the searc
    if (searchQuery.length > 2) {
        // Clear the inner of the div where things are rendered
        repoList.innerHTML = '';
        // Show the loader
        showLoader();
        // Create repos const
        let repos;

        // If the selector value it's repo make the search using the already in the getData
        if (selectedOption === 'repo') {
            // Get results
            repos = await getData();
            // If there's results show the buttons prev-next and render the repos + add info
            if (repos) {
                showButtons(repos)
                renderRepos(repos);
                document.getElementById('page-count').textContent = "Page - 1";
                document.getElementById('repo-count').innerHTML = `Number of repositories found - <strong><em>${repos.total_count}</em></strong>`;
            }

            // If the selector value it's user make the search using the url into this function
        } else if (selectedOption === 'user') {
            repos = await getData(`https://api.github.com/search/users?q=${searchQuery}&per_page=${perPage}&page=${page}`);
            // If there's results show the buttons prev-next and render the repos + add info
            if (repos) {
                showButtons(repos)
                renderRepos(repos);
                document.getElementById('page-count').textContent = "Page - 1";
                document.getElementById('repo-count').innerHTML = `Number of users found - <strong><em>${repos.total_count}</em></strong>`;
            }

        }
        // Hide the loader
        hideLoader();
        
        // Message for less then 3 char
    } else {
        alert('Minimum 3 characters required for search.');
    }
});

// Next button logic
nextBtn.addEventListener('click', async () => {
    // Clear div to hide previous cards and throw the loader
    repoList.innerHTML = '';
    showLoader();

    // Increment the page var
    page++;
    // Get new data
    const repos = await getData();
    // Get the last page number form the url
    const lastPage = new URL(lastPageUrl).searchParams.get('page')

    // If the the page incremented become bigger than lastPage reset page to first and render
    if (page > lastPage) {
        page = 1; // Reset to first page if last page reached
        const firstPageRepos = await getData();
        renderRepos(firstPageRepos);
        document.getElementById('page-count').textContent = "Page - 1";

        // Else rendere the page indicated 
    } else {
        renderRepos(repos);
        document.getElementById('page-count').textContent = "Page - " + page;
    }

    // HideLoader
    hideLoader();
    
});

// Prev button logic
prevBtn.addEventListener('click', async () => {
    // Clear div + throw loader
    repoList.innerHTML = '';
    showLoader();

    // If page it's bigger then 1 reduce it and render
    if (page > 1) {
        page--;
        const repos = await getData();
        renderRepos(repos);
        document.getElementById('page-count').textContent = "Page number " + page;

    // Else if page it's the first, go to last page and render it 
    } else if (page === 1) {
        const repos = await getData(lastPageUrl);

        // Get the last page number, and assign it to page then if i click next the next checks if it's bigger then last page after increment and reset to 1
        const newPage = new URL(lastPageUrl).searchParams.get('page');
        page=newPage
        
        // Render
        renderRepos(repos);
        document.getElementById('page-count').textContent = "Last page ";
    }
    // Hide
    hideLoader();
});

// Show loader
function showLoader() {
    loader.style.display = 'block';
}
// Hide loader
function hideLoader() {
    loader.style.display = 'none';
}

// Rendering function
function renderRepos(repos) {
    // Each render clear the main div
    repoList.innerHTML = '';

    // Create Div with bootstrap classes
    const div = document.createElement('div');
        div.classList.add('d-flex');
        div.classList.add('flex-wrap');
        div.classList.add('my-3');
        div.classList.add('gap-3');
        div.classList.add('flex-grow-1');

    // If repos exist and more than 0 create the card and insert the data.
    if (repos && repos.total_count > 0) {
        repos.items.forEach(repo => {
            // Create Card
            const card = document.createElement('div');
            card.classList.add('card');
            card.classList.add('d-flex');
            card.classList.add('flex-row');

            card.style.width = 'calc(97.5% / 2)';
            card.style.height = '90px';

            // Create Card Img 
            const cardImg = document.createElement('img');
            cardImg.classList.add('card-img-top');

            cardImg.style.width = '30%';
            cardImg.style.height = '100%';
            cardImg.style.objectFit = 'cover';
            cardImg.style.borderTopRightRadius = 0;
            cardImg.style.borderBottomRightRadius = 0;

            cardImg.src = repo.avatar_url || repo.owner.avatar_url; 
            card.appendChild(cardImg);

            // Create Card-body div
            const cardBody = document.createElement('div')
            cardBody.classList.add('card-body')
            card.appendChild(cardBody);


            // Create Card title
            const cardTitle = document.createElement('a');
            cardTitle.classList.add('card-title');
            cardTitle.classList.add('fw-bold');
            cardTitle.classList.add('fs-5');


            cardTitle.href = repo.html_url;
            cardTitle.setAttribute('target', '_blank');
            // Insert name or login(username) based on repo content
            cardTitle.textContent = repo.login || repo.name;
            cardBody.appendChild(cardTitle);

            div.appendChild(card);
        });
        // If there are repos but total count it's 0 no items found message
    } else if (repos && repos.total_count === 0) {
            const title = document.createElement('h1');
            title.classList.add('text-center');
            title.classList.add('my-4');
            title.classList.add('text-center');
            
            title.innerHTML = 'Sorry, nothing found.';
            document.getElementById('error-message').appendChild(title);
    }

    // Insert the div into the main div
    repoList.appendChild(div);
}

// Buttons rendering
function showButtons (repos) {
    // Count the number of repos
    const totalCount = repos.total_count;

    // If number of totale repos it's bigger then per page items meaning more then one page exist display buttons else hide
    if (totalCount > perPage) {
        document.getElementById('buttons').classList.remove('d-none')
        document.getElementById('buttons').classList.add('d-block')
    } else {
        document.getElementById('buttons').classList.add('d-none')
        document.getElementById('buttons').classList.remove('d-block')
    }

}

