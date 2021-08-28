const puppeteer = require('puppeteer');
const { CronJob } = require('cron');
const ObjectsToCsv = require('objects-to-csv')

require('dotenv').config();

(async () => {
    let browser = await puppeteer.launch({ headless: false });

    let filasParaCsv = [];
    
    let page = await browser.newPage();
    await page.goto('https://finclan.com/bin-code/country/argentina', { waitUntil:'networkidle0' });

    // guardo los links de cada banco
    let links = await page.evaluate(() => {
        let links = [];
        document.querySelectorAll(".alert-link.td-none").forEach((link) => links.push(link.href))
        return links;
    });
    
    const cantBancos = links.length;

    // recorro cada link 
    for (let i = 0; i < links.length; i++) {
        await page.goto(links[i], { waitUntil:'networkidle0' });

        let marcas = await page.evaluate(() => {
            let marcas = [];
            document.querySelectorAll(".alert-link.td-none").forEach((marca) => marcas.push(marca.href))
            return marcas;
        });

        console.log("Marcas", marcas);

        for (let j = 0; j < marcas.length; j++){
            await page.goto(marcas[j], { waitUntil:'networkidle0' });

            let bins = await page.evaluate(() => {
                let bins = [];
                document.querySelectorAll(".alert-link.td-none").forEach((bin) => bins.push(bin.href))
                return bins;
            });

            console.log("Bins", bins);

            for (let k = 0; k < bins.length; k++){
                await page.goto(bins[k], { waitUntil:'networkidle0' });

                let fila = await page.evaluate(() => {
                    let filas = "";

                    document.querySelectorAll(".table.table-stripped.table-bordered.mt-4 tbody tr").forEach((fila) => {
                        filas += fila.children[1].innerText + ";";
                    });

                    return filas;
                });

                filasParaCsv.push({fila});

                console.log(`Banco ${i+1} de ${cantBancos}`);
            }
        }
    }
            
    browser.close();

    const csv = new ObjectsToCsv(filasParaCsv);
    await csv.toDisk('./list.csv', { append: true }); // append:true para sobreescribir el archivo
})();