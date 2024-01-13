async function displayData() {
    var text = document.getElementById('query').value;
    var category = document.getElementById('field').value;
    const url = '/search?text=' + text + '&category=' + category;
    fetch(url)
        .then(response => {
            if(!response.ok) {console.log('There was an error!');};
            return response.json();
        }).then(data => {
            data = data.data
            const div = document.getElementById('data');
            div.innerHTML = '';
            const hRow = document.createElement('tr');
            try {
                Object.keys(data[0]).forEach(dat => {
                    const newData = document.createElement('th');
                    newData.innerHTML = dat;
                    hRow.appendChild(newData);
                });
            } catch (err) {
                div.innerHTML = '<h3>Nema podataka koji zadovoljavaju vašu pretragu<h3>';
            }
            div.appendChild(hRow);
            data.forEach(team => {
                console.log(team);
                const newRow = document.createElement('tr');
                Object.keys(team).forEach(dat => {
                    const newData = document.createElement('td');
                    newData.innerHTML = team[dat];
                    newRow.appendChild(newData);
                });
                div.appendChild(newRow);
            });
        }).catch(err => {
            console.log(err);
        })
    localStorage.setItem('query', text);
    localStorage.setItem('field', category);
} 

async function resetData() {
    var text = '';
    var category = 'wildcard';
    const url = '/search?text=' + text + '&category=' + category;
    fetch(url)
        .then(response => {
            if(!response.ok) {console.log('There was an error!');};
            return response.json();
        }).then(data => {
            data = data.data
            const div = document.getElementById('data');
            div.innerHTML = '';
            const hRow = document.createElement('tr');
            try {
                Object.keys(data[0]).forEach(dat => {
                    const newData = document.createElement('th');
                    newData.innerHTML = dat;
                    hRow.appendChild(newData);
                });
            } catch (err) {
                div.innerHTML = '<h3>Nema podataka koji zadovoljavaju vašu pretragu<h3>';
            }
            div.appendChild(hRow);
            data.forEach(team => {
                console.log(team);
                const newRow = document.createElement('tr');
                Object.keys(team).forEach(dat => {
                    const newData = document.createElement('td');
                    newData.innerHTML = team[dat];
                    newRow.appendChild(newData);
                });
                div.appendChild(newRow);
            });
        }).catch(err => {
            console.log(err);
        })
    
    var text = document.getElementById('query');
    var category = document.getElementById('field');
    text.value = '';
    category.value = 'wildcard';

    localStorage.setItem('query', text);
    localStorage.setItem('field', category);
}

async function toCsv() {
    const text = localStorage.getItem('query');
    const category = localStorage.getItem('field');

    const url = '/csv?text=' + text + '&category=' + category;
    fetch(url)       
        .then(response => {
            if(!response.ok) {console.log('There was an error!');};
            return response.json();
        }).then(data => {
            data = data.data
            console.log(data);
            var blob = new Blob([data], {
                type: "text/plain;charset=utf-8",
            });
            saveAs(blob, "teams.csv");
        }).catch(err => {
            console.log(err);
        })
}

async function toJson() {
    const text = localStorage.getItem('query');
    const category = localStorage.getItem('field');

    const url = '/json?text=' + text + '&category=' + category;
    fetch(url)       
        .then(response => {
            if(!response.ok) {console.log('There was an error!');};
            return response.json();
        }).then(data => {
            data = data.data
            console.log(data);
            var blob = new Blob([JSON.stringify(data)], {
                type: "text/plain;charset=utf-8",
            });
            saveAs(blob, "teams.json");
        }).catch(err => {
            console.log(err);
        })
}

async function serveJson() {
    fetch('http://localhost:3000/filejson')       
        .then(response => {
            if(!response.ok) {console.log('There was an error!');};
            return response.json();
        }).then(data => {
            data = data.data
            console.log(data);
            var blob = new Blob([data], {
                type: "text/plain;charset=utf-8",
            });
            saveAs(blob, "or.json");
        }).catch(err => {
            console.log(err);
        })
}

async function serveCsv() {
    fetch('http://localhost:3000/filecsv')       
        .then(response => {
            if(!response.ok) {console.log('There was an error!');};
            return response.json();
        }).then(data => {
            data = data.data
            console.log(data);
            var blob = new Blob([data], {
                type: "text/plain;charset=utf-8",
            });
            saveAs(blob, "or.csv");
        }).catch(err => {
            console.log(err);
        })
}

function openDataTable() {
    window.location.href = 'http://localhost:3000/datatable';
}

function logout() {
}