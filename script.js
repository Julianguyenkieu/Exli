document.addEventListener("DOMContentLoaded", () => {
    const content = document.getElementById("content");

    /* Lädt die Willkommensseite */
    function loadWelcomePage() {
        fetch(`willkommen.html`)
            .then(response => {
                if (!response.ok) throw new Error("Willkommensseite nicht gefunden.");
                return response.text();
            })
            .then(data => {
                content.innerHTML = data;
            })
            .catch(error => {
                console.error("Fehler beim Laden der Willkommensseite: ", error);
                content.innerHTML = `<p>Die Willkommensseite konnte nicht geladen werden.</p>`;
            })
    }
    /* Verhindert, dass Sonderzeichen aus der CSV direkt als HTML interpretiert werden. */
    function escapeHTML(text) {

        return String(text || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
    /* Erkennt Links */
    function makeLinks(text) {
        return text.replace(/(https?:\/\/[^\s]+)/g,'<a href="$1" target="_blank">$1</a>');
        }

    /* Fügt allfällige Bilder ein */
    function getExperimentImage(experiment) {

        const title = (experiment["Titel"] || "").trim();

        if (!title) {
            return "";
        }

        const imagePath = `Bilder/${title}.png`;

        return `
            <img
                src="${imagePath}"
                alt="${escapeHTML(title)}"
                class="experiment-image"
                onerror="this.remove()"
            >
        `;
    }

    async function findDocuments(experimentTitle) {

        const folder = "Dokumente";

        const response = await fetch(
            `https://api.github.com/repos/julianguyenkieu/exli/contents/${folder}`
        );

        if (!response.ok) {
            console.error("Dokumente konnten nicht geladen werden.");
            return [];
        }

        const files = await response.json();

        const title = experimentTitle.toLowerCase();

        return files.filter(file =>
            file.type === "file" &&
            file.name.toLowerCase().includes(title)
        );
    }

    /* Lädt ein Thema */
    function loadTopic(topic, experimentData) {
        currentTopic = topic;
        const experiments = experimentData.filter(
            experiment => experiment["Thema"].trim() === topic
        );

        let html = `<h2>${escapeHTML(topic)}</h2>`;

        if (experiments.length === 0) {
            html += `<p>Keine Experimente vorhanden.</p>`;
        } else {

            html += `<div class="experiment-list">`;

            experiments.forEach(experiment => {

                const index = experimentData.indexOf(experiment);

                html += `
                    <div class="experiment-item">
                        <a
                            href="#experiment-${index}"
                            class="experiment-link"
                            data-index="${index}"
                        >
                            ${escapeHTML(experiment["Titel"])}
                        </a>
                    </div>
                `;
            });

            html += `</div>`;
        }

        content.innerHTML = html;

        addExperimentListeners(experimentData);
    }

    /* Lädt ein Experiment */
    async function loadExperiment(index, experimentData) {

        const experiment = experimentData[index];
        
        if (!experiment) {

            content.innerHTML =
                "<p>Experiment nicht gefunden.</p>";

            return;
        }


        const title = experiment["Titel"] || "Ohne Titel";
        
        const documents = await findDocuments(title);

        content.innerHTML = `

            <button id="back-to-topic">
                ← Zurück zu den Experimenten
            </button>

            <article class="experiment">

                <h2>
                    ${escapeHTML(title)}
                </h2>


                ${
                    experiment["Thema"]
                        ? `
                            <p class="experiment-topic">
                                <strong>Thema:</strong>
                                ${escapeHTML(experiment["Thema"])}
                            </p>
                          `
                        : ""
                }


                ${
                    experiment["Kürzel"]
                        ? `
                            <p>
                                <strong>Kürzel:</strong>
                                ${escapeHTML(experiment["Kürzel"])}
                            </p>
                          `
                        : ""
                }


                ${
                    experiment["Ziel des Versuchs"]
                        ? `
                            <section>
                                <h3>Ziel des Versuchs</h3>
                                <p>
                                    ${formatText(experiment["Ziel des Versuchs"])}
                                </p>
                            </section>
                          `
                        : ""
                }


                ${
                    experiment["Apparatur"]
                        ? `
                            <section>
                                <h3>Apparatur</h3>
                                <p>
                                    ${formatText(experiment["Apparatur"])}
                                </p>
                            </section>
                          `
                        : ""
                }


                ${
                    experiment["Chemikalien"]
                        ? `
                            <section>
                                <h3>Chemikalien</h3>
                                <p>
                                    ${formatText(experiment["Chemikalien"])}
                                </p>
                            </section>
                          `
                        : ""
                }


                ${
                    experiment["Durchführung"]
                        ? `
                            <section>
                                <h3>Durchführung</h3>
                                <p>
                                    ${formatText(experiment["Durchführung"])}
                                </p>
                            </section>
                          `
                        : ""
                }

                ${
                    experiment["Beobachtungen und Fazit"]
                        ? `
                            <section>
                                <h3>Beobachtungen und Fazit</h3>
                                <p>
                                    ${formatText(experiment["Beobachtungen und Fazit"])}
                                </p>
                            </section>
                          `
                        : ""
                }

                ${
                    experiment["Bild-/Videoangaben"] || getExperimentImage(experiment)
                        ? `
                            <section>
                                <h3>Bild-/Videoangaben</h3>
                
                                ${
                                    experiment["Bild-/Videoangaben"]
                                        ? `
                                            <p>
                                                ${formatText(
                                                    experiment["Bild-/Videoangaben"]
                                                )}
                                            </p>
                                          `
                                        : ""
                                }
                            
                                ${getExperimentImage(experiment)}
                            
                            </section>
                          `
                        : ""
                }

                ${
                    experiment["Bemerkungen"]
                        ? `
                            <section>
                                <h3>Bemerkungen</h3>
                                <p>
                                    ${formatText(experiment["Bemerkungen"])}
                                </p>
                            </section>
                          `
                        : ""
                }


                ${
                    experiment["Ort"]
                        ? `
                            <section>
                                <h3>Ort</h3>
                                <p>
                                    ${formatText(experiment["Ort"])}
                                </p>
                            </section>
                          `
                        : ""
                }
                
                ${
                    documents.length > 0
                        ? `
                            <section>
                                <h3>Dokumente</h3>
                                
                                <ul class="document-list">
                                
                                    ${documents.map(document => `
                                        <li>
                                            <a
                                                href="${document.download_url}"
                                                download
                                            >
                                                ${escapeHTML(document.name)}
                                            </a>
                                        </li>
                                    `).join("")}
                                    
                                </ul>
                                    
                            </section>
                          `
                        : ""
                }


            </article>
        `;


        /*
         * Zurück-Button
         */
        const backButton =
            document.getElementById("back-to-topic");


        if (backButton) {

            backButton.addEventListener("click", () => {

                loadTopic(currentTopic, experimentData);

            });
        }
    }


    /* Aktiviert die Links zu den Themen */
    function addTopicListeners(experimentData) {
        const topicLinks = document.querySelectorAll("aside a");
        topicLinks.forEach(link => {
            link.addEventListener("click", (e) => {
                e.preventDefault(); // verhindert das Neuladen der Seite
                const topic = link.dataset.topic; 
                loadTopic(topic, experimentData);
            });
        });
    }

    /* Aktiviert die Links zu den Experimenten */
    function addExperimentListeners(experimentData) {
        const experimentLinks = document.querySelectorAll(".experiment-link");
        experimentLinks.forEach(link => {
            link.addEventListener("click", (e) => {
                e.preventDefault(); // verhindert das Neuladen der Seite
                const experiment = Number(link.dataset.index);
                loadExperiment(experiment, experimentData);
            });
        });
    }

    /* Seite initialisieren. Klick auf die Überschrift bringt zurück zur Wilkommensseite. */
    function initializePage(experimentData) {
        addTopicListeners(experimentData);    // Themen-Liste aktivieren
        loadWelcomePage();      // Willkommensseite laden

        const headerTitle = document.querySelector("header h1");
        headerTitle.addEventListener("click", (e) => {
            e.preventDefault();
            loadWelcomePage();
        });
    }

    function formatText(text) {
        return makeLinks(escapeHTML(text)) .replace(/\r?\n/g, "<br>"); 
    }

    /* Erstellt die Themenliste in der Seitenleiste */
    function createTopicList(experimentData) {

        const topicList = document.getElementById("topic-list");

        // Alle unterschiedlichen Themen aus der CSV
        const topics = [...new Set(
            experimentData
                .map(experiment => experiment["Thema"].trim())
                .filter(topic => topic !== "")
        )];

        topicList.innerHTML = "";

        topics.forEach(topic => {

            const li = document.createElement("li");

            li.innerHTML = `
                <a href="#"
                   class="topic-link"
                   data-topic="${escapeHTML(topic)}">
                    ${escapeHTML(topic)}
                </a>
            `;

            topicList.appendChild(li);
        });
    }        

    /* CSV-Datei parsen */
    function parseCSV(csv) {

        const rows = [];
        let row = [];
        let field = "";
        let inQuotes = false;

        for (let i = 0; i < csv.length; i++) {

            const char = csv[i];
            const nextChar = csv[i + 1];

            // Anführungszeichen
            if (char === '"') {

                // Doppelte Anführungszeichen innerhalb eines Feldes
                if (inQuotes && nextChar === '"') {
                    field += '"';
                    i++;
                } else {
                    inQuotes = !inQuotes;
                }

            }

            // Semikolon außerhalb von Anführungszeichen
            else if (char === ";" && !inQuotes) {

                row.push(field);
                field = "";

            }

            // Zeilenumbruch außerhalb von Anführungszeichen
            else if ((char === "\n" || char === "\r") && !inQuotes) {

                if (char === "\r" && nextChar === "\n") {
                    i++;
                }

                row.push(field);

                // Leere Zeilen ignorieren
                if (row.some(value => value.trim() !== "")) {
                    rows.push(row);
                }

                row = [];
                field = "";

            }

            // Normaler Text
            else {
                field += char;
            }
        }

        // Letztes Feld / letzte Zeile
        row.push(field);

        if (row.some(value => value.trim() !== "")) {
            rows.push(row);
        }


        // Erste Zeile enthält die Überschriften
        const headers = rows.shift().map(header => header.trim());


        // Aus jeder CSV-Zeile ein Objekt machen
        return rows.map(values => {

            const object = {};

            headers.forEach((header, index) => {
                object[header] = (values[index] || "").trim();
            });

            return object;
        });
    }

    /* CSV-Datei laden und Seite initialisieren */
    fetch("experimente.csv")
        .then(response => response.text())
        .then(csv => {
            const data = parseCSV(csv);
        
        experimentData = data;
        createTopicList(experimentData);
        initializePage(experimentData);
        
  });          // Initialisierung aufrufen
});