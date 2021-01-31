require("trix");

export default function TDEditor(tdConfig) {
  this.tdConfig = tdConfig;
  const { holder, output, value } = this.tdConfig;

  let resetCaretPosition = -1;
  let slashTriggered = false;
  let searchKeyStartPosition = -1;
  let listIndex = 0;
  let listItemSelected = undefined;

  const targetEditor = document.querySelector(`#${holder}`);
  const initEditor = document.createElement("trix-editor");
  const inputField = document.createElement("input");

  const listItems = {
    heading1: "Heading",
    quote: "Blockquote",
    code: "Code",
    bullet: "Bulleted List",
    number: "Numbered List",
  };

  inputField.setAttribute("id", `${holder}-input`);
  inputField.setAttribute("type", "hidden");
  inputField.setAttribute("name", output);
  initEditor.setAttribute("input", `${holder}-input`);
  initEditor.classList.add("trix-content");

  undefined !== value && inputField.setAttribute("value", value);

  targetEditor.appendChild(inputField);
  targetEditor.appendChild(initEditor);

  const element = document.querySelectorAll(`#${holder} trix-editor`)[0];

  let makeHtmlElement = function (elementConfig) {
    let htmlElement = document.createElement(elementConfig.name);
    let key;

    for (key in elementConfig.properties) {
      htmlElement.setAttribute(key, elementConfig.properties[key]);
    }

    return htmlElement;
  };

  /**
   * load list related configuration at the time of editor initialize
   */
  let loadListParent = function () {
    let div = makeHtmlElement({
      name: "div",
      properties: {
        style: `display: none; border: 1px solid #ededed; border-radius: .4rem;`,
        id: `${holder}-list-item-root`,
        class: "trix-list-item-popup",
      },
    });

    let ul = makeHtmlElement({
      name: "ul",
      properties: {
        style: `list-style-type: none; padding-left: 0`,
        id: `${holder}-custom-list`,
      },
    });

    div.appendChild(ul);
    targetEditor.appendChild(div);
  };

  function itemListVisibility(isVisibile) {
    let listRoot = targetEditor.querySelector(`#${holder}-list-item-root`);

    isVisibile
      ? (listRoot.style.display = "")
      : (listRoot.style.display = "none");
  }

  /**
   * reset list item by deleting all child elements
   */
  function itemListReset() {
    let itemList = targetEditor.querySelector(`#${holder}-custom-list`);
    itemList.innerHTML = "";
  }

  function createListItem(item, value) {
    let liCreate;

    let bodyDiv = makeHtmlElement({
      name: "div",
      properties: {
        class: "trix-list-item-body-div",
      },
    });

    let iconDiv = makeHtmlElement({
      name: "div",
      properties: {
        class: `trix-list-item-${item}-svg trix-list-item-icon-preview`,
      },
    });

    let itemInfoDiv = makeHtmlElement({
      name: "div",
      properties: {
        class: "trix-list-item-info",
      },
    });

    itemInfoDiv.innerText = value;

    liCreate = makeHtmlElement({
      name: "li",
      properties: {
        id: item,
      },
    });

    // TODO
    // let ahref = makeHtmlElement({
    //   name: "a",
    //   properties: {
    //     onclick: "itemClickEvent(this)",
    //   },
    // });

    bodyDiv.appendChild(iconDiv);
    bodyDiv.appendChild(itemInfoDiv);
    // ahref.appendChild(bodyDiv); //TODO
    liCreate.appendChild(bodyDiv);

    return liCreate;
  }

  function searchItemList(keyString) {
    let itemList = targetEditor.querySelector(`#${holder}-custom-list`);
    let filter = keyString.toUpperCase();
    let itemArray = [],
      liCreate,
      item;

    popupReposition();
    itemListVisibility(true);

    itemList.innerHTML = "";

    for (item in listItems) {
      let value = listItems[item].trim().toUpperCase();
      if (value.indexOf(filter) > -1) {
        liCreate = createListItem(item, value);
        itemArray.push(liCreate);
      }
    }

    if (itemArray.length > 0) {
      itemArray[0].classList.add("trix-toolbar-attribute-selected");
      listItemSelected = itemArray[0];
      for (let i = 0; i < 5; i++) {
        if (itemArray.length === i) break;
        itemList.appendChild(itemArray[i]);
      }
    } else {
      listItemSelected = undefined;
      itemListVisibility(false);
    }
  }

  function activateListItem() {
    if (undefined !== listItemSelected) {
      element.editor.canActivateAttribute(listItemSelected.id) &&
        element.editor.activateAttribute(listItemSelected.id);
    }
  }

  /**
   * traver through list item by arrow keys
   */
  function travelItemList(pressedKey) {
    let itemList = targetEditor
      .querySelector(`#${holder}-custom-list`)
      .getElementsByTagName("li");
    let itemLength = itemList.length;
    let nextChild;

    if (!itemLength) return null;

    if ("ArrowUp" === pressedKey || "ArrowRight" === pressedKey) {
      listIndex--;

      listItemSelected.classList.remove("trix-toolbar-attribute-selected");
      nextChild = itemList[listIndex];

      if (undefined !== nextChild && listIndex >= 0) {
        listItemSelected = nextChild;
      } else {
        listIndex = itemLength - 1;
        listItemSelected = itemList[itemLength - 1];
      }

      listItemSelected.classList.add("trix-toolbar-attribute-selected");
    } else {
      listIndex++;

      listItemSelected.classList.remove("trix-toolbar-attribute-selected");
      nextChild = itemList[listIndex];

      if (undefined !== nextChild && listIndex < itemLength) {
        listItemSelected = nextChild;
      } else {
        listIndex = 0;
        listItemSelected = itemList[0];
      }

      listItemSelected.classList.add("trix-toolbar-attribute-selected");
    }
  }

  /**
   * if slash is deleted by pressing backspace then reset
   * otherwise search for the key
   */
  let searchKey = function () {
    let documentTextElement = element.innerText;
    if ("/" !== documentTextElement[searchKeyStartPosition]) {
      searchKeyStartPosition = -1;

      slashTriggered = false;
      itemListReset();
      itemListVisibility(false);
      return;
    }
    let caretPosition = element.editor.getSelectedRange()[0];

    let keyString = documentTextElement.slice(
      searchKeyStartPosition + 1,
      caretPosition
    );
    searchItemList(keyString);
  };

  /**
   * allowed if editor is empty or previous character of slash is a newline
   * returns the slash position if allowed, -1 otherwise
   */
  let isSlashAllowed = function () {
    let documentTextElement = element.innerText;
    let slashPosition = element.editor.getSelectedRange()[0] - 1;

    return 0 === slashPosition ||
      "\n" === documentTextElement[slashPosition - 1]
      ? slashPosition
      : -1;
  };

  /**
   * if slash is triggered then,
   * reset slash by deleting the slash and search key
   * reset slash trigger
   */
  let slashReset = function () {
    if (slashTriggered) {
      element.editor.setSelectedRange([
        searchKeyStartPosition,
        element.editor.getSelectedRange()[0],
      ]);

      element.editor.deleteInDirection("forward");

      searchKeyStartPosition = -1;
      slashTriggered = false;
    }
  };

  let popupReposition = function () {
    // popup absolute view
    let listRoot = targetEditor.querySelector(`#${holder}-list-item-root`);

    let carret_range = element.editor.getClientRectAtPosition(
      element.editor.getSelectedRange()[0]
    );
    let diff = window.innerHeight - carret_range.y;
    if (diff < 400) {
      if (carret_range !== undefined) {
        listRoot.style.left = 10 + carret_range.left + "px";
        listRoot.style.top = -(400 - diff) + carret_range.top + "px";
      }
    } else {
      if (carret_range !== undefined) {
        listRoot.style.left = 10 + carret_range.left + "px";
        listRoot.style.top = 10 + carret_range.top + "px";
      }
    }
  };

  function isAllowedCharacter(char) {
    if (
      (1 === char.length && char.match(/[a-z]/i)) ||
      "Backspace" === char ||
      "" === char
    ) {
      return true;
    }
    return false;
  }

  /* 
        if slash is allowed, then
        searchKeyStartPosition is set after slash character
        searchItemList to initial the list popup

        otherwise if slash is triggered then,
        send the search key and reset the traverse variable for list item
  */
  function handleKeyUpPress(pressedKey) {
    if ("/" === pressedKey) {
      slashTriggered
        ? (itemListReset(),
          itemListVisibility(false),
          (listIndex = 0),
          (slashTriggered = false))
        : undefined;

      let result = isSlashAllowed();
      -1 !== result
        ? ((searchKeyStartPosition = result),
          (slashTriggered = true),
          searchItemList(""))
        : undefined;
    } else {
      slashTriggered && isAllowedCharacter(pressedKey)
        ? (searchKey(), (listIndex = 0))
        : undefined;
    }
  }

  /**
   * if enter pressed and also slash is triggered then,
   * select item from the list item
   * reset slash, itemlist and active functionality
   *
   * if arrow event occured then,
   * travel through the list item
   */
  function handleKeyDownPress(event) {
    if ("Enter" === event.key) {
      slashTriggered
        ? (event.preventDefault(),
          event.stopPropagation(),
          slashReset(),
          itemListReset(),
          itemListVisibility(false),
          activateListItem(),
          (listIndex = 0))
        : undefined;
    } else if (
      "ArrowUp" === event.key ||
      "ArrowDown" === event.key ||
      "ArrowLeft" === event.key ||
      "ArrowRight" === event.key
    ) {
      slashTriggered
        ? (event.preventDefault(),
          event.stopPropagation(),
          element.editor.setSelectedRange([
            resetCaretPosition,
            resetCaretPosition,
          ]),
          travelItemList(event.key))
        : undefined;
    }
  }

  addEventListener("trix-initialize", function (event) {
    console.log("Awesome! editor is ready to use!");
    loadListParent();
  });

  addEventListener("trix-blur", function (event) {
    slashTriggered
      ? (event.preventDefault(),
        event.stopPropagation(),
        slashReset(),
        itemListReset(),
        itemListVisibility(false),
        (listIndex = 0))
      : undefined;
  });

  element.addEventListener("keyup", function (event) {
    handleKeyUpPress(event.key.trim());
  });

  element.addEventListener("keydown", function (event) {
    resetCaretPosition = element.editor.getSelectedRange()[0];
    handleKeyDownPress(event);
  });

  return {
    element,
  };
}

//initiate demo

// const test = new TrixJS({
//     holder: "trix",
//     output: "trix-output",
//     value: "",
// });
