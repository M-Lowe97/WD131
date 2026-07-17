const searchA = document.querySelector('#mission-search');
const searchB = document.querySelector('#relic-search');
const searchAClick = document.querySelector('#mission-reward');
const searchBClick = document.querySelector('#relic-reward');
const searchResults = document.getElementById('search-results');
const recentResults = document.getElementById('recent-results');
const optionsLoose = {
    keys: ['reward'],
    threshold: 0.4,
}; //Loose enough for typos, too loose for actually finding something
const optionsStrict = {
    keys: ['reward'],
    threshold: 0.1,
};//too strict for typos, but will give exact matches
const fuseMissions = new Fuse(missionRewardsData, optionsStrict);
const fuseRelics = new Fuse(relicRewardsData, optionsStrict)
const fuseMissionsLoose = new Fuse(missionRewardsData, optionsLoose); 
const fuseRelicsLoose = new Fuse(relicRewardsData, optionsLoose);
const debouncedSearch = debounce(updateDropDown, 150);
//debounce function to prevent the search function from running waaaay to often

function debounce(func, delay) {
    let timeoutID;

    return function(...args){
        clearTimeout(timeoutID);

        timeoutID = setTimeout( () => {
            func.apply(this, args);
        }, delay);
    };
}

function updateDropDown(searchInput) {
    //I used a const here since there are two possible dropdown boxes that can exist, making calling them by id in a single function kind of tricky
    const query = searchInput.value.trim();
    const dropDown = searchInput.nextElementSibling;
    dropDown.innerHTML = ''
    

    
    //if statement checks if the search bar is empty or not. Current syntax 'if the query is empty do this'
    if (!query) {
        dropDown.innerHTML = '';
        dropDown.classList.remove('dropdown');
        return;
    }

    //search mission rewards for a relic
    if (searchInput.id === 'mission-search'){

    
        const results = fuseMissionsLoose.search(query);

        if (results.length > 0) {

            const seenRewards = new Set() //filter for unique rewards
            let count = 0;
            const queryNumbers = query.match(/\d+/g); //regex to find all matching numbers

            for (const element of results){

                const rewardName = element.item.reward;

                if (queryNumbers) {
                    const hasAllNumbers = queryNumbers.every(num => rewardName.includes(num));
                    if(!hasAllNumbers) continue;
                } //we are looking for any numbers, to keep Fuse from being too fuzzy and giving things like Axi S20 when user types in A1 or a1
                
                const card = `<li class="suggestion">${rewardName}</li>`

                if (!seenRewards.has(element.item.reward) && count < 4){

                    dropDown.innerHTML += card;
                    seenRewards.add(element.item.reward);
                    count++;
                }
            }
                
        } if (results.length === 0){
            const card = `<p>The Relic you are looking for is not a mission reward and may be vaulted.<p>`
            dropDown.innerHTML += card
        };

    }
    //search relic rewards for a part
    if (searchInput.id === 'relic-search'){
        const results = fuseRelicsLoose.search(query)

        if (results.length > 0){
            const seenRewards = new Set();
            let count = 0;

            const cleanQuery = query.toLowerCase().trim()

            for (const element of results) {
                const rewardName = element.item.reward;
                const cleanReward = rewardName.toLowerCase()

                const card = `<li class="suggestion">${rewardName}</li>`

                //filter items with other item names inside of them when searching for the 'larger' word
                const wordFilter = new RegExp(`\\b${cleanQuery}\\b`, 'i');
                const hiddenWordCheck = wordFilter.test(cleanReward);


                if (!hiddenWordCheck) {
                    const isSubMatch = cleanReward.includes(cleanQuery);

                    if (!isSubMatch) continue;
                }

                if (!seenRewards.has(element.item.reward) && count < 4){
                    dropDown.innerHTML += card
                    seenRewards.add(element.item.reward);
                    count++;
                }

            }

        } if (results.length === 0){
            dropDown.innerHTML = `<p>This Relic doesn't exist... yet.</p>`
        }
    }
}

function searchEnter(event) {
    if (event.key === 'Enter'){
        const parent = event.target.nextElementSibling;
        const child = parent.querySelector('li');
        const suggestion = child.innerText;
        const query = suggestion || "";

        if (query !== ""){
            searchHistory();
            executeSearch(query);
            searchA.value = "";
            searchB.value = "";
        };
    };
}

function searchClick(event){
    const suggestion = event.target.closest('li');


    if (suggestion){
        const searchTerm = suggestion.innerText;
        const parent = suggestion.parentElement;

        searchHistory();
        executeSearch(searchTerm);
        searchA.value = "";
        searchB.value = "";
        parent.innerHTML = '';
    };
}

function searchHistory(){
    //find the table
    const newHistory = searchResults.firstElementChild;

    //does the table exist
    if (newHistory){
        recentResults.prepend(newHistory);

        if (recentResults.children.length > 4){
            recentResults.removeChild(recentResults.lastChild);
        }
    };
    //remove old contents
    searchResults.innerHTML = '';
}

function executeSearch(searchInput) {
    const query = searchInput;


    //numbers in the query mean relics which are mission rewards
    if (/\d+/.test(query) && query != "2X Forma Blueprint" && query != "1200X Kuva") {
        const results = fuseMissions.search(query)

        if(results.length === 0){
            return;
        }

        const tableRows = results.map(obj =>
            `
            <tr>
                <td>${obj.item.planet}</td>
                <td>${obj.item.mission}</td>
                <td>${obj.item.game_mode}</td>
                <td>${obj.item.rotation}</td>
                <td>${obj.item.drop_chance}</td>
            </tr>`
        ).join('');

        searchResults.innerHTML = `
        <div>
            <h3>${query}</h3>
            <table>
                <thead>
                    <tr>
                        <th>Planet</th>
                        <th>Mission</th>
                        <th>Mission Type</th>
                        <th>Rotation</th>
                        <th>Chance</th>
                    </tr>
                </thead>
                <tbody>
                    ${tableRows}
                </tbody>
            </table>
        </div>
        `
        
    }else{
        const results = fuseRelics.search(query);
        
        const tableRows = results.map(obj =>
            `
            <tr>
                <td>${obj.item.relic}</td>
                <td>${obj.item.drop_chance}</td>
            </tr>
            `
        ).join('');

        searchResults.innerHTML = `
        <div>
            <h3>${query}</h3>
            <table>
                <thead>
                    <tr>
                        <th>Relic</th>
                        <th>Drop Chance</th>
                    </tr>
                </thead>
                <tbody>
                    ${tableRows}
                </tbody>
            </table>
        </div>
        `
    }

}

searchA.addEventListener('input', function(){
    debouncedSearch(searchA);
});

searchB.addEventListener('input', function(){
    debouncedSearch(searchB);
});

searchAClick.addEventListener('click', searchClick);
searchA.addEventListener('keypress', searchEnter);
searchBClick.addEventListener('click', searchClick);
searchB.addEventListener('keypress', searchEnter);

document.addEventListener('click', (event) => {
  // Find all open suggestion boxes
  const allBoxes = document.querySelectorAll('.dropdownbox-hidden');
  
  allBoxes.forEach(box => {
    const wrapper = box.closest('.form-field');
    
    // If the click is NOT inside the wrapper that contains this specific box
    if (!wrapper.contains(event.target)) {
      box.style.display = 'none';
    } else{
        box.style.display = '';
    }
  });
});