const cars = [
  {
    make: "Honda",
    image: "images/honda-accord-2005.jpg",
    model: "Accord",
    year: 2005,
    price: 7000,
  },
  {
    make: "Honda",
    image: "images/honda-accord-2008.jpg",
    model: "Accord",
    year: 2008,
    price: 11000,
  },
  {
    make: "Toyota",
    image: "images/toyota-camry-2009.jpg",
    model: "Camry",
    year: 2009,
    price: 12500,
  },
  {
    make: "Toyota",
    image: "images/toyota-corrolla-2016.jpg",
    model: "Corolla",
    year: 2016,
    price: 15000,
  },
  {
    make: "Suzuki",
    image: "images/suzuki-swift-2014.jpg",
    model: "Swift",
    year: 2014,
    price: 9000,
  },
  {
    make: "Audi",
    image: "images/audi-a4-2013.jpg",
    model: "A4",
    year: 2013,
    price: 25000,
  },
  {
    make: "Audi",
    image: "images/audi-a4-2013.jpg",
    model: "A4",
    year: 2013,
    price: 26000,
  },
];

function toOptionJSON(label, obj) {
  return {
    options: Object.keys(obj).map((name) => {
      return { name, label };
    }),
  };
}

function filterObject(object, callback) {
  let obj = {};
  let val;
  for (let key in object) {
    if (val = callback(key, object[key])) {
      obj[key] = val;
    }
  }
  return obj;
}

class CarFilter {
  constructor(carList) {
    this.makes = {};
    this.years = {};
    this.models = {};
    this.prices = {};
    this.carList = carList;
    this.templates = {};
    this.registerTemplates();
    this.displayCars(cars);
    this.initializeFilter();
    this.bindEventHandlers();
  }

  bindEventHandlers() {
    $("header form").submit(this.filterCars.bind(this));
    $("select").change(this.filterOptions.bind(this));
  }

  registerTemplates() {
    $.each($('script[type="text/x-handlebars"]'), (_, template) => {
      if (template.className === "partial") {
        Handlebars.registerPartial(
          `${$(template).attr("id")}`,
          $(template).html()
        );
      } else {
        this.templates[$(template).attr("id")] = Handlebars.compile(
          $(template).html()
        );
      }
    });
  }

  displayCars(list) {
    if (list.length === 0) {
      $("main").html("<h1>No Results Were Found...</h1>");
    } else {
      $("main").html(this.templates["cars"]({ cars: list }));
    }
  }

  initializeFilter() {
    this.carList.forEach(({ make, year, model, price }) => {
      this.makes[make] ||= [];
      this.years[year] ||= [];
      this.models[model] ||= [];
      this.prices[price] ||= [];

      this.makes[make].push({ year, model, price });
      this.models[model].push({ year, make, price });
      this.years[year].push({ make, model, price });
      this.prices[price].push({ year, model, make });
    });

    this.addOptions(this.makes, this.models, this.years, this.prices);
  }

  addOptions(make, model, year, price) {
    this.createOptions("make", make);
    this.createOptions("model", model);
    this.createOptions("year", year);
    this.createOptions("price", price);
  }

  createOptions(id, obj) {
    $(`#${id}`).html(this.templates["options"](toOptionJSON(id, obj)));
  }

  filterCars(event) {
    event.preventDefault();

    let filters = this.findFilters();

    let selections = cars.filter(function (car) {
      return filters.every(({ filter, value }) => {
        return String(car[filter]) === value;
      });
    });

    this.displayCars(selections);
  }

  filterOptions(event) {
    let selector = $(event.target).attr('id');
    let value = $(event.target).val();

    // if (selector !== 'make') return;

    const filterFunction = (k, v) => {
      let options = v.filter((obj) => obj[String(selector)] === value);
      return options.length > 0 ? options : false;
    };

    let makes;
    let models;
    let years;
    let prices;

    if (value) {
      makes = filterObject(this.makes, filterFunction);
      models = filterObject(this.models, filterFunction);
      years = filterObject(this.years, filterFunction);
      prices = filterObject(this.prices, filterFunction);
    } else {
      makes = filterObject(this.makes, () => this.makes );
      models = filterObject(this.models, () => this.models );
      years = filterObject(this.years, () => this.years );
      prices = filterObject(this.prices, () => this.prices );

      this.createOptions('make', makes);
      this.createOptions('model', models);
      this.createOptions('year', years);
      this.createOptions('price', prices);
      return;
    }

    switch (selector) {
      case 'make':
        this.createOptions('model', models);
        this.createOptions('year', years);
        this.createOptions('price', prices);
        break;
    }
  }

  findFilters() {
    let make = { filter: "make", value: $("#make").val() };
    let model = { filter: "model", value: $("#model").val() };
    let year = { filter: "year", value: $("#year").val() };
    let price = { filter: "price", value: $("#price").val() };

    return [make, model, year, price].filter((val) => !!val.value);
  }
}

$(() => new CarFilter(cars));
