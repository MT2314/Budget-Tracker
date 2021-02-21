let db;

//Create index Database (indexDb)
const request = indexedDB.open("budgetDb", 1);

request.onupgradeneeded = ({ target }) => {
    const db = target.result;
    db.createObjectStore("pending", { autoIncrement: true });

};

request.onsuccess = ({ target }) => {
    db = target.result;
    if(navigator.onLine) {
        checkDatabase();
    }
};

request.onerror = ({ target }) => {
    console.log(target.errorCode);
};


const saveRecord = (record) => {
    
    const transaction = db.transaction(["pending"], "readwrite")
    const store = transaction.objectStore("pending");
    store.add(record);
}

//Check the database
function checkDatabase() {

    const transaction = db.transaction(["pending"], "readwrite")
    const store = transaction.objectStore("pending");
    const getAll = store.getAll();

    getAll.onsuccess = () => {
        if(getAll.result.length > 0) {
            fetch("/api/transaction/bulk", {
                method: 'POST',
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'Content-Type': 'application/json',
                },
            })
                .then((response) => response.json())
                .then(() => {

                    //if checkDatabse() successful clear it
                    const transaction = db.transaction(["pending"], "readwrite")
                    const store = transaction.objectStore("pending");
                    store.clear()
                })
        }
    }
};

//Listener for the app coming back online
window.addEventListener("online", checkDatabase);