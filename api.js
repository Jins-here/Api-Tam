const puppeteer = require('puppeteer');

(async () => {

    let ligne = 1; // Numero de la ligne
    let Arret = "Euromédecine"; // Nom de l'arret
    let Direction = "Mosson"; // Direction du tram ou bus

    const tempsdattenteACTIONS = 700; // Temps d'attente en millisecondes a changer si sa ne fonctionne pas !!
    const tempsdattentePageChange = 1500; // Temps d'attente en millisecondes a changer si sa ne fonctionne pas !!

    if (ligne <= 0 || ligne > 53) {
        console.error("ERROR : /!\\ La ligne n'existe pas /!\\");
        return;
    }
    if (Arret.length === 0) {
        console.error("ERROR : /!\\ L'arret n'existe pas /!\\");
        return;
    }

    if (Direction.length === 0) {
        console.error("ERROR : /!\\ La direction n'existe pas /!\\");
        return;
    }

    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();


    // Mettre en majuscule les variables
    Arret = Arret.toUpperCase();
    // Direction = Direction.toUpperCase();


    await page.setViewport({ width: 1920, height: 1080 });
    await page.goto('https://www.tam-voyages.com/horaires/?rub_code=23');

    // Fonction pour cliquer sur un bouton
    async function clickOnButton(button) {
        await page.waitForTimeout(tempsdattenteACTIONS);
        await page.waitForXPath(button);
        const [buttonClick] = await page.$x(button);
        await buttonClick.click();
    }

    // Cliquer sur le bouton "Accepter les cookies"
    await clickOnButton('//*[@id="tarteaucitronAllDenied2"]');

    // Ecrire dans le champ de recherche
    const inputArret = '//*[@id="keywordsDep"]';
    await page.waitForXPath(inputArret);
    const [input] = await page.$x(inputArret);
    await input.type(Arret);

    try {
        await Promise.race([
            page.waitForXPath('//*[@id="ui-id-1"]/li[1]'),
            new Promise((resolve, reject) => setTimeout(() => reject('Le délai est écoulé'), 1000))
        ]);
        const [firstOption] = await page.$x('//*[@id="ui-id-1"]/li[1]');
        await firstOption.click();
    } catch (error) {
        console.error("ERROR : /!\\ L'arret n'existe pas /!\\");
        return await browser.close();
    }


    await clickOnButton('//*[@id="stopForm"]/fieldset/div[2]/input');

    // Cliquer sur la direction voulu
    await page.waitForTimeout(tempsdattentePageChange);
    await page.waitForXPath('//*[@id="mainMiddle"]/div/h1');

    // Verifier si la direction existe si oui cliquer dessus
    let xPathImageTram = ['//*[@id="lineList"]/ul/li/div[2]/ul/li[1]/img', '//*[@id="lineList"]/ul/li/div[2]/ul/li[2]/img', '//*[@id="lineList"]/ul/li/div[2]/ul/li[3]/img',
        '//*[@id="lineList"]/ul/li/div[2]/ul/li[4]/img', '//*[@id="lineList"]/ul/li/div[2]/ul/li[5]/img', '//*[@id="lineList"]/ul/li/div[2]/ul/li[6]/img'];

    let xPathImageBus = ['//*[@id="lineList"]/ul/li[2]/div[2]/ul/li[1]/img', '//*[@id="lineList"]/ul/li[2]/div[2]/ul/li[2]/img', '//*[@id="lineList"]/ul/li[2]/div[2]/ul/li[3]/img',
        '//*[@id="lineList"]/ul/li[2]/div[2]/ul/li[3]/img', '//*[@id="lineList"]/ul/li[2]/div[2]/ul/li[5]/img', '//*[@id="lineList"]/ul/li[2]/div[2]/ul/li[6]/img', '//*[@id="lineList"]/ul/li[2]/div[2]/ul/li[7]/img',
        '//*[@id="lineList"]/ul/li[2]/div[2]/ul/li[8]/img', '//*[@id="lineList"]/ul/li[2]/div[2]/ul/li[9]/img', '//*[@id="lineList"]/ul/li[2]/div[2]/ul/li[10]/img'];

    let etapesHoraire = false;

    await page.waitForXPath('//*[@id="mainMiddle"]/div/h1')
    if (ligne <= 4) {
        for (let i = 0; i < xPathImageTram.length; i++) {
            try {
                const imageXPath = xPathImageTram[i];
                const altText = await page.evaluate((xpath) => {
                    const image = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
                    return image.alt;
                }, imageXPath);
                if (parseInt(altText) === ligne) {
                    console.log("Ligne trouvée " + altText);
                    const modifiedXPath = xPathImageTram[i].replace('/img', '/a');
                    const text = await page.evaluate((xpath) => {
                        const element = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
                        return element ? element.textContent.trim() : null;
                    }, modifiedXPath);

                    if (text.includes(Direction.trim().toUpperCase()) || text.includes(Direction.trim().toLowerCase()) || text.toLowerCase().trim().replace('-', ' ').includes(Direction.trim().toLowerCase())) {
                        console.log("Direction trouvée");
                        const [clickDirectionFound] = await page.$x(modifiedXPath);
                        await clickDirectionFound.click();
                        etapesHoraire = true;
                        break;
                    }
                }
            } catch (error) { }
        }
    } else {
        for (let i = 0; i < xPathImageBus.length; i++) {

            try {
                const imageXPath = xPathImageBus[i];
                const altText = await page.evaluate((xpath) => {
                    const image = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
                    return image.alt;
                }, imageXPath);
                console.log(altText);
                if (parseInt(altText) === ligne) {
                    console.log("Ligne trouvée");
                    const modifiedXPath = xPathImageBus[i].replace('/img', '/a');
                    const text = await page.evaluate((xpath) => {
                        const element = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
                        return element ? element.textContent.trim() : null;
                    }, modifiedXPath);
                    if (text.includes(Direction.trim().toUpperCase()) || text.includes(Direction.trim().toLowerCase()) || text.toLowerCase().trim().replace('-', ' ').includes(Direction.trim().toLowerCase())) {
                        console.log("Direction trouvée");
                        const [clickDirectionFound] = await page.$x(modifiedXPath);
                        await clickDirectionFound.click();
                        etapesHoraire = true;
                        break;
                    };
                }
            } catch (error) {
                console.log(error);
            }
        }
    }
    if (!etapesHoraire) {
        console.error(`ERROR : /!\\ Je n'ai pas trouvé la direction contenant le texte "${Direction}" ayant la ligne "${ligne}" à l'arret ${Arret}. /!\\`);
        return await browser.close();
    }



    await page.waitForXPath('//*[@id="goatSelection"]/div[1]/ul[1]/li[3]'); // Direction titre (faut attendre qu'il soit la pour continuer)
    await page.waitForTimeout(tempsdattenteACTIONS);
    // Recuperer les horaires
    let troisBlocArray = ['//*[@id="hourMonitoring"]/ul/li[1]/span', '//*[@id="hourMonitoring"]/ul/li[2]/span', '//*[@id="hourMonitoring"]/ul/li[3]/span']

    let horaires = await page.evaluate((troisBlocArray) => {
        let horaires = [];
        troisBlocArray.forEach(element => {
            try {
                let horaire = document.evaluate(element, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.textContent;
                horaires.push(horaire);
            } catch (error) {
                horaires.push("Pas d'horaire");
            }

        });
        return horaires;
    }, troisBlocArray);

    console.log(horaires);

    browser.close();
})();

