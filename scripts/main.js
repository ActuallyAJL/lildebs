console.log("yum, yum, yum");

import { LoginForm } from "./auth/LoginForm.js";
import { RegisterForm } from "./auth/RegisterForm.js";
import { NavBar } from "./nav/NavBar.js";
import { SnackList } from "./snacks/SnackList.js";
import { SnackDetails } from "./snacks/SnackDetails.js";
import { Footer } from "./nav/Footer.js";
import {
  logoutUser,
  setLoggedInUser,
  loginUser,
  registerUser,
  getLoggedInUser,
  getSnacks,
  getSingleSnack,
  getSnackTopping,
  useSnackCollection,
  useToppingCollection,
  getToppings,
  getSnacksByTopping
} from "./data/apiManager.js";

const applicationElement = document.querySelector("#ldsnacks");
let toppingList = "";

//login/register listeners
applicationElement.addEventListener("click", (event) => {
  event.preventDefault();
  if (event.target.id === "login__submit") {
    //collect all the details into an object
    const userObject = {
      name: document.querySelector("input[name='name']").value,
      email: document.querySelector("input[name='email']").value,
    };
    loginUser(userObject).then((dbUserObj) => {
      if (dbUserObj) {
        sessionStorage.setItem("user", JSON.stringify(dbUserObj));
        startLDSnacks();
      } else {
        //got a false value - no user
        const entryElement = document.querySelector(".entryForm");
        entryElement.innerHTML = `<p class="center">That user does not exist. Please try again or register for your free account.</p> ${LoginForm()} <hr/> <hr/> ${RegisterForm()}`;
      }
    });
  } else if (event.target.id === "register__submit") {
    //collect all the details into an object
    const userObject = {
      name: document.querySelector("input[name='registerName']").value,
      email: document.querySelector("input[name='registerEmail']").value,
      isAdmin: false,
    };
    registerUser(userObject).then((dbUserObj) => {
      sessionStorage.setItem("user", JSON.stringify(dbUserObj));
      startLDSnacks();
    });
  }
});

applicationElement.addEventListener("click", (event) => {
  if (event.target.id === "logout") {
    logoutUser();
    sessionStorage.clear();
    checkForUser();
  }
});
// end login register listeners

// snack listeners
applicationElement.addEventListener("click", (event) => {
  event.preventDefault();

  if (event.target.id.startsWith("detailscake")) {
    const snackId = event.target.id.split("__")[1];
    let thisSnacksToppings;
    let thisSingleSnack;
    getSingleSnack(snackId).then((response1) => {
      thisSingleSnack = response1;
      getSnackTopping(snackId).then((response2) => {
        thisSnacksToppings = response2;
        showDetails(thisSingleSnack, thisSnacksToppings);
      });
    });
  }
});

applicationElement.addEventListener("click", (event) => {
  event.preventDefault();
  if (event.target.id === "allSnacks") {
    showSnackList();
  }
});

applicationElement.addEventListener('change' , (event) => {
  if (event.target.id === 'toppingDropdown') {
    showSnackListByTopping(event.target.value);
  }
});

const showDetails = (snackObj, snackToppingObj) => {
  const listElement = document.querySelector("#mainContent");
  listElement.innerHTML = SnackDetails(snackObj, snackToppingObj);
};
//end snack listeners

const checkForUser = () => {
  if (sessionStorage.getItem("user")) {
    setLoggedInUser(JSON.parse(sessionStorage.getItem("user")));
    startLDSnacks();
  } else {
    applicationElement.innerHTML = "";
    //show login/register
    showNavBar();
    showLoginRegister();
  }
};

const showLoginRegister = () => {
  //template strings can be used here too
  applicationElement.innerHTML += `${LoginForm()} <hr/> <hr/> ${RegisterForm()}`;
};

const showNavBar = (toppingList) => {
  applicationElement.innerHTML += NavBar(toppingList);
};

const showSnackList = () => {
  getSnacks().then((allSnacks) => {
    const listElement = document.querySelector("#mainContent");
    listElement.innerHTML = SnackList(allSnacks);
  });
};

const showSnackListByTopping = (toppingId) => {
  getSnacksByTopping(toppingId).then((theseSnacks) => {
    const listElement = document.querySelector("#mainContent");
    let thisSnackList = [];
    theseSnacks.forEach((aSnack) => {thisSnackList.push(aSnack.snack)});
    listElement.innerHTML = SnackList(thisSnackList);
  });
};

const showFooter = () => {
  applicationElement.innerHTML += Footer();
};

const startLDSnacks = () => {
  applicationElement.innerHTML = "";
  getToppings().then((toppingList) => {
    toppingList = useToppingCollection();
    showNavBar(toppingList);
    applicationElement.innerHTML += `<div id="mainContent"></div>`;
    showSnackList();
    showFooter();
  });
};

checkForUser();
