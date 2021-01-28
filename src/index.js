let TrixJS = function (trixConfig) {
    this.holder = trixConfig.holder;
    this.inputId = trixConfig.inputId;
    this.value = trixConfig.value;

    let resetCaretPosition = -1;
    let slashTriggered = false;
    let searchKeyStartPosition = -1;
    let listIndex = 0;
    let listItemSelected = undefined;

    const targetEditor = document.querySelector('#' + this.holder);
    const initEditor = document.createElement('trix-editor');
    const inputField = document.createElement('input');

    const listItems = {
        heading1: "Heading",
        quote: "Quote",
        code: "Code",
        bullet: "Bullet List",
        number: "Numbered List",
    }

    inputField.setAttribute('id', this.holder + "-input");
    inputField.setAttribute('type', 'hidden');
    inputField.setAttribute('value', this.value);
    inputField.setAttribute('name', "content");
    initEditor.setAttribute('input', this.holder + "-input");

    targetEditor.appendChild(inputField);
    targetEditor.appendChild(initEditor);

    const element = document.querySelectorAll("#" + this.holder + " trix-editor")[0];


    let makeHtmlElement = function (elementConfig) {
        let htmlElement = document.createElement(elementConfig.name);
        for (key in elementConfig.properties) {
            htmlElement.setAttribute(key, elementConfig.properties[key]);
        }

        return htmlElement;
    }

    let loadListParent = function () {
        let div = makeHtmlElement({
            name: "div",
            properties: {
                style: `border: 1px solid #ededed; border-radius: .4rem; max-height: 190px; max-width: 200px;`,

            }
        });

        let ul = makeHtmlElement({
            name: "ul",
            properties: {
                style: `list-style-type: none; padding-left: 0`,
            }
        });

        div.appendChild(ul);
        targetEditor.appendChild(div);
    }

    function itemListReset() {
        let itemList = targetEditor.querySelector("ul");
        itemList.innerHTML = "";
    }

    function searchItemList(keyString) {
        let itemList = targetEditor.querySelector("ul");
        let filter = keyString.toUpperCase();
        let itemArray = [], liCreate, i = 0;
        itemList.innerHTML = "";

        for (item in listItems) {
            let value = listItems[item].trim().toUpperCase();
            if (value.indexOf(filter) > -1) {

                liCreate = makeHtmlElement({
                    name: "li",
                    properties: {
                        id: item,
                    }
                });
                liCreate.innerText = value;
                itemArray.push(liCreate);
            }
        }

        if (itemArray.length > 0) {
            itemArray[0].classList.add("selected");
            listItemSelected = itemArray[0];
            for (i = 0; i < itemArray.length; i++) {
                itemList.appendChild(itemArray[i]);
            }
        }
        else listItemSelected = undefined;
    }

    function travelItemList(pressedKey) {
        console.log("traveling");
        let itemList = targetEditor.querySelector("ul").getElementsByTagName('li');
        let itemLength = itemList.length;
        let nextChild;

        if (!itemLength) return null;

        if ("ArrowUp" === pressedKey || "ArrowRight" === pressedKey) {
            listIndex--;

            listItemSelected.classList.remove("selected");
            nextChild = itemList[listIndex];

            if (undefined !== nextChild && listIndex >= 0) {
                listItemSelected = nextChild;
            }
            else {
                listIndex = itemLength - 1;
                listItemSelected = itemList[itemLength - 1];
            }

            listItemSelected.classList.add("selected");
        }
        else {
            listIndex++;

            listItemSelected.classList.remove("selected");
            nextChild = itemList[listIndex];

            if (undefined !== nextChild && listIndex < itemLength) {
                listItemSelected = nextChild;
            }
            else {
                listIndex = 0;
                listItemSelected = itemList[0];
            }

            listItemSelected.classList.add("selected");
        }
    }

    let searchKey = function () {
        let documentTextElement = element.innerText;
        if ("/" !== documentTextElement[searchKeyStartPosition]) {
            searchKeyStartPosition = -1;
            slashTriggered = false;
        }
        let caretPosition = element.editor.getSelectedRange()[0];

        keyString = documentTextElement.slice(searchKeyStartPosition + 1, caretPosition);
        searchItemList(keyString.trim());
        console.log('~~~', keyString, documentTextElement[searchKeyStartPosition]);
    }

    let isSlashAllowed = function () {
        let documentTextElement = element.innerText;
        let slashPosition = element.editor.getSelectedRange()[0] - 1;

        return (0 === slashPosition || '\n' === documentTextElement[slashPosition - 1]) ? slashPosition : -1;
    }

    let slashReset = function () {
        if (slashTriggered) {
            element.editor.setSelectedRange([
                searchKeyStartPosition,
                element.editor.getSelectedRange()[0]
            ]);

            element.editor.deleteInDirection("forward");

            searchKeyStartPosition = -1;
            slashTriggered = false;
        }
    }

    function isCharacter(char) {
        return (1 === char.length && char.match(/[a-z]/i)) || "Backspace" === char;
    }

    let handleKeyUpPress = function (pressedKey) {
        console.log(pressedKey);

        if ('/' === pressedKey) {
            let result = isSlashAllowed();
            -1 !== result ? (
                searchKeyStartPosition = result,
                slashTriggered = true,
                itemListPopupTrigger = true,
                searchItemList("")
            ) : undefined;
        }
        else if ('' === pressedKey) {
            slashTriggered ? (
                itemListReset(),
                listIndex = 0
            ) : undefined;
        }
        else {
            slashTriggered && isCharacter(pressedKey) ? searchKey() : undefined;
        }
    }

    function handleKeyDownPress(event) {
        if ('Enter' === event.key) {
            slashTriggered ? (
                event.preventDefault(),
                event.stopPropagation(),
                slashReset(),
                itemListReset(),
                listIndex = 0
            ) : undefined;

            console.log(listItemSelected);
        }
        else if (
            "ArrowUp" === event.key || "ArrowDown" === event.key ||
            "ArrowLeft" === event.key || "ArrowRight" === event.key
        ) {
            slashTriggered ? (
                event.preventDefault(),
                event.stopPropagation(),
                element.editor.setSelectedRange([resetCaretPosition, resetCaretPosition]),
                travelItemList(event.key)
            ) : undefined;
        }
    }

    addEventListener("trix-initialize", function (event) {
        console.log("editor is ready to use");
        loadListParent();
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
    }
};

const test = new TrixJS({
    holder: "trix",
    value: "<h1>hello</h1>",
});