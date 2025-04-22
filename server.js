import express from 'express'
import { Liquid } from 'liquidjs';

const app = express()
app.use(express.urlencoded({extended: true})) // Formulierdata parsen
app.use(express.static('public'))

const engine = new Liquid();
app.engine('liquid', engine.express());

app.set('views', './views')

// ROUTES



// ----------------------------------------------- HOMEPAGE  -----------------------------------------------//

app.get('/', async function (request, response) {

  const milledoniProducts = await fetch('https://fdnd-agency.directus.app/items/milledoni_products'); //Haalt alle producten ooit op
  const milledoniProductsJSON = await milledoniProducts.json(); // Maak hier een JSON van
  const {data: all_Products} = milledoniProductsJSON // Betere naamgeving, geeft de JSON Variable weer mee aan all Products

  const savedProductsURL = 'https://fdnd-agency.directus.app/items/milledoni_users_milledoni_products';
  const savedProductsJSON = await fetch(`${savedProductsURL}?filter={"milledoni_users_id":${userID}}`);
  const {data: saved_products} = await savedProductsJSON.json();
  
//  saved_products.forEach(({ milledoni_products_id }) => { // PAS DIT AAN NAAR DE LIQUID EN NIET SERVER SIDE. SERVER SIDE IS RAAR.
//    const product = all_Products.find((({ id }) => {
//    return id === milledoni_products_id
//    }));

//    if (!product) return;
//    product.saved = true
//  }) (IS DION ZE SHIT)

   // Render index.liquid uit de Views map
   // Geef hier eventueel data aan mee
   response.render('index.liquid' , {allMilledoniProducts: all_Products, savedProducts: saved_products });
})

// ----------------------------------------------- SPECIFIEKE GIFT PAGE  -----------------------------------------------//

app.get('/gift/:id', async function (request, response) {

  const specificGiftResponse = await fetch(`https://fdnd-agency.directus.app/items/milledoni_products/${request.params.id}`);
  const {data: specificGift} = await specificGiftResponse.json();

  response.render('specificGift.liquid', { specificGift });
  
});

// ----------------------------------------------- SAVE GIFT CODE  -----------------------------------------------//

// Pseudo code POST-route voor de index-URL

  //haalt alle producten op
 
  //check of t product al bestaat
 
  //als het product bestaat verwijder hem
 
  //zo niet voeg hem toe
 
  //redirect naar homepage 

//Daadwerkelijke code:
app.post('/update-gift/:giftId', async function (request, response) {

  const savedProductsURL = 'https://fdnd-agency.directus.app/items/milledoni_users_milledoni_products';

  const idRes = await fetch(`${savedProductsURL}?filter={"milledoni_products_id":${request.params.giftId},"milledoni_users_id":${userID}}`); //Request paramsID
  const idJson = await idRes.json();

  console.log(idJson)
  if (idJson.data.length > 0) {
    const id = idJson.data[0].id;
   
    await fetch(`${savedProductsURL}/${id}`, {
      method: 'DELETE',
        headers: {
        'Content-Type': 'application/json;charset=UTF-8'
        }
    });
  } else {
     await fetch('https://fdnd-agency.directus.app/items/milledoni_users_milledoni_products', {
        method: 'POST',
        body: JSON.stringify({
            milledoni_products_id: request.params.giftId,
            milledoni_users_id: userID
        }),
        headers: {
            'Content-Type': 'application/json; charset=UTF-8'
        }
    });
  }

  // Redirect naar de homepage
  response.redirect(303, '/');
});

// ----------------------------------------------- ZIEN VAN SAVED GIFTS -----------------------------------------------// 

// Pseudo code POST-route voor de Saved gifts

  // 1. Fetch saved gifts data
 
  // 2. Maak een array om de opgeslagen cadeaus met productdetails op te slaan
 
  // 3. Loop door elk opgeslagen cadeau en haal de productdetails op
 
  // 4. Render de template met de gecombineerde data

//Daadwerkelijke code:

app.get('/mysavedgifts', async function (request, response) {
  try {
    const savedGiftsResponse = await fetch('https://fdnd-agency.directus.app/items/milledoni_users_milledoni_products?filter=%7B%22milledoni_users_id%22:6%7D');
    const {data: savedGiftsJSON} = await savedGiftsResponse.json();

    const savedGiftsWithDetails = [];

    for (const gift of savedGiftsJSON) {
      const productResponse = await fetch(`https://fdnd-agency.directus.app/items/milledoni_products/${gift.milledoni_products_id}`);
      const {data: productJSON} = await productResponse.json();
      savedGiftsWithDetails.push({
        ...gift,
        productDetails: productJSON
      });
    }

    // De ... kopieert alle eigenschappen van gift, zonder ... werkt dit niet, Voorbeeld zonder spread operator: 

    // savedGiftsWithDetails.push({
    //  id: gift.id,
    //  milledoni_products_id: gift.milledoni_products_id,
    //  productDetails: productJSON.data
    // });

    response.render('mygiftpage.liquid', { savedGifts: savedGiftsWithDetails });
  } catch (error) {
    console.error('Error fetching data:', error);
    response.status(500).send('Internal Server Error');
  }
});

// ----------------------------------------------- REDIRECT EN 404 -----------------------------------------------//

// Redirect invalide path van :id gift naar home

app.get('/gift/{*splat}', function (request, response) {
  response.redirect('/');
});

// Redirect alle invalide paths naar 404
app.get('/{*splat}', function (request, response) {
  response.status(404).render('404.liquid');
}); 

// ----------------------------------------------- PORT -----------------------------------------------//

app.set('port', process.env.PORT || 8000)

app.listen(app.get('port'), function () {

  console.log(`http://localhost:${app.get('port')}/`)
})