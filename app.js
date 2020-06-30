// set initial variables for Tableau
const url = "yourURL";
const vizContainer = document.getElementById("vizContainer");
const options = {
  device: "desktop",
  height: "1000px",
  width: "1000px",
  hideToolbar: true,
  onFirstInteractive: () => {
    // set the filters array to none on initial load
    document.getElementById("filtersApplied").innerText = "None";
  },
};
let viz;

// store the filters applied
let filters = [];

// loop over the filters and display

function addToFilterList(value) {
  if (value !== "Clear") {
    filters.push(value);
    // make sure we only get unique values in the filter array, prevents clicking twice on the same filter
    let uniqueFilterList = [...new Set(filters)];
    if (document.getElementById("filtersApplied").innerText == "None") {
      document.getElementById("filtersApplied").innerText = "";
    }
    document.getElementById(
      "filtersApplied"
    ).innerText = `${uniqueFilterList.toString()}`;
  } else {
    filters = [];
    document.getElementById("filtersApplied").innerText = "None";
  }
}

// grab the spans for filtering single values
document.querySelectorAll(".singleValue").forEach((filter) => {
  filter.addEventListener("click", (e) =>
    singleFilter(
      e.target.getAttribute("data-filterValue"),
      e.target.getAttribute("data-filterSheet"),
      e.target.getAttribute("data-filterName")
    )
  );
});

function singleFilter(value, sheet, filterName) {
  // apply filter on sheet level - first need to drill through the workbook to get there
  const sheetToFilter = viz
    .getWorkbook()
    .getActiveSheet()
    .getWorksheets()
    .get(sheet);

  // filter the specified sheet and add value to the list of filters
  sheetToFilter
    .applyFilterAsync(filterName, value, tableau.FilterUpdateType.REPLACE)
    .then(() => addToFilterList(value));
}

// grab the span for date filtering
document.querySelectorAll(".dateValue").forEach((filter) => {
  filter.addEventListener("click", (e) => {
    dateFilter(
      e.target.getAttribute("data-filterValue"),
      e.target.getAttribute("data-filterSheet"),
      e.target.getAttribute("data-filterName")
    );
  });
});

function dateFilter(value, sheet, filterName) {
  const sheetToFilter = viz
    .getWorkbook()
    .getActiveSheet()
    .getWorksheets()
    .get(sheet);

  // split the data attribute in to month and year
  // 2019-9 into [2019,1]
  const dateArray = value.split("-");
  const firstDay = new Date(
    dateArray[0].toString(),
    dateArray[1].toString() - 1,
    1
  );
  const lastDay = new Date(dateArray[0].toString(), dateArray[1].toString(), 0);

  // create object to apply date filtering to
  const dateObject = {
    min: firstDay,
    max: lastDay,
  };

  console.log(dateObject);

  sheetToFilter
    .applyRangeFilterAsync(filterName, dateObject)
    .then(() => addToFilterList(value));
}

// clear the filtering
document.getElementById("clearFilterBtn").addEventListener("click", () => {
  // revet to initial state and remove the list of filters in the title
  viz.revertAllAsync();
  addToFilterList("Clear");

  // const clearSheetFilter = viz
  //   .getWorkbook()
  //   .getActiveSheet()
  //   .getWorksheets()
  //   .get("Sales by Segment");
  // clearSheetFilter.clearFilterAsync("Segment").then(() => {
  //   console.log("Cleared the filter!");
  //   addToFilterList("Clear");
  // });
});

// Creat function that loads the viz
function initViz() {
  viz = new tableau.Viz(vizContainer, url, options);
}

// listen when document is ready
document.addEventListener("DOMContentLoaded", initViz);

// modal stuff

const modal = document.querySelector(".modal");
// const trigger = document.querySelector(".trigger");
const closeButton = document.querySelector(".close-button");

function toggleModal() {
  modal.classList.toggle("show-modal");
}

function windowOnClick(event) {
  if (event.target === modal) {
    toggleModal();
  }
}

// trigger.addEventListener("click", toggleModal);
closeButton.addEventListener("click", toggleModal);
// window.addEventListener("click", windowOnClick);
