'use strict';

const CURRENT_CONTINUATION = (new URL(document.location)).searchParams.get("continuation");
const CONT_CACHE_KEY = `continuation_cache_${encodeURIComponent(window.location.pathname)}`;

function get_data(){
    return JSON.parse(sessionStorage.getItem(CONT_CACHE_KEY)) || [];
}

function save_data(){
    const prev_data = get_data();
    prev_data.push(CURRENT_CONTINUATION);

    sessionStorage.setItem(CONT_CACHE_KEY, JSON.stringify(prev_data));
}

function button_press(){
    let prev_data = get_data();
    if (!prev_data.length) return null;

    // Sanity check. Nowhere should the current continuation token exist in the cache 
    // but it can happen when using the browser's back feature. As such we'd need to travel
    // back to the point where the current continuation token first appears in order to 
    // account for the rewind.
    const conflict_at = prev_data.indexOf(CURRENT_CONTINUATION);
    if (conflict_at != -1) {
        prev_data.length = conflict_at;
    }

    const prev_ctoken = prev_data.pop();

    // On the first page, the stored continuation token is null.
    if (prev_ctoken === null) {
        sessionStorage.removeItem(CONT_CACHE_KEY);
        window.location.href = window.location.href.split('?')[0];

        return;
    }

    sessionStorage.setItem(CONT_CACHE_KEY, JSON.stringify(prev_data));

    window.location.href = `${window.location.pathname}?continuation=${prev_ctoken}`;
};

addEventListener('DOMContentLoaded', function(){
    const pagination_data = JSON.parse(document.getElementById('pagination-data').textContent);
    const next_page_containers = document.getElementsByClassName("page-next-container");

    for (let container of next_page_containers){
        const next_page_button = container.getElementsByClassName("pure-button")

        // exists?
        if (next_page_button.length > 0){
            next_page_button[0].addEventListener("click", save_data);
        }
    }

    // Only add previous page buttons when not on the first page
    if (CURRENT_CONTINUATION) {
        const prev_page_containers = document.getElementsByClassName("page-prev-container")

        for (let container of prev_page_containers) {
            if (pagination_data.is_locale_rtl) {
                container.innerHTML = `<button class="pure-button pure-button-secondary">${pagination_data.prev_page}&nbsp;&nbsp;<i class="icon ion-ios-arrow-forward"></i></button>`
            } else {
                container.innerHTML = `<button class="pure-button pure-button-secondary"><i class="icon ion-ios-arrow-back"></i>&nbsp;&nbsp;${pagination_data.prev_page}</button>`
            }
            container.getElementsByClassName("pure-button")[0].addEventListener("click", button_press);
        }
    }
});