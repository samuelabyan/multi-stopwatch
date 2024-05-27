document.addEventListener('DOMContentLoaded', () => {
            const addStopwatchButton = document.getElementById('add-stopwatch');
            const stopwatchesContainer = document.getElementById('stopwatches');
            const clearStorageButton = document.getElementById('clear-storage');
            const exportDataButton = document.getElementById('export-data');
            const importDataButton = document.getElementById('import-button');
            const importDataInput = document.getElementById('import-data');

            addStopwatchButton.addEventListener('click', addStopwatch);
            clearStorageButton.addEventListener('click', clearStorage);
            exportDataButton.addEventListener('click', exportData);
            importDataButton.addEventListener('click', () => importDataInput.click());
            importDataInput.addEventListener('change', importData);

            loadStopwatches();

            function addStopwatch() {
                const id = Date.now().toString();
                createStopwatchElement(id);
                saveStopwatch(id, {
                    name: '',
                    startTime: null,
                    elapsedTime: 0,
                    isRunning: false,
                });
            }

            function createStopwatchElement(id) {
                const stopwatch = document.createElement('div');
                stopwatch.className = 'stopwatch';
                stopwatch.dataset.id = id;

                const nameInput = document.createElement('input');
                nameInput.type = 'text';
                nameInput.placeholder = 'Stopwatch Name';
                nameInput.addEventListener('input', () => updateStopwatchName(id, nameInput.value));

                const timeDisplay = document.createElement('div');
                timeDisplay.className = 'time';
                timeDisplay.textContent = '00:00:00';

                const buttonsContainer = document.createElement('div');
                buttonsContainer.className = 'stopwatch-buttons';

                const startButton = document.createElement('button');
                startButton.innerHTML = '<i class="fas fa-play"></i>';
                startButton.addEventListener('click', () => startStopwatch(id));

                const pauseButton = document.createElement('button');
                pauseButton.innerHTML = '<i class="fas fa-pause"></i>';
                pauseButton.addEventListener('click', () => pauseStopwatch(id));

                const resetButton = document.createElement('button');
                resetButton.innerHTML = '<i class="fas fa-redo"></i>';
                resetButton.addEventListener('click', () => resetStopwatch(id));

                const deleteButton = document.createElement('button');
                deleteButton.className = 'delete-button';
                deleteButton.innerHTML = '<i class="fas fa-trash"></i>';
                deleteButton.addEventListener('click', () => {
                    if (confirm('Do you really want to delete this stopwatch?')) {
                        deleteStopwatch(id);
                    }
                });

                buttonsContainer.appendChild(startButton);
                buttonsContainer.appendChild(pauseButton);
                buttonsContainer.appendChild(resetButton);

                stopwatch.appendChild(nameInput);
                stopwatch.appendChild(timeDisplay);
                stopwatch.appendChild(buttonsContainer);
                stopwatch.appendChild(deleteButton);

                stopwatchesContainer.appendChild(stopwatch);

                loadStopwatchState(id, timeDisplay);
            }

            function updateStopwatchName(id, name) {
                const stopwatches = getStopwatches();
                if (stopwatches[id]) {
                    stopwatches[id].name = name;
                    saveStopwatches(stopwatches);
                }
            }

            function startStopwatch(id) {
                const stopwatches = getStopwatches();
                if (stopwatches[id] && !stopwatches[id].isRunning) {
                    stopwatches[id].isRunning = true;
                    stopwatches[id].startTime = Date.now() - stopwatches[id].elapsedTime;
                    saveStopwatches(stopwatches);
                    updateTimer(id);
                }
            }

            function pauseStopwatch(id) {
                const stopwatches = getStopwatches();
                if (stopwatches[id] && stopwatches[id].isRunning) {
                    stopwatches[id].isRunning = false;
                    stopwatches[id].elapsedTime = Date.now() - stopwatches[id].startTime;
                    saveStopwatches(stopwatches);
                }
            }

            function resetStopwatch(id) {
                const stopwatches = getStopwatches();
                if (stopwatches[id]) {
                    stopwatches[id].isRunning = false;
                    stopwatches[id].elapsedTime = 0;
                    stopwatches[id].startTime = null;
                    saveStopwatches(stopwatches);
                    updateStopwatchDisplay(id, 0);
                }
            }

            function deleteStopwatch(id) {
                const stopwatches = getStopwatches();
                if (stopwatches[id]) {
                    delete stopwatches[id];
                    saveStopwatches(stopwatches);
                    document.querySelector(`.stopwatch[data-id="${id}"]`).remove();
                }
            }

            function updateTimer(id) {
                const stopwatches = getStopwatches();
                if (stopwatches[id] && stopwatches[id].isRunning) {
                    const elapsedTime = Date.now() - stopwatches[id].startTime;
                    updateStopwatchDisplay(id, elapsedTime);

                    requestAnimationFrame(() => updateTimer(id));
                }
            }

            function updateStopwatchDisplay(id, elapsedTime) {
                const stopwatch = document.querySelector(`.stopwatch[data-id="${id}"]`);
                if (stopwatch) {
                    const timeDisplay = stopwatch.querySelector('.time');
                    timeDisplay.textContent = formatTime(elapsedTime);
                }
            }

            function formatTime(milliseconds) {
                const totalSeconds = Math.floor(milliseconds / 1000);
                const hours = Math.floor(totalSeconds / 3600);
                const minutes = Math.floor((totalSeconds % 3600) / 60);
                const seconds = totalSeconds % 60;

                return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
            }

            function saveStopwatch(id, data) {
                const stopwatches = getStopwatches();
                stopwatches[id] = data;
                saveStopwatches(stopwatches);
            }

            function loadStopwatches() {
                const stopwatches = getStopwatches();
                for (const id in stopwatches) {
                    createStopwatchElement(id);
                }
            }

            function loadStopwatchState(id, timeDisplay) {
                const stopwatches = getStopwatches();
                const stopwatch = stopwatches[id];

                if (stopwatch) {
                    const { name, startTime, elapsedTime, isRunning } = stopwatch;

                    const nameInput = document.querySelector(`.stopwatch[data-id="${id}"] input`);
                    nameInput.value = name;

                    const currentTime = isRunning ? Date.now() - startTime : elapsedTime;
                    updateStopwatchDisplay(id, currentTime);

                    if (isRunning) {
                        updateTimer(id);
                    }
                }
            }

            function getStopwatches() {
                return JSON.parse(localStorage.getItem('stopwatches') || '{}');
            }

            function saveStopwatches(stopwatches) {
                localStorage.setItem('stopwatches', JSON.stringify(stopwatches));
            }

            function clearStorage() {
                localStorage.removeItem('stopwatches');
                location.reload();
            }

            function exportData() {
                const stopwatches = getStopwatches();
                const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(stopwatches));
                const downloadAnchor = document.createElement('a');
                downloadAnchor.setAttribute("href", dataStr);
                downloadAnchor.setAttribute("download", "stopwatches.json");
                document.body.appendChild(downloadAnchor); // required for firefox
                downloadAnchor.click();
                downloadAnchor.remove();
            }

            function importData(event) {
                const file = event.target.files[0];
                if (!file) return;

                const reader = new FileReader();
                reader.onload = (e) => {
                    const contents = e.target.result;
                    const importedData = JSON.parse(contents);
                    saveStopwatches(importedData);
                    location.reload();
                };
                reader.readAsText(file);
            }
        });