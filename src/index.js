import './css/styles.css';
import { fetchCountries } from './js/fetchCountries';
import debounce from 'lodash.debounce';
import { Notify } from 'notiflix/build/notiflix-notify-aio';

const refs = {
  input: document.querySelector('#search-box'),
  countryList: document.querySelector('.country-list'),
  countryInfo: document.querySelector('.country-info'),
};

//--Необхідно застосувати прийом Debounce на обробнику події і робити HTTP-запит через 300мс після того, як користувач перестав вводити текст.
const DEBOUNCE_DELAY = 300;
refs.input.addEventListener('input', debounce(onInput, DEBOUNCE_DELAY));
let countries = [];

function onInput(event) {
  event.preventDefault();
  //прибираємо з введеного тексту пробіли з початку і з кінця
  let inputText = event.target.value.trim();
  //якщо користувач очистив поле, то очищаємо результати пошуку
  if(inputText===''){
    clear();
    return;
  }

  fetchCountries(inputText)
    .then(data=> {
      countries=data;
      if (countries.length >= 10) {
        return infoMeesage();
      }
      render(countries);
    })
    .catch(failMesaage);
}

const markupOneCountryList = ({ name, flags }) => {
  return `<li>
      <img src="${flags.svg}" class="oneCountryFlag-picture" alt="${name.official}"></img>
      <span class="OneCountryList-title">${name.official}</span>
    </li>`;
};

const markupCountryList = ({ name, flags }) => {
  return `<li>
      <img src="${flags.svg}" width=30; height=20; alt="${name.official}"></img>
      <span>${name.official}</span>
    </li>`;
};
const markupCountryInfo = ({ capital, population, languages }) => {
  return `<ul class="country-info-list">
    <li class="country-info-item"><p class="country-info-item-title">Capital:</p>${capital}</li>
    <li class="country-info-item"><p class="country-info-item-title">Population:</p>${population}</li>
    <li class="country-info-item"><p class="country-info-item-title">Languages:</p>${Object.values(languages).join(', ')}</li>
    </ul>`;
};
//Метод Object.values()повертає масив власних перерахованих значень властивостей даного об’єкта з рядковим ключем.

//додаємо данні в розмітку
function render(countries) {
  const country = countries.map(markupCountryList);
  const oneCountry = countries.map(markupOneCountryList);
  const countryInfo = countries.map(markupCountryInfo);

  if (countries.length === 1) {
    clear();
    refs.countryList.insertAdjacentHTML('beforeend', oneCountry.join(''));
    refs.countryInfo.insertAdjacentHTML('beforeend', countryInfo.join(''));
  } else {
    clear();
    refs.countryList.insertAdjacentHTML('beforeend', country.join(''));
  }
}

//--Якщо користувач повністю очищає поле пошуку, то HTTP-запит не виконується, а розмітка списку країн або інформації про країну зникає.
function clear() {
  refs.countryList.innerHTML = '';
  refs.countryInfo.innerHTML = '';
}
//--Якщо у відповіді бекенд повернув більше ніж 10 країн, в інтерфейсі з'являється повідомлення про те, що назва повинна бути специфічнішою.
function infoMeesage() {
  return Notify.info(
    'Too many matches found. Please enter a more specific name.'
  );
}
//--Якщо користувач ввів назву країни, якої не існує, бекенд поверне не порожній масив, а помилку зі статус кодом 404 - не знайдено.
function failMesaage() {
  return Notify.failure('Oops, there is no country with that name');
}
