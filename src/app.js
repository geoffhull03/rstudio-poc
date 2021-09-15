/* global $ instantsearch algoliasearch */

const autocomplete = instantsearch.connectors.connectAutocomplete(
  ({indices, currentRefinement, refine, widgetParams}, isFirstRendering) => {
    const {container} = widgetParams;

    const resultProducts = document.querySelector('#autocomplete-products');
    const resultContent = document.querySelector('#autocomplete-content');
    const resultCustomerInfo = document.querySelector('#autocomplete-customer-info');
    const resultBlog = document.querySelector('#autocomplete-blog');
    const search = document.querySelector('#searchbox');

    if(isFirstRendering){
      const input = document.createElement('input');
      input.className = 'ais-SearchBox-input';
      input.type = 'search';
      input.addEventListener('input', event => {
        refine(event.currentTarget.value);
      });

      search.appendChild(input);

      const p = document.createElement('p');
      p.innerHTML = '<strong>Products</strong>';
      const p2 = document.createElement('p');
      p2.innerHTML = '<strong>Open Source</strong>';
      const p3 = document.createElement('p');
      p3.innerHTML = '<strong>Blog</strong>';
      const p4 = document.createElement('p');
      p4.innerHTML = '<strong>Customer Info</strong>';

      resultProducts.appendChild(p);
      resultContent.appendChild(p2);
      resultBlog.appendChild(p3);
      resultCustomerInfo.appendChild(p4);
      resultProducts.appendChild(document.createElement('ul'));
      resultContent.appendChild(document.createElement('ul'));
      resultBlog.appendChild(document.createElement('ul'));
      resultCustomerInfo.appendChild(document.createElement('ul'));

      const searchbox = document.querySelector('#searchbox input');
      searchbox.addEventListener('focus', () => {
        container.style.display = 'block';
      });
      document.documentElement.addEventListener('click', (event) => {
        if(!event.target.closest('#autocomplete, #searchbox')){
          container.style.display = 'none';
        }
      });
    }

    

    search.querySelector('input').value = currentRefinement;

    resultProducts.querySelector('ul').innerHTML = '';
    resultContent.querySelector('ul').innerHTML = '';
    resultBlog.querySelector('ul').innerHTML = '';
    resultCustomerInfo.querySelector('ul').innerHTML = '';

    resultProducts.style.display = 'none';
    resultContent.style.display = 'none';
    resultBlog.style.display = 'none';
    resultCustomerInfo.style.display = 'none';
    
    indices.forEach(item => {
      if(item.results){
        const isProduct = item.indexName === 'rstudio_crawler_products';
        let resultList = null;
        switch(item.indexId) {
          case 'rstudio_crawler_products':
            if(item.results.hits.length > 0){
              resultProducts.style.display = null;
            }
            resultList = resultProducts;
            break;
          case 'open_source':
            if(item.results.hits.length > 0){
              resultContent.style.display = null;
            }
            resultList = resultContent;
            break;
          case 'customer_info':
            if(item.results.hits.length > 0){
              resultCustomerInfo.style.display = null;
            }
            resultList = resultCustomerInfo;
            break;
          case 'rstudio_crawler_blog':
            if(item.results.hits.length > 0){
              resultBlog.style.display = null;
            }
            resultList = resultBlog;
            break;
        }

        item.results.hits.forEach(hit => {
          resultList.querySelector(
            'ul'
          ).innerHTML += `<li>${autocompleteProduct(hit, isProduct)}</li>`;
        });
      }
    });
  }
);

const autocompleteProduct = (hit, isProduct) => {
  const img =
    isProduct && hit.image
      ? `<div class="autocomplete-product__image-container">
  <img class="autocomplete-product__image" src="${hit.image}" width="100" />
</div>`
      : '';

  const contentSnippet = hit.content
    ? instantsearch.snippet({
      attribute: 'content',
      highlightedTagName: 'mark',
      hit,
    })
    : '';

  const descSnippet = hit.description
    ? instantsearch.snippet({
      attribute: 'description',
      highlightedTagName: 'mark',
      hit,
    })
    : '';

  const snippet = contentSnippet ? contentSnippet : descSnippet;
  let dateString;
  if(hit.date){
    const date = new Date(hit.date * 1000);
    dateString = date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
  }
  const dateSnippet = dateString? `
    <small class="autocomplete-product__date">${dateString}</small><br />
  ` : '';

  return `<div class="autocomplete-product">
    ${img}
    <div class="autocomplete-product__details">
      <h3 class="autocomplete-product__name">
        <a href="${hit.url}">${hit.title}</a>
      </h3>
      ${dateSnippet}
      <small>${snippet}</small>
    </div>
    </div>`;
};

const searchClient = algoliasearch(
  '6KXGDAVGQ6',
  '7a0dfa53ae1d1f25a69f41220cf321d5'
);

const search = instantsearch({
  indexName: 'rstudio_crawler_products',
  searchClient,
});

search.addWidgets([
  instantsearch.widgets.configure({
    hitsPerPage: 3,
  }),
  instantsearch.widgets
    .index({indexName: 'rstudio_crawler_content', indexId: 'open_source'})
    .addWidgets([
      instantsearch.widgets.configure({
        hitsPerPage: 5,
        filters: 'subType:"Open Source"'
      }),
    ]),
  instantsearch.widgets
    .index({indexName: 'rstudio_crawler_content', indexId: 'customer_info'})
    .addWidgets([
      instantsearch.widgets.configure({
        hitsPerPage: 5,
        filters: 'subType:"Customer Info"'
      }),
    ]),
  instantsearch.widgets
    .index({indexName: 'rstudio_crawler_blog'})
    .addWidgets([
      instantsearch.widgets.configure({
        hitsPerPage: 5,
      }),
    ]),
  autocomplete({
    container: document.querySelector('#autocomplete'),
  }),
]);

search.start();
